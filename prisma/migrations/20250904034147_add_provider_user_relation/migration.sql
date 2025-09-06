/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `providers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."providers" ADD COLUMN     "user_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "providers_user_id_key" ON "public"."providers"("user_id");

-- AddForeignKey
ALTER TABLE "public"."providers" ADD CONSTRAINT "providers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
