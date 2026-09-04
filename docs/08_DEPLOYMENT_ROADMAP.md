# خارطة الطريق التنفيذية والتشغيل

## 1. مراحل التنفيذ (8 أسابيع)

### الأسبوع 1-2: Foundation Hardening
**الهدف:** تثبيت الأساس الذي لا يتغير

- [ ] إنشاء جدول `companies` + migration `003`
- [ ] تحديث `TenantContext` ليشمل `companyId`
- [ ] إنشاء `src/foundation/` (Money, Result, DomainEvent, Errors)
- [ ] إنشاء `src/domain/company/` (Entity, Repository Interface, Service)
- [ ] إنشاء `src/domain/organization/` (Org aggregate)
- [ ] تحديث RLS + `user_company_roles`
- [ ] كتابة ADR-005 (Company as Legal Entity)

**Deliverable:** API `GET /api/v1/companies` يعمل + RLS يحمي

### الأسبوع 3-4: Multi-Company POS Core
- [ ] تعديل Order, Shift, Inventory ليحمل companyId
- [ ] `CreateOrderUseCase` يتحقق من company access
- [ ] Frontend: `TenantProvider` + Company Selector
- [ ] شاشة `CompaniesPage` (CRUD)
- [ ] شاشة `BranchesPage` محدثة (تختار Company)
- [ ] نقل `pos` إلى `features/pos/`

**Deliverable:** يمكن إنشاء طلب لشركتين مختلفتين من نفس Tenant

### الأسبوع 5-6: Accounting & ZATCA Multi-Company
- [ ] Chart of Accounts per company
- [ ] `zatca_config` per company
- [ ] Consolidated Reports API
- [ ] ZATCA signing per company EGS
- [ ] Inter-company transfer (basic)

**Deliverable:** تقارير مجمعة + فواتير ZATCA لكل شركة

### الأسبوع 7-8: Advanced & Hardening
- [ ] Franchise module (optional)
- [ ] White-label per company
- [ ] SaaS Billing aggregated
- [ ] Performance testing (1000 orders/min per company)
- [ ] Security audit (RLS, Company isolation)
- [ ] Docs + ADRs final

**Deliverable:** نظام شركات مكتمل قابل للبيع

---

## 2. استراتيجية النشر (Deployment)

### الحالي: Single Server (Express + Vite)

### المقترح: Modular Monolith + Docker

**Dockerfile:**
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

**docker-compose.yml:**
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
    depends_on: [db, redis]
  db:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    environment:
      POSTGRES_DB: omnipos
      POSTGRES_USER: omnipos
      POSTGRES_PASSWORD: ${DB_PASSWORD}
  redis:
    image: redis:7-alpine
    # للـ outbox relay + rate limiting مستقبلاً
```

### Kubernetes (مستقبلاً)
- كل Module يمكن أن يصبح Deployment مستقل إذا احتجنا
- حالياً: Deployment واحد + HPA (2-10 replicas)
- Postgres: Managed (RDS / Cloud SQL) وليس في K8s

## 3. Observability

### Logging (موجود: infrastructure/logger.ts)
- نحتاج Structured JSON logs: `{ level, message, tenantId, companyId, correlationId, ... }`
- لا نطبع PII أو Money كـ float

### Metrics (مقترح)
- Prometheus: `orders_created_total{tenant, company, branch}`, `zatca_reported_total`, `outbox_pending`
- Grafana dashboards per company

### Tracing (مقترح)
- OpenTelemetry: trace من POS UI -> API -> DB -> ZATCA

## 4. CI/CD

```yaml
# .github/workflows/ci.yml
- lint: tsc --noEmit + eslint
- test: vitest run (unit + integration)
- build: npm run build
- security: npm audit + RLS tests
- deploy: docker build + push + deploy to staging
```

## 5. قائمة التحقق قبل الإطلاق (Production Readiness)

- [ ] كل جدول له RLS
- [ ] كل API كتابة له Idempotency-Key
- [ ] كل Money field هو BIGINT minor
- [ ] Outbox pattern لكل side effect
- [ ] Audit log لكل عملية حساسة
- [ ] Rate limiting مفعل
- [ ] Security headers مفعل
- [ ] Backup يومي لـ Postgres (PITR)
- [ ] Runbook لـ ZATCA failures
- [ ] Load test: 100 concurrent POS terminals

## 6. التسعير المقترح لنظام الشركات

| الباقة | الشركات | الفروع | الفواتير ZATCA | السعر الشهري |
|---|---|---|---|---|
| Starter | 1 | 1 | 500 | 299 SAR |
| Growth | 1 | 5 | 5,000 | 799 SAR |
| Multi-Company | 3 | 15 | 20,000 | 1,999 SAR |
| Enterprise | ∞ | ∞ | ∞ | Custom |

- كل Company إضافية = +200 SAR/شهر
- كل فرع إضافي = +100 SAR/شهر
- التخزين والـ AI tokens بحسب الاستخدام

## 7. المخاطر وكيفية التخفيف

| الخطر | التخفيف |
|---|---|
| تسريب بيانات بين شركات | RLS + Application check + اختبارات عزل |
| ZATCA downtime | Outbox + retry + offline queue |
| تعارض offline | Vector clock + Server wins + manual reconciliation UI |
| نمو سريع للـ DB | Partitioning حسب tenant_id + archiving |

---

## 8. الخلاصة التنفيذية للمالك

**الأساس الثابت الذي نبنيه الآن:**
1.  `companies` table + `company_id` في كل جدول
2.  `TenantContext` يحمل company
3.  `Money` VO + Outbox + RLS + Idempotency
4.  Modular Monolith مع حدود واضحة

**هذا الأساس يسمح لك:**
- تبيع لشركة واحدة (مطعم صغير) أو لقابضة (10 براندات) بنفس الكود
- تضيف فرنشايز لاحقاً بدون إعادة كتابة
- تحافظ على ZATCA compliance لكل شركة على حدة
- تتوسع لـ 1000+ عميل بدون Microservices معقدة

**الخطوة التالية المباشرة:** نفذ migration `003_companies` + أنشئ `features/company` في Frontend.
