-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "canceled_at" TIMESTAMP(3),
ADD COLUMN     "cancellation_details" TEXT,
ADD COLUMN     "cancellation_reason" TEXT;
