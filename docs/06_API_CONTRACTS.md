# عقود API الثابتة - Versioned & Idempotent

## 1. الهيكل العام

```
/api/v1/
├── /auth
│   ├── POST /login
│   └── POST /refresh
├── /organizations
│   ├── GET /me
│   └── GET /consolidated-sales
├── /companies (NEW)
│   ├── GET /
│   ├── POST /
│   ├── GET /:companyId
│   ├── PUT /:companyId
│   ├── GET /:companyId/branches
│   └── GET /:companyId/summary
├── /branches
│   ├── GET /?companyId=...
│   ├── POST /
│   └── ...
├── /orders
│   ├── GET /?branchId=&status=&from=&to=
│   ├── POST /
│   ├── GET /:orderId
│   ├── POST /:orderId/pay
│   ├── POST /:orderId/void
│   └── POST /:orderId/refund
├── /shifts
├── /inventory
├── /accounting
├── /zatca
└── /sync
    ├── POST /push
    └── GET /pull?since=&companyId=&branchId=
```

## 2. Headers ثابتة

**Request:**
```
Authorization: Bearer <HMAC_TOKEN>
X-Correlation-Id: req-abc123 (optional, auto-generated)
Idempotency-Key: uuid-v4 (required for POST/PUT/PATCH)
X-Company-Id: comp_123 (optional, for multi-company context)
X-Branch-Id: branch_456
```

**Response:**
```
X-Correlation-Id: req-abc123
X-RateLimit-Remaining: 99
Content-Type: application/json
```

## 3. Idempotency Contract

- Client يرسل `Idempotency-Key` لكل عملية كتابة
- Server يحفظ `idempotency_key` في جدول العملية (orders, journal_entries, outbox_events)
- إذا تكرر نفس المفتاح، Server يرجع نفس Response السابق (لا يعيد التنفيذ)
- المفتاح صالح 24h

```ts
// Middleware
async function idempotencyMiddleware(req, res, next) {
  const key = req.header('Idempotency-Key')
  if (!key && req.method !== 'GET') {
    return res.status(400).json({ error: { code: 'IDEMPOTENCY_KEY_REQUIRED' } })
  }
  const existing = await db.query(
    `SELECT response_status, response_body FROM idempotency_keys WHERE key = $1 AND tenant_id = $2`,
    [key, req.tenantId]
  )
  if (existing) {
    return res.status(existing.response_status).json(existing.response_body)
  }
  next()
}
```

## 4. Error Contract موحد

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order with id ord_123 not found",
    "correlationId": "req-abc123",
    "details": {
      "orderId": "ord_123"
    },
    "timestamp": "2026-09-04T12:00:00Z"
  }
}
```

**Codes ثابتة:**
- `UNAUTHORIZED`, `FORBIDDEN`, `TENANT_MISMATCH`, `COMPANY_ACCESS_DENIED`
- `VALIDATION_ERROR`, `ORDER_ALREADY_PAID`, `SHIFT_ALREADY_CLOSED`
- `ZATCA_REJECTED`, `INSUFFICIENT_STOCK`, `IDEMPOTENCY_KEY_REQUIRED`

## 5. Pagination & Filtering

```ts
// Request
GET /api/v1/orders?companyId=comp_1&branchId=br_1&status=COMPLETED&from=2026-08-01&to=2026-08-31&page=1&limit=50&sort=created_at:desc

// Response
{
  "data": [ { order }, ... ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "totalPages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 6. Money في API

**لا نرسل float أبداً.**

```json
{
  "subtotal": {
    "minor": 10000,
    "major": "100.00",
    "currency": "SAR",
    "formatted": "SAR 100.00"
  }
}
```

أو باختصار (للـ POS السريع):
```json
{
  "subtotal_minor": 10000,
  "currency": "SAR"
}
```
Frontend يحول minor -> major للعرض باستخدام Money VO.

## 7. مثال عقد إنشاء طلب (Core)

```ts
POST /api/v1/orders
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

Request:
{
  "companyId": "comp_abc",
  "branchId": "branch_xyz",
  "terminalId": "term_001",
  "orderType": "DINE_IN",
  "tableId": "table_5",
  "guestCount": 2,
  "items": [
    {
      "menuItemId": "item_burger",
      "quantity": 2,
      "selectedModifiers": [
        { "groupId": "g_size", "optionId": "o_large" }
      ],
      "notes": "بدون بصل"
    }
  ],
  "discount": {
    "type": "PERCENTAGE",
    "value": 10,
    "reason": "VIP"
  },
  "customerId": "cust_123"
}

Response 201:
{
  "id": "ord_789",
  "orderNumber": "#ORD-1049",
  "status": "PENDING",
  "subtotal_minor": 10000,
  "discount_minor": 1000,
  "vat_amount_minor": 1350,
  "total_minor": 10350,
  "currency": "SAR",
  "items": [...],
  "zatcaStatus": "PENDING",
  "createdAt": "2026-09-04T12:00:00Z"
}
```

## 8. Sync API (Offline-First)

```ts
POST /api/v1/sync/push
Body: {
  "deviceId": "pos_001",
  "events": [
    {
      "id": "evt_local_1",
      "type": "ORDER_CREATED",
      "aggregateId": "ord_789",
      "payload": { ... },
      "vectorClock": { "pos_001": 5 },
      "idempotencyKey": "idem_123",
      "createdAt": "2026-09-04T12:00:00Z"
    }
  ]
}

GET /api/v1/sync/pull?since=2026-09-04T11:00:00Z&companyId=comp_abc&branchId=branch_xyz&vector={"pos_001":4}
Response: {
  "events": [...],
  "newVector": {"pos_001":5, "server": 100},
  "hasMore": false
}
```

## 9. Versioning Strategy

- `/api/v1/` ثابت
- عند Breaking Change، ننشئ `/api/v2/` ونبقي v1 لمدة 6 أشهر
- لا Breaking Change في v1 إلا بـ ADR

## 10. OpenAPI

- نقترح توليد OpenAPI spec من Zod schemas (مستقبلاً)
- حالياً: توثيق Markdown + أمثلة
