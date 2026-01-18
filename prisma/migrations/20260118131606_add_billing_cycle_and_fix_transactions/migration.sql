-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'SUCCESS';

-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'SUBSCRIPTION';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "billing_cycle" TEXT NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "payment_method" TEXT,
ALTER COLUMN "platform_fee" DROP NOT NULL,
ALTER COLUMN "payment_gateway" DROP NOT NULL;
