# Plan: Add Purchase Request Notifications to Admin System

## Goal
Add admin notifications when users create new orders (purchase requests) so admins are alerted immediately.

## Current State
- **AdminNotification model** exists with `type`, `title`, `body`, `productId`, `reviewId`, `read`, `createdAt`
- **Reviews** already trigger notifications via `/api/reviews/route.ts` (type: "review")
- **Orders** are created via `/api/orders/route.ts` POST with status "pending"
- **Admin approves** orders via `/api/admin/orders/route.ts` PATCH (pending → processing)

## Implementation Plan

### 1. Add "order" notification type to AdminNotification model
No schema change needed - `type` is a String field, can accept "order"

### 2. Create notification when order is placed (`/api/orders/route.ts` POST)
After successful order creation, create `AdminNotification`:
- `type`: "order"
- `title`: "سفارش جدید دریافت شد"
- `body`: `{userName} سفارشی به مبلغ {total} ثبت کرد`
- `productId`: first product in order (for deep-link to admin products page)
- Could also add `orderId` field to model (optional, for future deep-link to orders page)

### 3. Update AdminNotificationBell component
- Handle "order" type notifications (display is already generic - should work)
- Optional: Add deep-link to `/admin/orders?focus={orderId}` when clicking notification

### 4. Consider adding `orderId` field to AdminNotification model
For future deep-linking to specific order in admin panel

## Files to Modify
1. `src/app/api/orders/route.ts` - Create notification after order creation
2. `prisma/schema.prisma` - Optional: add `orderId` field to AdminNotification
3. `src/components/AdminNotificationBell.tsx` - Optional: handle order deep-link

## Edge Cases
- Guest orders (no userId) - use email from order
- Order with multiple products - link to first product or orders page
- Notification spam - limit to one per order creation

## Validation
- Place order as user → check admin notification bell shows "سفارش جدید"
- Click notification → should navigate appropriately
- Mark as read → should update unread count