/*
  Warnings:

  - A unique constraint covering the columns `[booking_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."bookings" ADD COLUMN     "provider_confirmed_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."reviews" ADD COLUMN     "booking_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "public"."reviews"("booking_id");

-- AddForeignKey
ALTER TABLE "public"."reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
