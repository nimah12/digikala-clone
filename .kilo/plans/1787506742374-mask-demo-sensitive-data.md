# Plan: Mask Sensitive Data for Demo Users

## Goal
Hide sensitive information (emails, phones, addresses, names) for demo users (`role: "demo"`) in the admin panel while maintaining full visibility for real admins.

## Current State
- Demo users have `role: "demo"` and read-only access via `requireAdmin()`
- They can view all admin pages but see full sensitive data
- `/api/admin/me` returns `{ id, name, email, role }` - includes role

## Data to Mask for Demo Users

| Page/Component | Sensitive Fields | Masking Strategy |
|----------------|------------------|------------------|
| **Users list** | `email`, `phone` | Mask: `u***@domain.com`, `09*** *** ***` |
| **Orders list** | `receiverName`, `phone`, `address`, `user.name`, `user.email` | Mask: `***`, `09*** *** ***`, `***` |
| **Email settings** | `fromEmail`, `adminEmail` | Already masked in API (partial) |

## Implementation Plan

### 1. Add Masking Helper Functions (Server-side)
Create shared masking utilities in `src/lib/admin.ts`:

```typescript
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.length > 2 ? `${local.slice(0, 2)}***` : "***";
  return `${masked}@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return `${digits.slice(0, 3)}*** ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return "09*** *** ***";
}

export function maskName(name: string): string {
  return "***";
}

export function maskAddress(address: string): string {
  return "***";
}
```

### 2. Update API Routes to Mask for Demo Users

**A. `/api/admin/users/route.ts` (GET)**
- Check `auth.user.role === "demo"`
- If demo: apply masking to `email` and `phone` in response

**B. `/api/admin/orders/route.ts` (GET)**
- Check `auth.user.role === "demo"`
- If demo: mask `receiverName`, `phone`, `address` in each order
- Also mask `user.name` and `user.email` in the nested user object

**C. `/api/admin/me/route.ts`** (already returns role - no change needed)

### 3. Client-Side Safety Layer (Defense in Depth)
Add a demo-check hook/context and conditional rendering in:
- `src/app/admin/users/page.tsx` - mask email/phone in table
- `src/app/admin/orders/page.tsx` - mask receiver info in table and expanded view
- `src/app/admin/email/page.tsx` - already masked by API, but verify

### 4. Demo User Indicator (UX)
Add a subtle badge in admin layout header when logged in as demo user.

## Files to Modify

1. `src/lib/admin.ts` - Add masking helpers + export
2. `src/app/api/admin/users/route.ts` - Mask for demo
3. `src/app/api/admin/orders/route.ts` - Mask for demo
4. `src/app/admin/users/page.tsx` - Client-side masking fallback
4. `src/app/admin/orders/page.tsx` - Client-side masking fallback
5. `src/app/admin/email/page.tsx` - Verify masking works
6. `src/app/admin/layout.tsx` - Add demo badge indicator

## Validation
- Login as demo user (`demo@digikala-clone.local`)
- Verify all sensitive fields are masked in Users, Orders, Email pages
- Login as real admin - verify full data visible
- Verify demo user cannot mutate (POST/PATCH/DELETE blocked)
- Verify export Excel also masks for demo users

## Out of Scope
- Database-level restrictions (RLS)
- Audit logging of demo access
- Rate limiting for demo users