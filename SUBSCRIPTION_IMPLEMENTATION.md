# Seller Subscription Model - Implementation Guide

## Overview
A monthly subscription model has been implemented where sellers must maintain an active subscription to create and manage gigs on the platform.

## Subscription Plans

### 1. **BASIC** - ₹499/month
- Create up to 5 gigs
- Basic seller dashboard
- Email support
- 30-day subscription

### 2. **PROFESSIONAL** - ₹999/month (Recommended)
- Create up to 20 gigs
- Advanced analytics
- Priority email support
- Featured gig placement
- 30-day subscription

### 3. **PREMIUM** - ₹1999/month
- Unlimited gigs
- Advanced analytics & insights
- Priority 24/7 support
- Featured gig placement
- Promotional tools
- 30-day subscription

## Database Schema

### Subscription Model
```prisma
model Subscription {
  id              String    @id @default(cuid())
  userId          String    @unique
  plan            String    // BASIC, PROFESSIONAL, PREMIUM
  status          String    // ACTIVE, INACTIVE, EXPIRED, CANCELLED
  startDate       DateTime
  endDate         DateTime
  price           Decimal
  paymentId       String?
  orderId         String?
  isAutoRenew     Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  user            User      @relation(fields: [userId], references: [id])
}
```

## API Endpoints

### 1. GET `/api/subscription`
**Description**: Get current subscription status
**Response**:
```json
{
  "isActive": true,
  "subscription": {
    "plan": "PROFESSIONAL",
    "status": "ACTIVE",
    "endDate": "2026-02-11T00:00:00Z",
    "startDate": "2026-01-11T00:00:00Z",
    "isAutoRenew": true
  }
}
```

### 2. POST `/api/subscription`
**Description**: Create a new subscription order
**Request**:
```json
{
  "plan": "PROFESSIONAL"
}
```
**Response**:
```json
{
  "success": true,
  "orderId": "order_xxxxx",
  "amount": 99900,
  "currency": "INR",
  "plan": "PROFESSIONAL",
  "userId": "user_id",
  "userName": "John Doe",
  "userEmail": "john@example.com"
}
```

### 3. POST `/api/subscription/verify`
**Description**: Verify payment and activate subscription
**Request**:
```json
{
  "paymentId": "pay_xxxxx",
  "orderId": "order_xxxxx",
  "signature": "signature_xxxxx",
  "plan": "PROFESSIONAL",
  "amount": 99900
}
```

### 4. POST `/api/subscription/cancel`
**Description**: Cancel active subscription
**Response**:
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "subscription": {
    "plan": "PROFESSIONAL",
    "status": "CANCELLED",
    "endDate": "2026-02-11T00:00:00Z"
  }
}
```

## Key Implementation Details

### 1. Subscription Check on Gig Creation
When a seller tries to create a gig:
- System checks if user has `SELLER` or `BOTH` role
- System checks if subscription is active (status = 'ACTIVE' and endDate > now)
- If no active subscription, request is rejected with appropriate error message

```typescript
const hasActiveSubscription = await isSellerSubscriptionActive(user.id);
if (!hasActiveSubscription) {
  return NextResponse.json({
    error: 'Active subscription required to create gigs. Please subscribe to continue.'
  }, { status: 403 });
}
```

### 2. Payment Flow
1. User selects a plan on `/subscription` page
2. System creates Razorpay order via `/api/subscription` POST
3. Razorpay modal opens for payment
4. Upon successful payment, Razorpay returns payment details
5. Client verifies payment via `/api/subscription/verify` POST
6. System creates/updates subscription in database
7. User is redirected to dashboard with success message

### 3. Subscription Status Utility Functions
Located in `src/lib/subscription.ts`:

```typescript
// Check if seller has active subscription
export async function isSellerSubscriptionActive(userId: string): Promise<boolean>

// Get detailed subscription status
export async function getSellerSubscriptionStatus(userId: string)
```

## User Interface

### Subscription Management Page (`/subscription`)
- Displays all available plans with pricing and features
- Shows current subscription status (if any)
- Plan comparison
- "Subscribe Now" buttons for each plan
- FAQ section
- Cancel subscription option for active subscribers

### Navigation Integration
- "Manage Subscription" option added to user dropdown menu in header
- Accessible to all authenticated users

## Workflow Examples

### Example 1: New Seller Subscribing
1. Seller signs up and completes onboarding
2. Attempts to create first gig
3. System blocks with "Active subscription required" message
4. User navigates to `/subscription`
5. Selects desired plan and clicks "Subscribe Now"
6. Completes Razorpay payment
7. Subscription activated
8. Can now create gigs immediately

### Example 2: Upgrading Plan
1. Seller with BASIC plan wants to upgrade to PROFESSIONAL
2. Navigates to `/subscription` (or "Manage Subscription" in menu)
3. Clicks "Subscribe Now" on PROFESSIONAL plan
4. Completes payment
5. Plan is upgraded, subscription end date extends by 30 days
6. Gig creation limit increased from 5 to 20

### Example 3: Subscription Expires
1. Seller's subscription expires (endDate passed)
2. Attempt to create/edit gigs fails
3. User sees notification to renew subscription
4. Navigates to `/subscription` and purchases new plan
5. Can immediately continue selling

## Future Enhancements

1. **Auto-Renewal**: Currently subscriptions don't auto-renew, but infrastructure supports it
2. **Payment History**: Add `/api/subscription/history` endpoint for payment records
3. **Invoice Generation**: Generate and email invoices for subscriptions
4. **Subscription Tiers**: Tie plan to features dynamically (gig limits, analytics, etc.)
5. **Promotional Codes**: Implement discount codes for subscriptions
6. **Annual Plans**: Offer annual subscription with discount
7. **Webhook Handling**: Handle Razorpay webhooks for automatic status updates
8. **Cron Jobs**: Auto-deactivate gigs when subscription expires
9. **Email Notifications**: Send reminders before subscription expiration
10. **Referral System**: Reward referrals with free/discounted subscriptions

## Environment Variables Required

```env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
```

## Testing Checklist

- [ ] Create subscription order for each plan
- [ ] Test Razorpay payment verification
- [ ] Verify seller can't create gigs without subscription
- [ ] Test subscription upgrade
- [ ] Test subscription cancellation
- [ ] Verify subscription expiry check
- [ ] Test auto-renewal toggle
- [ ] Verify database records created correctly
- [ ] Test error handling for payment failures
- [ ] Verify email confirmations sent

## Security Considerations

1. **Signature Verification**: All payments are verified using HMAC-SHA256 signature
2. **Authentication**: All endpoints require authenticated session
3. **User Isolation**: Users can only manage their own subscriptions
4. **Role-Based Access**: Only sellers can have subscriptions
5. **Amount Verification**: Always verify amount matches plan pricing

## Troubleshooting

### Subscription not showing as active
- Check endDate hasn't passed
- Verify status is 'ACTIVE' in database
- Clear browser cache and refresh

### Payment verification failing
- Verify RAZORPAY_KEY_SECRET is correct
- Check payment signature calculation
- Ensure orderId and paymentId are correct

### Can't create gigs after payment
- Refresh page or clear session
- Verify subscription status endpoint returns isActive: true
- Check database subscription record exists

## Contact & Support

For issues or questions about the subscription system, refer to the API documentation or contact the development team.
