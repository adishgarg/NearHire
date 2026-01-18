-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "next_billing_at" TIMESTAMP(3),
ADD COLUMN     "razorpay_customer_id" TEXT,
ADD COLUMN     "razorpay_subscription_id" TEXT;
