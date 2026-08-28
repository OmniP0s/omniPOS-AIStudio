// Procurement Management Engine - OmniPOS Enterprise
import {
  VendorSupplier,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceiptNote,
  ThreeWayInvoiceMatch,
} from '../../types';

export class ProcurementEngine {
  private vendors: VendorSupplier[] = [
    {
      id: 'VEND-001',
      code: 'ALMARAI-SA',
      nameEn: 'Almarai Dairy & Food Distribution',
      nameAr: 'شركة المراعي للألبان والأغذية',
      category: 'RAW_FOOD',
      contactPerson: 'Fahad Al-Otaibi',
      email: 'orders.sa@almarai.com',
      phone: '+966 11 47 Broadway',
      vatNumber: '300011223300003',
      crNumber: '1010022334',
      paymentTerms: 'NET_30',
      currency: 'SAR',
      ratingScore: 4.9,
      onTimeDeliveryRate: 98.4,
      qualityComplianceRate: 99.2,
      status: 'APPROVED',
      leadTimeDays: 1,
      contractExpiryDate: '2027-12-31',
    },
    {
      id: 'VEND-002',
      code: 'AMERICANA-MEAT',
      nameEn: 'Americana Premium Meats Co.',
      nameAr: 'الشركة الوطنية للحوم والدواجن (أمريكانا)',
      category: 'RAW_FOOD',
      contactPerson: 'Tariq Mansoor',
      email: 'supply@americana.sa',
      phone: '+966 12 654 3321',
      vatNumber: '310998877600003',
      crNumber: '1010887766',
      paymentTerms: 'NET_30',
      currency: 'SAR',
      ratingScore: 4.8,
      onTimeDeliveryRate: 96.5,
      qualityComplianceRate: 98.7,
      status: 'APPROVED',
      leadTimeDays: 2,
      contractExpiryDate: '2027-06-30',
    },
    {
      id: 'VEND-003',
      code: 'ECO-PACK-SA',
      nameEn: 'EcoPack Biodegradable Packaging KSA',
      nameAr: 'شركة التغليف البيئي المستدام',
      category: 'PACKAGING',
      contactPerson: 'Hassan Al-Zahrani',
      email: 'sales@ecopack.sa',
      phone: '+966 13 889 1100',
      vatNumber: '301223344500003',
      crNumber: '2050119988',
      paymentTerms: 'NET_15',
      currency: 'SAR',
      ratingScore: 4.7,
      onTimeDeliveryRate: 95.0,
      qualityComplianceRate: 99.5,
      status: 'APPROVED',
      leadTimeDays: 3,
      contractExpiryDate: '2026-11-30',
    },
  ];

  private purchaseRequests: PurchaseRequest[] = [
    {
      id: 'pr-101',
      prNumber: 'PR-2026-0089',
      branchId: 'b1',
      requestedBy: 'Executive Chef Youssef',
      requiredDate: '2026-08-29',
      status: 'APPROVED',
      totalEstimatedCostSar: 4250,
      urgency: 'NORMAL',
      notes: 'Weekly fresh meat, dairy and burger buns restock',
      items: [
        {
          inventoryItemId: 'inv-1',
          itemNameEn: 'Angus Beef Patties (150g)',
          itemNameAr: 'قطع لحم أنجوس برجر (150جم)',
          requestedQty: 250,
          unit: 'pcs',
          estimatedUnitPrice: 9.5,
        },
        {
          inventoryItemId: 'inv-2',
          itemNameEn: 'Artisan Brioche Buns',
          itemNameAr: 'خبز بريوش فاخر',
          requestedQty: 300,
          unit: 'pcs',
          estimatedUnitPrice: 2.2,
        },
        {
          inventoryItemId: 'inv-3',
          itemNameEn: 'Aged Cheddar Cheese Slices',
          itemNameAr: 'شرائح جبنة شيدر معتقة',
          requestedQty: 50,
          unit: 'kg',
          estimatedUnitPrice: 24.0,
        },
      ],
    },
  ];

