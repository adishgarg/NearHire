-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'BOTH');

-- AlterTable
ALTER TABLE "gigs" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "availability" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "hourly_rate" DOUBLE PRECISION,
ADD COLUMN     "interests" TEXT,
ADD COLUMN     "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profile_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "user_role" "UserRole";
