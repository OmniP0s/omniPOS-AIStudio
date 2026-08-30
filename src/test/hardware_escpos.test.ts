import { describe, it, expect } from 'vitest';
import { EscPosByteCompiler, EscPosCommand, ThermalPrinterDeviceController, EmulatedHardwareTransport } from '../domain/hardware/escposProtocol';
import { globalHardwareBridge, globalHardwareTransport } from '../domain/hardware/hardwareBridge';

describe('ESC/POS Hardware Protocol & Peripheral Engine', () => {
  it('compiles valid ESC/POS byte sequence with initialization, alignment, bold, and cut commands', () => {
    const compiler = new EscPosByteCompiler();
    const bytes = compiler
      .init()
      .align('CENTER')
      .bold(true)
      .textLine('OMNI POS RESTAURANT')
      .bold(false)
      .feed(2)
      .cut(true)
      .build();

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);

    // Verify ESC @ (0x1b, 0x40)
    expect(bytes[0]).toBe(0x1b);
    expect(bytes[1]).toBe(0x40);

    // Verify GS V 66 0 partial cut at the end
    const lastFour = bytes.slice(bytes.length - 4);
    expect(Array.from(lastFour)).toEqual([0x1d, 0x56, 0x42, 0x00]);
  });

  it('compiles ESC/POS standard QR Code byte sequences with Model 2 parameters', () => {
    const compiler = new EscPosByteCompiler();
    const bytes = compiler.qrCode('ZATCA_PHASE_2_BASE64_QR_PAYLOAD').build();

    expect(bytes.length).toBeGreaterThan(20);
    // bytes[0..1] are ESC @ (0x1b, 0x40) from constructor initialization
    expect(bytes[0]).toBe(0x1b);
    expect(bytes[1]).toBe(0x40);
    // Verify QR code Model 2 header starting at bytes[2..4]: 0x1d, 0x28, 0x6b
    expect(bytes[2]).toBe(0x1d);
    expect(bytes[3]).toBe(0x28);
    expect(bytes[4]).toBe(0x6b);
  });

  it('dispatches cash drawer kick pulse through hardware controller', async () => {
    const transport = new EmulatedHardwareTransport();
    const controller = new ThermalPrinterDeviceController(transport);

    await controller.triggerCashDrawer();
    expect(transport.isConnected()).toBe(true);
    
    const writeLog = transport.getWriteLog();
    expect(writeLog.length).toBe(1);
    
    // ESC p 0 25 250 (0x1b, 0x70, 0x00, 0x19, 0xfa)
    const packet = Array.from(writeLog[0]);
    expect(packet.slice(0, 2)).toEqual([0x1b, 0x40]); // init
    expect(packet.slice(2)).toEqual([0x1b, 0x70, 0x00, 0x19, 0xfa]); // kick drawer
  });

  it('compiles full order receipt binary buffer through HardwareBridge', () => {
    const binary = globalHardwareBridge.compileBinaryReceipt({
      orderNumber: '#ORD-9901',
      branchNameAr: 'مطعم أومني الرئيسي',
      branchNameEn: 'Omni Flagship Branch',
      vatNumber: '310123456700003',
      cashierName: 'Ahmad Al-Mansoor',
      items: [
        { nameAr: 'برجر واغيو', nameEn: 'Wagyu Burger', quantity: 2, unitPrice: 65, totalPrice: 130 },
      ],
      subtotal: 113.04,
      discount: 0,
      vatAmount: 16.96,
      total: 130.0,
      paymentMethod: 'CASH',
      dateStr: '2026-08-29 20:00',
      zatcaQrPayload: 'AQxP...BASE64...',
    });

    expect(binary).toBeInstanceOf(Uint8Array);
    expect(binary.length).toBeGreaterThan(100);
  });
});
