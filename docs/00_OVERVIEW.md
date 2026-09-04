# OmniPOS Cloud - نظرة عامة معمارية عليا

> **الهدف:** تصميم أساس تقني ثابت (Foundation) لنظام نقاط بيع سحابي متعدد الشركات والفروع، يعمل كمرجع صلب لا يتغير، يُبنى عليه كل شيء لاحقاً.

## 1. الرؤية
نظام POS سحابي Enterprise-Grade:
- Multi-Tenant SaaS حقيقي (آلاف الشركات على نفس الكود، عزل كامل)
- Offline-First (يعمل بدون إنترنت ثم يزامن)
- ZATCA Phase 2 compliant (فوترة إلكترونية سعودية)
- AI-Native (مساعد كاشير، تنبؤ، كشف احتيال)
- يخدم نموذجين: **شركة واحدة بفروع** و **قابضة متعددة الشركات** و **فرنشايز**

## 2. المبادئ التأسيسية غير القابلة للتفاوض
1.  **Tenant Isolation First:** كل استعلام يجب أن يمر بـ `tenantId`. لا يوجد كود بدون سياق مستأجر.
2.  **Money is never float:** استخدام `Money` VO بـ minor units (هللة). أي استخدام لـ `number` للفلوس يعتبر Bug.
3.  **Immutable Ledger:** القيود المحاسبية لا تُحذف، فقط عكس بقيد جديد.
4.  **Outbox Pattern:** أي حدث يغير حالة ويحتاج مزامنة/تكامل خارجي يُكتب في `outbox_events` داخل نفس الـ Transaction.
5.  **Idempotency by Design:** كل API كتابة يدعم `Idempotency-Key`.
6.  **Offline is Normal:** نفترض انقطاع الشبكة هو الحالة الطبيعية، وليس استثناء.

## 3. خريطة القدرات (Capability Map)
```
[Identity & Tenancy] -> الأساس
   |
   +-- [Organization / Company / Branch / Terminal] -> التسلسل الهرمي للشركات
   |
   +-- [Catalog: Menu, Categories, Modifiers, Recipes]
   +-- [Inventory: Warehouses, Stock, Transfers, Wastage]
   +-- [POS Core: Orders, Payments, Shifts, Tables, KDS]
   +-- [Customer: CRM, Loyalty, Wallet, GiftCards]
   +-- [Procurement: Vendors, PR, PO, GRN]
   +-- [Accounting: CoA, Journal, VAT Return]
   +-- [ZATCA: CSID, UBL, Signing, Reporting]
   +-- [HR: Employees, Attendance, Payroll]
   +-- [Delivery & Fleet]
   +-- [Franchise & Central Kitchen]
   |
[Cross-Cutting: SaaS Billing, Feature Flags, Audit Log, AI Platform, Integration Hub]
```

## 4. ما الذي نعتبره "الأساس الثابت"؟
الأساس الثابت هو 4 طبقات لا تتغير:
1.  **Contracts Layer:** `ITenantContext`, `IRepository`, `IUnitOfWork`, `Money`, `DomainEvent`
2.  **Security Pipeline:** `SecurityPipeline`, `TenantContextHolder (AsyncLocalStorage)`, RLS
3.  **Persistence Foundation:** `MigrationRunner`, `UnitOfWork`, `OutboxEngine`, `EdgeDatabase`
4.  **Company Hierarchy Model:** `Organization -> Company -> Branch -> Terminal`

كل شيء آخر (POS UI, AI, Analytics) يُبنى فوقها كـ Modules قابلة للاستبدال.
