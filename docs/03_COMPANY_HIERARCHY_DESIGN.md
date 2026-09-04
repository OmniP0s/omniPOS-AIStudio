# تصميم نظام الشركات - اقتراحات معمارية

## 1. المشكلة الحالية
الكود الحالي يفترض:
- `Tenant = Company = VAT واحد`
- لا يوجد مفهوم Holding أو Multi-Brand
- لا يمكن لشركة واحدة أن تدير 3 علامات تجارية بسجلات ضريبية مختلفة

## 2. النموذج المقترح (3 طبقات)

### الطبقة 0: Organization (Tenant)
- هو من يدفع اشتراك SaaS
- يملك المستخدمين، الاشتراكات، الفوترة
- مثال: "مجموعة الشايع القابضة"

```ts
interface Organization {
  id: OrganizationId // tenantId الحالي
  nameEn, nameAr
  subscription: SubscriptionRecord
  ownerUserId
  status: 'ACTIVE' | 'SUSPENDED'
}
```

### الطبقة 1: Company (الكيان القانوني) - **جديد ومهم**
- سجل تجاري + رقم ضريبي + شجرة حسابات مستقلة
- مثال: "شركة الأطعمة السريعة المحدودة" VAT 300000000000003
- مثال: "شركة المقاهي الفاخرة" VAT 300000000000004

```ts
interface Company {
  id: CompanyId
  organizationId: OrganizationId // tenant_id
  code: string // BRAND-001
  nameEn, nameAr
  legalNameEn, legalNameAr
  vatNumber: string // 15 digit
  crNumber: string  // 10 digit
  currency: CurrencyCode
  country: 'SA' | 'AE' | 'EG'
  logoUrl
  config: {
    zatcaEnabled: boolean
    zatcaEnv: 'sandbox' | 'production'
    defaultTaxRate: number
    allowNegativeStock: boolean
  }
  isActive: boolean
}
```

### الطبقة 2: Branch (الفرع)
- ينتمي لـ Company واحدة
- له عنوان، مستودعات، ورديات

```ts
interface Branch {
  id: BranchId
  organizationId: OrganizationId
  companyId: CompanyId // NEW - مهم
  code: string
  nameEn, nameAr
  address: Address
  warehouses: WarehouseId[]
  isMainBranch: boolean
}
```

### الطبقة 3: Terminal / Station
- POS Terminal, KDS Screen, Waiter Tablet

---

## 3. جدول الصلاحيات الجديد (User-Company-Branch)

**الحالي:** User له branchId واحد.
**المقترح:**

```sql
CREATE TABLE user_company_roles (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  company_id VARCHAR(64) NOT NULL REFERENCES companies(id),
  branch_id VARCHAR(64) REFERENCES branches(id), -- NULL = كل فروع الشركة
  role VARCHAR(32) NOT NULL, -- SUPER_ADMIN, COMPANY_ADMIN, BRANCH_MANAGER...
  permissions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, user_id, company_id, branch_id, role)
);
```

**مثال:**
- أحمد: SUPER_ADMIN على مستوى Organization (يشوف كل الشركات)
- سارة: COMPANY_ADMIN على Company A فقط
- خالد: BRANCH_MANAGER على Branch A1 فقط
- كاشير: CASHIER على Branch A1 + Terminal POS-01

**دالة التحقق:**
```ts
function canAccessCompany(user: UserPrincipal, companyId: string, action: string): boolean {
  if (user.roles.includes('SUPER_ADMIN')) return true
  const companyRoles = user.companyRoles.filter(r => r.companyId === companyId)
  return companyRoles.some(r => r.permissions.includes(action) || r.permissions.includes('*'))
}
```

---

## 4. اقتراحات للسيستم شركات (مطلوبك)

### اقتراح 1: SaaS Multi-Company Dashboard
- شاشة Super Admin يشوف:
  - إجمالي مبيعات كل Companies (Consolidated)
  - مقارنة أداء Companies
  - فاتورة SaaS مجمعة (عدد الفروع الكلي، عدد الفواتير ZATCA الكلي)
- API: `GET /api/v1/companies` -> list
- API: `GET /api/v1/companies/:id/summary`

### اقتراح 2: Central Menu & Inventory Sharing
- **Shared Catalog:** Company A و B يمكن أن يشتركا نفس المنتجات (مثلاً: مشروب مشترك)
- **Central Kitchen:** مطبخ مركزي يخدم فروع شركتين مختلفتين
- **Inter-Company Stock Transfer:** نقل مخزون من مستودع Company A إلى Company B (مع قيد محاسبي Inter-Company)

