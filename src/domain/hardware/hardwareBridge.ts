// Hardware Bridge & Peripheral Control (ESC/POS Thermal Printer, Scale, Cash Drawer, Barcode, CFD)
import { EscPosByteCompiler, ThermalPrinterDeviceController, EmulatedHardwareTransport } from './escposProtocol';

export const globalHardwareTransport = new EmulatedHardwareTransport();
export const globalPrinterController = new ThermalPrinterDeviceController(globalHardwareTransport);

export interface ScaleReading {
  weightKg: number;
  tareKg: number;
  netWeightKg: number;
  isStable: boolean;
  status: 'CONNECTED' | 'DISCONNECTED' | 'OVERLOAD';
}

export interface HardwareStatus {
  printer: {
    status: 'ONLINE' | 'PAPER_OUT' | 'OFFLINE';
    model: string;
    ip: string;
    paperWidthMm: number;
  };
  scale: ScaleReading;
  cashDrawer: {
    isOpen: boolean;
    lastOpenedAt?: string;
  };
  barcodeScanner: {
    status: 'READY' | 'BUSY';
    lastScannedBarcode?: string;
  };
  customerDisplay: {
    connected: boolean;
    activeText: string;
    subtotalText: string;
  };
}

export interface HardwareEvent {
  timestamp: string;
  type: string;
  payload: any;
}

class HardwareBridgeBus {
  private status: HardwareStatus = {
    printer: {
      status: 'ONLINE',
      model: 'Epson TM-T88VI (ESC/POS)',
      ip: '192.168.1.150',
      paperWidthMm: 80,
    },
    scale: {
      weightKg: 0.45,
      tareKg: 0.05,
      netWeightKg: 0.40,
      isStable: true,
      status: 'CONNECTED',
    },
    cashDrawer: {
      isOpen: false,
    },
    barcodeScanner: {
      status: 'READY',
    },
    customerDisplay: {
      connected: true,
      activeText: 'Welcome to Omni Restaurant!',
      subtotalText: 'SAR 0.00',
    },
  };

  private listeners: ((status: HardwareStatus) => void)[] = [];
  private barcodeListeners: ((code: string) => void)[] = [];
  private eventListeners: ((event: HardwareEvent) => void)[] = [];

  constructor() {
    // Listen for global keyboard barcode emulation if needed
  }

  public getStatus(): HardwareStatus {
    return { ...this.status };
  }

