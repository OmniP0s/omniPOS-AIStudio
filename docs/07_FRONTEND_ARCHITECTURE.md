# معمارية الواجهة الأمامية الثابتة

## 1. الوضع الحالي والمشكلة

- `src/components/` يحتوي 50+ ملف مسطح
- لا يوجد فصل بين Features
- `src/domain/` ضخم لكن Frontend يستورد منه مباشرة بدون طبقة Application

## 2. الهيكل المقترح (Feature-Sliced Design)

```
src/
├── app/                      # App shell, routing, providers
│   ├── App.tsx
│   ├── router.tsx
│   └── providers/
│       ├── AuthProvider
│       ├── TenantProvider (NEW - يحمل companyId الحالي)
│       └── QueryProvider (React Query)
│
├── foundation/               # ثابت - لا يعتمد على features
│   ├── money/                # Money VO للعرض
│   ├── api/                  # apiClient (fetch wrapper + idempotency + correlation)
│   ├── auth/                 # useAuth, guards
│   └── ui/                   # Button, Input, Modal (Design System)
│
├── features/                 # كل ميزة معزولة
│   ├── company/              # NEW
│   │   ├── api/              # companyApi.ts
│   │   ├── model/            # types, permissions
│   │   ├── hooks/            # useCompanies, useCompanySummary
│   │   └── components/       # CompanyList, CompanyForm, CompanySummaryCard
│   │
│   ├── pos/
│   │   ├── api/
│   │   ├── model/            # Order, OrderItem types
│   │   ├── hooks/            # useOrders, useCreateOrder
│   │   ├── store/            # posStateService (Zustand)
│   │   └── components/
│   │       ├── POSLayout
│   │       ├── ProductGrid
│   │       ├── Cart
│   │       └── ReceiptModal
│   │
│   ├── branch/
│   ├── inventory/
│   ├── accounting/
│   ├── zatca/
│   └── ...
│
├── pages/                    # صفحات تجمع features
│   ├── POSPage
│   ├── CompaniesPage (NEW)
│   ├── BranchesPage
│   └── ...
│
└── shared/                   # مشترك بين features
    ├── lib/                  # utils
    └── config/               # permissions.ts, brand.ts
```

## 3. State Management

**الحالي:** `posStateService` (custom) + React state

**المقترح:**
- **Server State:** TanStack Query (React Query) - للـ orders, companies, etc. يتعامل مع caching, sync, retry تلقائياً.
- **Client State:** Zustand (خفيف) - للـ cart, selected company, terminal state.
- **Edge State:** IndexedDB via `edgeDatabase` - للـ offline.

```ts
// مثال: useCompanies hook
import { useQuery } from '@tanstack/react-query'
import { companyApi } from '@/features/company/api/companyApi'

export function useCompanies() {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => companyApi.list(),
    staleTime: 5 * 60 * 1000, // 5 min
  })
}
```

## 4. Company Context Provider (NEW - مهم)

```tsx
// TenantProvider الجديد يحمل companyId
interface TenantContextValue {
  organizationId: string
  currentCompanyId: string | null
  currentBranchId: string | null
  companies: Company[]
  setCurrentCompany: (id: string) => void
  setCurrentBranch: (id: string) => void
}

const TenantContext = createContext<TenantContextValue>(...)

// Usage in POS
function POSPage() {
  const { currentCompanyId, currentBranchId } = useTenant()
  const { data: orders } = useOrders({ companyId: currentCompanyId, branchId: currentBranchId })
}
```

- المستخدم يختار Company من Dropdown في Header
- كل API call يرسل `X-Company-Id` تلقائياً عبر `apiClient`
- إذا المستخدم له Company واحدة فقط، تُختار تلقائياً

## 5. RBAC Guards في Frontend

```tsx
// مكون حماية
function RequirePermission({ permission, children }) {
  const { user } = useAuth()
  const { currentCompanyId } = useTenant()
  if (!hasPermission(user, currentCompanyId, permission)) {
    return <AccessDenied />
  }
  return children
}

// Usage
<RequirePermission permission="pos:order:create">
  <CreateOrderButton />
</RequirePermission>
```

## 6. Offline-First في Frontend

```ts
// apiClient يتعامل مع offline
class ApiClient {
  async post(url, body) {
    const idempotencyKey = uuid()
    try {
      return await fetch(url, {
        method: 'POST',
        headers: { 'Idempotency-Key': idempotencyKey, ... },
        body: JSON.stringify(body)
      })
    } catch (e) {
      if (!navigator.onLine) {
        // حفظ في IndexedDB outbox
        await edgeDatabase.saveOutbox({
          id: idempotencyKey,
          url, body, method: 'POST',
          vectorClock: getNextVector(),
        })
        return { queued: true, idempotencyKey }
      }
      throw e
    }
  }
}
```

- UI يظهر Badge "Offline - 3 عمليات معلقة"
- عند عودة الإنترنت، Sync worker يرسل تلقائياً

## 7. Design System ثابت

- `foundation/ui/` يحتوي مكونات أساسية: Button, Input, Card, Modal, Table
- لا نستخدم مكتبة UI ثقيلة (MUI) - Tailwind كافي
- كل Feature يستخدم نفس المكونات لضمان Consistency

## 8. Performance

- Code Splitting: كل Feature يُحمل lazy
```tsx
const POSPage = lazy(() => import('@/pages/POSPage'))
const CompaniesPage = lazy(() => import('@/pages/CompaniesPage'))
```
- Virtualization للـ Product Grid (1000+ منتج)
- Debounce للـ Search

## 9. خارطة طريق Frontend

1.  إنشاء `foundation/api/apiClient.ts` + `foundation/money/`
2.  إنشاء `app/providers/TenantProvider` (Company selector)
3.  نقل `pos` من `components/pos/` إلى `features/pos/`
4.  إنشاء `features/company/` (جديد)
5.  إضافة TanStack Query
6.  تدريجياً نقل باقي Features