```ts
interface InterCompanyTransfer {
  fromCompanyId, toCompanyId
  fromBranchId, toBranchId
  items: { sku, qty, cost: Money }[]
  status: 'PENDING' | 'APPROVED' | 'COMPLETED'
  accounting: {
    debit: { companyId, accountCode }, // Receivable
    credit: { companyId, accountCode } // Payable
  }
}
```

### اقتراح 3: Consolidated Accounting
- كل Company لها Chart of Accounts مستقل
- لكن يوجد `consolidated_reports` تجمع:
  - Trial Balance مجمع
  - P&L مجمع
  - VAT Return لكل Company + مجمع

**مثال:**
```
Company A: Sales 100,000 SAR, VAT 15,000
Company B: Sales 50,000 SAR, VAT 7,500
Consolidated: Sales 150,000, VAT 22,500
```

### اقتراح 4: Franchise Model (للتوسع)
- Franchisor ينشئ `franchise_agreement`:
```ts
interface FranchiseAgreement {
  franchisorOrgId
  franchiseeOrgId // Tenant مستقل
  royaltyPercent: 5
  marketingPercent: 2
  territory: 'Riyadh'
  menuTemplateId
  complianceChecklist
}
```
- النظام يحسب Royalties تلقائياً من مبيعات Franchisee
- ويرسل Menu Updates كـ Distribution

### اقتراح 5: White-Label per Company
- كل Company لها Branding مستقل:
  - Logo, Colors, Receipt Template
  - Domain: `brand-a.omnipos.com`, `brand-b.omnipos.com`
  - Email sender: `noreply@brand-a.com`

---

## 5. خارطة طريق تنفيذ نظام الشركات (4 مراحل)

### المرحلة 1: Foundation (أسبوع 1-2) - **الأساس الثابت**
- [ ] إنشاء جدول `companies`
- [ ] Migration لإضافة `company_id` للجداول
- [ ] تحديث `TenantContext` ليحمل `companyId`
- [ ] تحديث RLS Policies
- [ ] إنشاء `CompanyRepository` + `CompanyService`

### المرحلة 2: Core POS Multi-Company (أسبوع 3-4)
- [ ] تعديل Order creation ليطلب companyId
- [ ] تعديل Shift ليكون per company+branch
- [ ] تعديل Inventory ليكون per company
- [ ] شاشة إدارة الشركات (CRUD)

### المرحلة 3: Accounting & ZATCA Multi-Company (أسبوع 5-6)
- [ ] Chart of Accounts per company
- [ ] ZATCA config per company
- [ ] Consolidated reports

### المرحلة 4: Advanced (أسبوع 7-8)
- [ ] Inter-company transfers
- [ ] Franchise module
- [ ] White-label

---

## 6. مثال API Contracts لنظام الشركات

```ts
// إنشاء شركة جديدة تحت نفس المؤسسة
POST /api/v1/companies
Headers: Authorization: Bearer <token>, Idempotency-Key: uuid
Body: {
  code: "BRAND_COFFEE",
  nameEn: "Premium Coffee Co.",
  nameAr: "شركة القهوة الفاخرة",
  vatNumber: "300000000000003",
  crNumber: "1010000001",
  currency: "SAR"
}
Response 201: { id, ... }

// قائمة شركاتي
GET /api/v1/companies
Response: [{ id, code, name, branchesCount, totalSalesThisMonth: Money }]

// مبيعات مجمعة
GET /api/v1/organizations/:orgId/consolidated-sales?from=2026-08-01&to=2026-08-31
Response: {
  totalSales: Money,
  byCompany: [
    { companyId, companyName, sales: Money, vat: Money, orders: 1234 },
  ]
}
```

---

## 7. قرارات أمان لنظام الشركات

1.  **Cross-Company Access:** مستخدم لا يمكنه رؤية بيانات شركة أخرى إلا إذا له دور فيها.
2.  **VAT Isolation:** فاتورة ZATCA لشركة A لا يمكن أن تستخدم VAT شركة B.
3.  **Audit Log:** كل عملية عبر الشركات تسجل `companyId` + `userId` + `action`.

---

## 8. ملخص التوصية النهائية

**أنصح بالبدء بالنموذج 2 (Multi-Company Holding) لأنه:**
- يغطي 80% من احتياجات السوق السعودي (مجموعات مطاعم متعددة البراندات)
- لا يكسر الكود الحالي (إضافة company_id كـ optional ثم mandatory)
- يمهد للفرنشايز لاحقاً
- فاتورة SaaS واحدة = تسعير أبسط

**لا أنصح بالقفز مباشرة للفرنشايز** لأنه يتطلب Tenants منفصلة وتزامن أكثر تعقيداً.