  private purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-501',
      poNumber: 'PO-2026-0044',
      vendorId: 'VEND-002',
      vendorName: 'Americana Premium Meats Co.',
      branchId: 'b1',
      warehouseId: 'w1',
      orderDate: '2026-08-26',
      expectedDeliveryDate: '2026-08-28',
      status: 'PARTIALLY_RECEIVED',
      currency: 'SAR',
      exchangeRate: 1.0,
      subtotal: 5800,
      taxAmount: 870,
      landedFreightCost: 150,
      landedCustomsCost: 0,
      totalAmountSar: 6820,
      paymentStatus: 'UNPAID',
      items: [
        {
          inventoryItemId: 'inv-1',
          itemNameEn: 'Angus Beef Patties (150g)',
          itemNameAr: 'قطع لحم أنجوس برجر',
          orderedQty: 500,
          receivedQty: 350,
          unit: 'pcs',
          unitPrice: 9.2,
          totalPrice: 4600,
          taxRate: 0.15,
        },
        {
          inventoryItemId: 'inv-4',
          itemNameEn: 'Crispy French Fries (9mm Cut)',
          itemNameAr: 'بطاطس مقلية مقرمشة',
          orderedQty: 40,
          receivedQty: 40,
          unit: 'box',
          unitPrice: 30.0,
          totalPrice: 1200,
          taxRate: 0.15,
        },
      ],
    },
  ];

  private goodsReceipts: GoodsReceiptNote[] = [
    {
      id: 'grn-801',
      grnNumber: 'GRN-2026-0031',
      poId: 'po-501',
      poNumber: 'PO-2026-0044',
      vendorId: 'VEND-002',
      receivedDate: '2026-08-27T08:30:00Z',
      receivedBy: 'Warehouse Manager Omar',
      warehouseId: 'w1',
      status: 'ACCEPTED_WITH_VARIANCE',
      temperatureAtReceiptCelsius: -18.4,
      expiryCheckPassed: true,
      items: [
        {
          inventoryItemId: 'inv-1',
          orderedQty: 500,
          receivedQty: 350,
          acceptedQty: 350,
          rejectedQty: 0,
          batchNumber: 'LOT-BEEF-260827-A',
          expiryDate: '2027-02-27',
        },
        {
          inventoryItemId: 'inv-4',
          orderedQty: 40,
          receivedQty: 40,
          acceptedQty: 40,
          rejectedQty: 0,
          batchNumber: 'LOT-FRIES-260825',
          expiryDate: '2027-08-25',
        },
      ],
    },
  ];

  private matchings: ThreeWayInvoiceMatch[] = [
    {
      id: 'match-01',
      supplierInvoiceNumber: 'INV-AMER-99120',
      poNumber: 'PO-2026-0044',
      grnNumber: 'GRN-2026-0031',
      invoiceDate: '2026-08-27',
      supplierTotalAmountSar: 5083, // For 350 patties + 40 boxes fries + VAT
      poTotalAmountSar: 6820,
      grnTotalAmountSar: 5083,
      priceVariance: 0.0,
      qtyVariance: -150, // 150 patties remaining on backorder
      matchStatus: 'EXACT_MATCH',
      autoApprovedForPayment: true,
    },
  ];

  public getVendors(): VendorSupplier[] {
    return this.vendors;
  }

  public getPurchaseRequests(): PurchaseRequest[] {
    return this.purchaseRequests;
  }

  public getPurchaseOrders(): PurchaseOrder[] {
    return this.purchaseOrders;
  }

  public getGoodsReceipts(): GoodsReceiptNote[] {
    return this.goodsReceipts;
  }

  public getThreeWayMatches(): ThreeWayInvoiceMatch[] {
    return this.matchings;
  }

  public createVendor(vendor: Omit<VendorSupplier, 'id'>): VendorSupplier {
    const newVendor: VendorSupplier = {
      ...vendor,
      id: `VEND-${Date.now().toString().slice(-4)}`,
    };
    this.vendors.push(newVendor);
    return newVendor;
  }

  public createPurchaseRequest(pr: Omit<PurchaseRequest, 'id' | 'prNumber' | 'status'>): PurchaseRequest {
    const newPr: PurchaseRequest = {
      ...pr,
      id: `pr-${Date.now()}`,
      prNumber: `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING_APPROVAL',
    };
    this.purchaseRequests.unshift(newPr);
    return newPr;
  }

  public approvePurchaseRequest(prId: string): PurchaseOrder | null {
    const pr = this.purchaseRequests.find(p => p.id === prId);
    if (!pr) return null;
    pr.status = 'APPROVED';

    // Auto-generate PO
    const defaultVendor = this.vendors[0];
    const subtotal = pr.totalEstimatedCostSar;
    const taxAmount = subtotal * 0.15;
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorId: defaultVendor.id,
      vendorName: defaultVendor.nameEn,
      branchId: pr.branchId,
      warehouseId: 'w1',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: pr.requiredDate,
      status: 'ISSUED',
      currency: 'SAR',
      exchangeRate: 1.0,
      subtotal,
      taxAmount,
      landedFreightCost: 0,
      landedCustomsCost: 0,
      totalAmountSar: subtotal + taxAmount,
      paymentStatus: 'UNPAID',
      items: pr.items.map(it => ({
        inventoryItemId: it.inventoryItemId,
        itemNameEn: it.itemNameEn,
        itemNameAr: it.itemNameAr,
        orderedQty: it.requestedQty,
        receivedQty: 0,
        unit: it.unit,
        unitPrice: it.estimatedUnitPrice,
        totalPrice: it.requestedQty * it.estimatedUnitPrice,
        taxRate: 0.15,
      })),
    };
    this.purchaseOrders.unshift(po);
    pr.status = 'PO_CONVERTED';
    return po;
  }

  public receiveGoods(
    poId: string,
    warehouseId: string,
    receivedBy: string,
    itemsReceipt: { inventoryItemId: string; receivedQty: number; rejectedQty: number; batchNumber: string; expiryDate: string }[],
    tempCelsius: number
  ): GoodsReceiptNote | null {
    const po = this.purchaseOrders.find(p => p.id === poId);
    if (!po) return null;

    let hasVariance = false;
    const grnItems = itemsReceipt.map(item => {
      const poItem = po.items.find(i => i.inventoryItemId === item.inventoryItemId);
      const ordered = poItem ? poItem.orderedQty : item.receivedQty;
      if (item.receivedQty !== ordered || item.rejectedQty > 0) {
        hasVariance = true;
      }
      if (poItem) {
        poItem.receivedQty = Math.min(poItem.orderedQty, poItem.receivedQty + item.receivedQty);
      }
      return {
        inventoryItemId: item.inventoryItemId,
        orderedQty: ordered,
        receivedQty: item.receivedQty,
        acceptedQty: item.receivedQty - item.rejectedQty,
        rejectedQty: item.rejectedQty,
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate,
      };
    });

    const allFulfilled = po.items.every(i => i.receivedQty >= i.orderedQty);
    po.status = allFulfilled ? 'FULFILLED' : 'PARTIALLY_RECEIVED';

    const grn: GoodsReceiptNote = {
      id: `grn-${Date.now()}`,
      grnNumber: `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      poId: po.id,
      poNumber: po.poNumber,
      vendorId: po.vendorId,
      receivedDate: new Date().toISOString(),
      receivedBy,
      warehouseId,
      status: hasVariance ? 'ACCEPTED_WITH_VARIANCE' : 'ACCEPTED',
      temperatureAtReceiptCelsius: tempCelsius,
      expiryCheckPassed: true,
      items: grnItems,
    };
    this.goodsReceipts.unshift(grn);

    // Compute 3-Way Match
    const receivedSubtotal = grn.items.reduce((sum, gi) => {
      const poItem = po.items.find(i => i.inventoryItemId === gi.inventoryItemId);
      return sum + gi.acceptedQty * (poItem?.unitPrice || 0);
    }, 0);
    const grnTotalWithTax = receivedSubtotal * 1.15;

    const match: ThreeWayInvoiceMatch = {
      id: `match-${Date.now()}`,
      supplierInvoiceNumber: `INV-${po.vendorName.substring(0, 4).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
      poNumber: po.poNumber,
      grnNumber: grn.grnNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      supplierTotalAmountSar: Number(grnTotalWithTax.toFixed(2)),
      poTotalAmountSar: po.totalAmountSar,
      grnTotalAmountSar: Number(grnTotalWithTax.toFixed(2)),
      priceVariance: 0,
      qtyVariance: grn.items.reduce((s, i) => s + (i.acceptedQty - i.orderedQty), 0),
      matchStatus: hasVariance ? 'TOLERANCE_ACCEPTED' : 'EXACT_MATCH',
      autoApprovedForPayment: true,
    };
    this.matchings.unshift(match);

    return grn;
  }
}

export const globalProcurement = new ProcurementEngine();
