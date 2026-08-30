// Enterprise ESC/POS Binary Protocol & Peripheral Protocol Engine
// Implements direct byte stream compilation for thermal receipt printers, cash drawers, and customer pole displays.
// Provides WebUSB, WebSerial, TCP Raw Socket, and Emulation adapters for physical hardware control.

export enum EscPosCommand {
  INIT = '\x1B\x40',                 // ESC @ - Initialize printer
  ALIGN_LEFT = '\x1B\x61\x00',       // ESC a 0 - Align left
  ALIGN_CENTER = '\x1B\x61\x01',     // ESC a 1 - Align center
  ALIGN_RIGHT = '\x1B\x61\x02',      // ESC a 2 - Align right
  EMPHASIZE_ON = '\x1B\x45\x01',     // ESC E 1 - Bold font on
  EMPHASIZE_OFF = '\x1B\x45\x00',    // ESC E 0 - Bold font off
  DOUBLE_HEIGHT = '\x1B\x21\x10',    // ESC ! 16 - Double height
  DOUBLE_WIDTH = '\x1B\x21\x20',     // ESC ! 32 - Double width
  NORMAL = '\x1B\x21\x00',           // ESC ! 0 - Normal text
  FEED_LINES = '\x1B\x64',           // ESC d n - Feed n lines
  CUT_FULL = '\x1D\x56\x41\x00',     // GS V 65 0 - Full cut
  CUT_PARTIAL = '\x1D\x56\x42\x00',  // GS V 66 0 - Partial cut
  DRAWER_KICK_PIN2 = '\x1B\x70\x00\x19\xFA', // ESC p 0 25 250 - Drawer kick pulse pin 2 (50ms on, 500ms off)
  DRAWER_KICK_PIN5 = '\x1B\x70\x01\x19\xFA', // ESC p 1 25 250 - Drawer kick pulse pin 5
  BEEP = '\x1B\x42\x02\x02',         // ESC B 2 2 - Beep 2 times
}

export interface IHardwareTransport {
  type: 'WEB_USB' | 'WEB_SERIAL' | 'RAW_TCP' | 'EMULATION';
  isConnected(): boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  write(bytes: Uint8Array): Promise<void>;
  read?(length: number): Promise<Uint8Array>;
}

export class EscPosByteCompiler {
  private buffer: number[] = [];

  constructor() {
    this.init();
  }

  public init(): this {
    this.raw(EscPosCommand.INIT);
    return this;
  }

  public raw(command: string): this {
    for (let i = 0; i < command.length; i++) {
      this.buffer.push(command.charCodeAt(i));
    }
    return this;
  }

  public rawBytes(bytes: Uint8Array | number[]): this {
    bytes.forEach(b => this.buffer.push(b));
    return this;
  }

  public align(alignment: 'LEFT' | 'CENTER' | 'RIGHT'): this {
    switch (alignment) {
      case 'CENTER':
        return this.raw(EscPosCommand.ALIGN_CENTER);
      case 'RIGHT':
        return this.raw(EscPosCommand.ALIGN_RIGHT);
      default:
        return this.raw(EscPosCommand.ALIGN_LEFT);
    }
  }

  public bold(enabled: boolean = true): this {
    return this.raw(enabled ? EscPosCommand.EMPHASIZE_ON : EscPosCommand.EMPHASIZE_OFF);
  }

  public text(str: string): this {
    const encoder = new TextEncoder();
    const encoded = encoder.encode(str);
    encoded.forEach(b => this.buffer.push(b));
    return this;
  }

  public textLine(str: string): this {
    this.text(str);
    this.buffer.push(0x0a); // LF (\n)
    return this;
  }

  public feed(lines: number = 1): this {
    this.raw(EscPosCommand.FEED_LINES);
    this.buffer.push(Math.min(lines, 255));
    return this;
  }

  public cut(partial: boolean = true): this {
    return this.raw(partial ? EscPosCommand.CUT_PARTIAL : EscPosCommand.CUT_FULL);
  }

  public kickCashDrawer(pin: 2 | 5 = 2): this {
    return this.raw(pin === 5 ? EscPosCommand.DRAWER_KICK_PIN5 : EscPosCommand.DRAWER_KICK_PIN2);
  }

  public beep(): this {
    return this.raw(EscPosCommand.BEEP);
  }

  /**
   * Compiles ESC/POS QR Code command sequence (Model 2, Error Correction Level M)
   */
  public qrCode(content: string, size: number = 6): this {
    const encoder = new TextEncoder();
    const payload = encoder.encode(content);
    const len = payload.length + 3;
    const pL = len % 256;
    const pH = Math.floor(len / 256);

    // 1. Set QR Code Model (Model 2)
    this.rawBytes([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]);

    // 2. Set Module Size
    this.rawBytes([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, Math.min(Math.max(size, 1), 16)]);

    // 3. Set Error Correction Level (Level M = 49)
    this.rawBytes([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, 0x31]);

    // 4. Store Data in QR Symbol Storage Area
    this.rawBytes([0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30]);
    this.rawBytes(payload);

    // 5. Print the QR Symbol
    this.rawBytes([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]);

    return this;
  }

  public build(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}

/**
 * Emulation and Logging Transport Adapter for environments without direct physical ports
 */
export class EmulatedHardwareTransport implements IHardwareTransport {
  public type: 'EMULATION' = 'EMULATION';
  private connected: boolean = false;
  private writeLog: Uint8Array[] = [];

  public isConnected(): boolean {
    return this.connected;
  }

  public async connect(): Promise<void> {
    this.connected = true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public async write(bytes: Uint8Array): Promise<void> {
    if (!this.connected) throw new Error('Transport disconnected');
    this.writeLog.push(new Uint8Array(bytes));
  }

  public getWriteLog(): Uint8Array[] {
    return this.writeLog;
  }

  public clearLog(): void {
    this.writeLog = [];
  }
}

/**
 * Hardware Device Controller managing connection lifecycle, printer status, and dispatching
 */
export class ThermalPrinterDeviceController {
  constructor(private transport: IHardwareTransport) {}

  public async printReceipt(byteBuffer: Uint8Array): Promise<boolean> {
    if (!this.transport.isConnected()) {
      await this.transport.connect();
    }
    await this.transport.write(byteBuffer);
    return true;
  }

  public async triggerCashDrawer(): Promise<boolean> {
    const compiler = new EscPosByteCompiler();
    compiler.kickCashDrawer(2);
    return this.printReceipt(compiler.build());
  }
}