  public onEvent(fn: (event: HardwareEvent) => void) {
    this.eventListeners.push(fn);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== fn);
    };
  }

  private emitEvent(type: string, payload: any) {
    const event: HardwareEvent = {
      timestamp: new Date().toISOString(),
      type,
      payload,
    };
    this.eventListeners.forEach(fn => fn(event));
  }

  public subscribe(fn: (status: HardwareStatus) => void) {
    this.listeners.push(fn);
    fn(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  public onBarcodeScan(fn: (code: string) => void) {
    this.barcodeListeners.push(fn);
    return () => {
      this.barcodeListeners = this.barcodeListeners.filter(l => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.getStatus()));
  }

  // Trigger Cash Drawer Kick using ESC/POS byte sequence
  public openCashDrawer(reason: string = 'Sale / Pay Out') {
    this.status.cashDrawer.isOpen = true;
    this.status.cashDrawer.lastOpenedAt = new Date().toISOString();
    this.notify();
    this.emitEvent('CASH_DRAWER_KICK', { reason, status: 'OPEN' });

    // Send binary pulse command to physical or emulated transport
    globalPrinterController.triggerCashDrawer().catch(() => {});

    // Auto close simulation after 4 seconds
    setTimeout(() => {
      this.status.cashDrawer.isOpen = false;
      this.notify();
      this.emitEvent('CASH_DRAWER_CLOSE', { status: 'CLOSED' });
    }, 4000);
  }

  // Update Scale reading
  public setScaleWeight(grossKg: number, tareKg: number = 0.05) {
    const net = Math.max(0, grossKg - tareKg);
    this.status.scale = {
      weightKg: Number(grossKg.toFixed(3)),
      tareKg: Number(tareKg.toFixed(3)),
      netWeightKg: Number(net.toFixed(3)),
      isStable: true,
      status: 'CONNECTED',
    };
    this.notify();
    this.emitEvent('SCALE_WEIGHT_CHANGED', { grossKg, tareKg, netWeightKg: net });
  }

  // Simulate Barcode Trigger
  public triggerBarcodeScan(barcode: string) {
    this.status.barcodeScanner.lastScannedBarcode = barcode;
    this.notify();
    this.barcodeListeners.forEach(fn => fn(barcode));
    this.emitEvent('BARCODE_SCANNED', { barcode });
  }

  // Update Customer Facing Display
  public updateCustomerDisplay(activeText: string, subtotalText: string) {
    this.status.customerDisplay.activeText = activeText;
    this.status.customerDisplay.subtotalText = subtotalText;
    this.notify();
    this.emitEvent('CUSTOMER_DISPLAY_UPDATED', { activeText, subtotalText });
  }


  // Compiles exact binary ESC/POS byte sequence for thermal printer dispatch
  public compileBinaryReceipt(order: {
    orderNumber: string;
    branchNameAr: string;
    branchNameEn: string;
    vatNumber: string;
    cashierName: string;
    items: { nameAr: string; nameEn: string; quantity: number; unitPrice: number; totalPrice: number }[];
    subtotal: number;
    discount: number;
    vatAmount: number;
    total: number;
    paymentMethod: string;
    dateStr: string;
    zatcaQrPayload?: string;
  }): Uint8Array {
    const compiler = new EscPosByteCompiler();
    compiler
      .init()
      .align('CENTER')
      .bold(true)
      .textLine(order.branchNameAr)
      .textLine(order.branchNameEn)
      .bold(false)
      .textLine(`VAT: ${order.vatNumber}`)
      .textLine('------------------------------------------')
      .align('LEFT')
      .textLine(`Invoice: ${order.orderNumber}`)
      .textLine(`Date   : ${order.dateStr}`)
      .textLine(`Cashier: ${order.cashierName}`)
      .textLine('------------------------------------------')
      .textLine('Item                 Qty   Price   Total')
      .textLine('------------------------------------------');

    order.items.forEach(item => {
      const name = (item.nameAr || item.nameEn).padEnd(18).substring(0, 18);
      const qty = item.quantity.toString().padStart(4);
      const price = item.unitPrice.toFixed(2).padStart(7);
      const total = item.totalPrice.toFixed(2).padStart(8);
      compiler.textLine(`${name} ${qty} ${price} ${total}`);
    });

    compiler
      .textLine('------------------------------------------')
      .align('RIGHT')
      .textLine(`Subtotal: SAR ${order.subtotal.toFixed(2)}`);

    if (order.discount > 0) {
      compiler.textLine(`Discount: -SAR ${order.discount.toFixed(2)}`);
    }

    compiler
      .textLine(`VAT (15%): SAR ${order.vatAmount.toFixed(2)}`)
      .bold(true)
      .textLine(`TOTAL: SAR ${order.total.toFixed(2)}`)
      .bold(false)
      .textLine(`Payment: ${order.paymentMethod}`)
      .textLine('------------------------------------------')
      .align('CENTER');

    if (order.zatcaQrPayload) {
      compiler.qrCode(order.zatcaQrPayload, 6);
    }

    compiler
      .feed(2)
      .textLine('Thank you for your visit!')
      .textLine('شكراً لزيارتكم')
      .feed(3)
      .cut(true);

    return compiler.build();
  }

  // ESC/POS Formatter to generate formatted raw text/thermal layout
  public formatEscPosReceipt(order: {
    orderNumber: string;
    branchNameAr: string;
    branchNameEn: string;
    vatNumber: string;
    cashierName: string;
    items: { nameAr: string; nameEn: string; quantity: number; unitPrice: number; totalPrice: number }[];
    subtotal: number;
    discount: number;
    vatAmount: number;
    total: number;
    paymentMethod: string;
    dateStr: string;
  }): string {
    const divider = '==========================================';
    const singleDivider = '------------------------------------------';

    let lines = [
      '        [ ESC/POS THERMAL PRINTER ]       ',
      `           ${order.branchNameAr}          `,
      `           ${order.branchNameEn}          `,
      `          VAT No: ${order.vatNumber}       `,
      divider,
      `Invoice #: ${order.orderNumber}`,
      `Date/Time: ${order.dateStr}`,
      `Cashier  : ${order.cashierName}`,
      singleDivider,
      'Item Description        Qty    Price    Total',
      singleDivider,
    ];

    order.items.forEach(i => {
      const name = (i.nameAr || i.nameEn).padEnd(20).substring(0, 20);
      const qty = i.quantity.toString().padStart(4);
      const price = i.unitPrice.toFixed(2).padStart(8);
      const total = i.totalPrice.toFixed(2).padStart(8);
      lines.push(`${name} ${qty} ${price} ${total}`);
    });

    lines.push(singleDivider);
    lines.push(`Subtotal (Excl. Tax):        SAR ${order.subtotal.toFixed(2).padStart(8)}`);
    if (order.discount > 0) {
      lines.push(`Discount Applied:           -SAR ${order.discount.toFixed(2).padStart(8)}`);
    }
    lines.push(`VAT (15%):                   SAR ${order.vatAmount.toFixed(2).padStart(8)}`);
    lines.push(divider);
    lines.push(`TOTAL PAYABLE:               SAR ${order.total.toFixed(2).padStart(8)}`);
    lines.push(`Payment Method:              ${order.paymentMethod}`);
    lines.push(divider);
    lines.push('       [ ZATCA PHASE 2 QR CODE ]          ');
    lines.push('        [ |||||||||||||||||||| ]          ');
    lines.push('       Thank you for your visit!          ');
    lines.push('             شكراً لزيارتكم               ');
    lines.push('\n[CUT PAPER COMMAND - GS V 66 0]\n');

    return lines.join('\n');
  }
}

export const globalHardwareBridge = new HardwareBridgeBus();
