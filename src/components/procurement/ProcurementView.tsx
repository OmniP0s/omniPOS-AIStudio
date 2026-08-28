import React, { useState } from 'react';
import { globalProcurement } from '../../domain/procurement/procurementEngine';
import {
  VendorSupplier,
  PurchaseRequest,
  PurchaseOrder,
  GoodsReceiptNote,
  ThreeWayInvoiceMatch,
} from '../../types';
import {
  Truck,
  FileSpreadsheet,
  FileCheck2,
  PackageCheck,
  Scale,
  ShieldCheck,
  Plus,
  CheckCircle2,
  Clock,
  Building,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ProcurementViewProps {
  isArabic: boolean;
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({ isArabic }) => {
  const [activeTab, setActiveTab] = useState<'VENDORS' | 'PR' | 'PO' | 'GRN' | 'MATCHING'>('PO');
  const [vendors, setVendors] = useState<VendorSupplier[]>(() => globalProcurement.getVendors());
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => globalProcurement.getPurchaseRequests());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => globalProcurement.getPurchaseOrders());
  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceiptNote[]>(() => globalProcurement.getGoodsReceipts());
  const [matches, setMatches] = useState<ThreeWayInvoiceMatch[]>(() => globalProcurement.getThreeWayMatches());

  const [isNewPRModalOpen, setIsNewPRModalOpen] = useState(false);
  const [newPrItemName, setNewPrItemName] = useState('Fresh Organic Tomatoes');
  const [newPrQty, setNewPrQty] = useState(100);
  const [newPrPrice, setNewPrPrice] = useState(4.5);

  const refreshState = () => {
    setVendors([...globalProcurement.getVendors()]);
    setPurchaseRequests([...globalProcurement.getPurchaseRequests()]);
    setPurchaseOrders([...globalProcurement.getPurchaseOrders()]);
    setGoodsReceipts([...globalProcurement.getGoodsReceipts()]);
    setMatches([...globalProcurement.getThreeWayMatches()]);
  };

  const handleCreatePR = (e: React.FormEvent) => {
    e.preventDefault();
    globalProcurement.createPurchaseRequest({
      branchId: 'b1',
      requestedBy: 'Branch Executive Chef',
      requiredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      totalEstimatedCostSar: newPrQty * newPrPrice,
      urgency: 'HIGH',
      notes: 'Urgent stock top-up for weekend surge',
      items: [
        {
          inventoryItemId: 'inv-custom',
          itemNameEn: newPrItemName,
          itemNameAr: newPrItemName,
          requestedQty: newPrQty,
          unit: 'kg',
          estimatedUnitPrice: newPrPrice,
        },
      ],
    });
    setIsNewPRModalOpen(false);
    refreshState();
  };

  const handleApprovePR = (prId: string) => {
    globalProcurement.approvePurchaseRequest(prId);
    refreshState();
  };

  const handleSimulateGRN = (po: PurchaseOrder) => {
    globalProcurement.receiveGoods(
      po.id,
      po.warehouseId,
      'Receiving Specialist Ali',
      po.items.map(it => ({
        inventoryItemId: it.inventoryItemId,
        receivedQty: it.orderedQty,
        rejectedQty: 0,
        batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
        expiryDate: '2027-04-15',
      })),
      -18.0
    );
    refreshState();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-slate-100">
      {/* Header Bar */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-black tracking-tight text-white">
              {isArabic ? 'إدارة المشتريات وسلاسل الإمداد والتوريد' : 'Enterprise Procurement & Supply Chain'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
              3-Way Match Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isArabic
              ? 'إدارة الموردين، طلبات الشراء، الاستلام الفعلي بالمستودع، ومطابقة الفواتير الثلاثية مع القيود المحاسبية'
              : 'End-to-end Vendor SLAs, Purchase Orders, Goods Receipt (GRN), and 3-Way Automated Invoice Reconciliation'}
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={() => setIsNewPRModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isArabic ? 'طلب شراء جديد (PR)' : 'New Purchase Request'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/40 px-4 gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'PO', labelEn: 'Purchase Orders (PO)', labelAr: 'أوامر الشراء الرسمية', icon: FileSpreadsheet, count: purchaseOrders.length },
          { id: 'PR', labelEn: 'Purchase Requests (PR)', labelAr: 'طلبات الشراء الداخلية', icon: FileCheck2, count: purchaseRequests.length },
          { id: 'GRN', labelEn: 'Goods Receipt (GRN)', labelAr: 'سندات استلام البضائع', icon: PackageCheck, count: goodsReceipts.length },
          { id: 'MATCHING', labelEn: '3-Way Invoice Match', labelAr: 'مطابقة الفواتير الثلاثية', icon: Scale, count: matches.length },
          { id: 'VENDORS', labelEn: 'Vendor Directory & SLA', labelAr: 'دليل الموردين واتفاقيات الخدمة', icon: Building, count: vendors.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isArabic ? tab.labelAr : tab.labelEn}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* PURCHASE ORDERS TAB */}
        {activeTab === 'PO' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-xs">{isArabic ? 'إجمالي المشتريات النشطة' : 'Active PO Volume'}</span>
                <p className="text-xl font-black text-white mt-1 font-mono">
                  {purchaseOrders.reduce((s, p) => s + p.totalAmountSar, 0).toLocaleString()} <span className="text-xs text-indigo-400">SAR</span>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-xs">{isArabic ? 'طلبات بانتظار التوريد' : 'Pending Deliveries'}</span>
                <p className="text-xl font-black text-amber-400 mt-1 font-mono">
                  {purchaseOrders.filter(p => p.status !== 'FULFILLED').length}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-xs">{isArabic ? 'نسبة تسليم الموردين بالموعد' : 'Vendor On-Time Rate'}</span>
                <p className="text-xl font-black text-emerald-400 mt-1 font-mono">97.8%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-xs">{isArabic ? 'ضريبة القيمة المضافة المستردة' : 'Deductible Input VAT'}</span>
                <p className="text-xl font-black text-indigo-400 mt-1 font-mono">
                  {(purchaseOrders.reduce((s, p) => s + p.taxAmount, 0)).toLocaleString()} <span className="text-xs">SAR</span>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {purchaseOrders.map(po => (
                <div
                  key={po.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-400 text-sm">{po.poNumber}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          po.status === 'FULFILLED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-white">{po.vendorName}</p>
                    <p className="text-xs text-slate-400">
                      {isArabic ? 'تاريخ الطلب:' : 'Order Date:'} {po.orderDate} • {isArabic ? 'التسليم المتوقع:' : 'ETA:'} {po.expectedDeliveryDate}
                    </p>
                  </div>

                  {/* Items summary */}
                  <div className="flex-1 max-w-md bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs space-y-1">
                    <span className="text-[11px] text-slate-400 font-semibold">{isArabic ? 'الأصناف المطلوبة:' : 'Order Items:'}</span>
                    {po.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-300">
                        <span>{isArabic ? it.itemNameAr : it.itemNameEn}</span>
                        <span className="font-mono font-bold">
                          {it.receivedQty}/{it.orderedQty} {it.unit}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right rtl:text-left">
                      <span className="text-xs text-slate-400">{isArabic ? 'المبلغ الإجمالي' : 'Total Amount'}</span>
                      <p className="text-base font-black text-white font-mono">
                        {po.totalAmountSar.toLocaleString()} <span className="text-xs text-indigo-400">SAR</span>
                      </p>
                    </div>

                    {po.status !== 'FULFILLED' && (
                      <button
                        onClick={() => handleSimulateGRN(po)}
                        className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <PackageCheck className="w-4 h-4" />
                        <span>{isArabic ? 'استلام البضاعة (GRN)' : 'Receive Goods'}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PURCHASE REQUESTS TAB */}
        {activeTab === 'PR' && (
          <div className="space-y-3">
            {purchaseRequests.map(pr => (
              <div
                key={pr.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-indigo-400">{pr.prNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pr.status === 'PO_CONVERTED'
                          ? 'bg-blue-500/20 text-blue-300'
                          : pr.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {pr.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                      {pr.urgency} URGENCY
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isArabic ? 'مقدم الطلب:' : 'Requested by:'} <span className="text-white font-bold">{pr.requestedBy}</span> • {isArabic ? 'تاريخ الاحتياج:' : 'Required by:'} {pr.requiredDate}
                  </p>
                  <p className="text-xs text-slate-400 italic">"{pr.notes}"</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right rtl:text-left">
                    <span className="text-xs text-slate-400">{isArabic ? 'التكلفة المقدرة' : 'Estimated Cost'}</span>
                    <p className="text-sm font-black text-white font-mono">
                      {pr.totalEstimatedCostSar.toLocaleString()} SAR
                    </p>
                  </div>

                  {pr.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => handleApprovePR(pr.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isArabic ? 'اعتماد وتحويل لأمر شراء' : 'Approve & Create PO'}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GOODS RECEIPT TAB */}
        {activeTab === 'GRN' && (
          <div className="space-y-3">
            {goodsReceipts.map(grn => (
              <div key={grn.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">{grn.grnNumber}</span>
                    <span className="text-xs text-slate-400">({isArabic ? 'مرتبط بـ' : 'Linked to'} {grn.poNumber})</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {grn.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                    <span>🌡️ {grn.temperatureAtReceiptCelsius}°C (HACCP Compliant)</span>
                    <span>🕒 {new Date(grn.receivedDate).toLocaleTimeString()}</span>
                  </div>
                </div>

                <div className="bg-slate-950/70 rounded-lg p-3 border border-slate-800 text-xs">
                  <div className="grid grid-cols-4 font-bold text-slate-400 pb-2 border-b border-slate-800">
                    <span>{isArabic ? 'الصنف المخزني' : 'Item'}</span>
                    <span>{isArabic ? 'رقم التشغيلة' : 'Batch / Lot'}</span>
                    <span>{isArabic ? 'تاريخ الصلاحية' : 'Expiry Date'}</span>
                    <span className="text-right rtl:text-left">{isArabic ? 'الكمية المقبولة' : 'Accepted Qty'}</span>
                  </div>
                  {grn.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-4 text-slate-200 py-1.5 border-b border-slate-900/60 font-mono">
                      <span>{it.inventoryItemId}</span>
                      <span className="text-indigo-400">{it.batchNumber}</span>
                      <span>{it.expiryDate}</span>
                      <span className="text-right rtl:text-left text-emerald-400 font-bold">
                        {it.acceptedQty} / {it.orderedQty}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3-WAY MATCHING TAB */}
        {activeTab === 'MATCHING' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
              <div className="text-xs text-indigo-200">
                <span className="font-bold">{isArabic ? 'نظام التحقق الثلاثي الآلي (PO + GRN + Invoice):' : 'Automated 3-Way Match Engine:'}</span>{' '}
                {isArabic
                  ? 'يتم التحقق آلياً من تطابق أسعار أمر الشراء مع الكميات المستلمة فعلياً في سند الاستلام وفاتورة المورد قبل إرسال أمر الصرف للمحاسبة.'
                  : 'Automated cross-check ensures zero payment discrepancies by aligning PO lines, warehouse GRN receipts, and vendor tax invoices before ledger posting.'}
              </div>
            </div>

            <div className="space-y-3">
              {matches.map(m => (
                <div key={m.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{m.supplierInvoiceNumber}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        {m.matchStatus}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                      {isArabic ? 'معتمد للصرف المحاسبي الآلي' : 'Auto-Approved For AP Disbursement'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div>
                      <span className="text-slate-400">{isArabic ? 'أمر الشراء (PO)' : 'Purchase Order'}</span>
                      <p className="font-mono font-bold text-white">{m.poNumber}</p>
                      <p className="font-mono text-slate-300">{m.poTotalAmountSar.toLocaleString()} SAR</p>
                    </div>
                    <div>
                      <span className="text-slate-400">{isArabic ? 'سند الاستلام (GRN)' : 'Goods Receipt'}</span>
                      <p className="font-mono font-bold text-emerald-400">{m.grnNumber}</p>
                      <p className="font-mono text-slate-300">{m.grnTotalAmountSar.toLocaleString()} SAR</p>
                    </div>
                    <div>
                      <span className="text-slate-400">{isArabic ? 'فاتورة المورد المستحقة' : 'Supplier Invoice'}</span>
                      <p className="font-mono font-bold text-indigo-400">{m.supplierInvoiceNumber}</p>
                      <p className="font-mono text-slate-300">{m.supplierTotalAmountSar.toLocaleString()} SAR</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'VENDORS' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vendors.map(v => (
              <div key={v.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">{v.code}</span>
                    <h3 className="font-bold text-white text-sm">{isArabic ? v.nameAr : v.nameEn}</h3>
                    <span className="text-xs text-slate-400">{v.contactPerson}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    {v.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-400">{isArabic ? 'تقييم الجودة' : 'SLA Rating'}</span>
                    <p className="font-bold text-amber-400">★ {v.ratingScore} / 5.0</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{isArabic ? 'التسليم بالموعد' : 'On-Time Rate'}</span>
                    <p className="font-bold text-emerald-400">{v.onTimeDeliveryRate}%</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{isArabic ? 'شروط السداد' : 'Payment Terms'}</span>
                    <p className="font-bold text-slate-200">{v.paymentTerms}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">{isArabic ? 'الرقم الضريبي' : 'VAT Number'}</span>
                    <p className="font-mono text-slate-400 text-[11px]">{v.vatNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New Purchase Request */}
      {isNewPRModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-white">
              {isArabic ? 'إنشاء طلب شراء داخلي جديد (PR)' : 'Create Internal Purchase Request'}
            </h3>
            <form onSubmit={handleCreatePR} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold mb-1 block">
                  {isArabic ? 'اسم الصنف أو المادة الخام' : 'Item / Raw Material Name'}
                </label>
                <input
                  type="text"
                  value={newPrItemName}
                  onChange={e => setNewPrItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-semibold focus:outline-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">
                    {isArabic ? 'الكمية المطلوبة' : 'Requested Quantity'}
                  </label>
                  <input
                    type="number"
                    value={newPrQty}
                    onChange={e => setNewPrQty(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold mb-1 block">
                    {isArabic ? 'السعر المقدر للوحدة (SAR)' : 'Est. Unit Cost (SAR)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPrPrice}
                    onChange={e => setNewPrPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:outline-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center font-bold">
                <span className="text-slate-400">{isArabic ? 'الإجمالي التقديري:' : 'Estimated Total:'}</span>
                <span className="text-indigo-400 font-mono text-sm">{(newPrQty * newPrPrice).toFixed(2)} SAR</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPRModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  {isArabic ? 'إرسال للاعتماد' : 'Submit for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
