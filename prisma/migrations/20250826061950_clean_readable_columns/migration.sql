/*
  Warnings:

  - You are about to drop the column `display_name` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `rating_avg` on the `providers` table. All the data in the column will be lost.
  - You are about to drop the column `reviewer_avatar` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `reviewer_name` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `duration_mins` on the `services` table. All the data in the column will be lost.
  - Added the required column `name` to the `providers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `reviews` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."providers" DROP COLUMN "display_name",
DROP COLUMN "rating_avg",
ADD COLUMN     "average_rating" DOUBLE PRECISION,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."reviews" DROP COLUMN "reviewer_avatar",
DROP COLUMN "reviewer_name",
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."services" DROP COLUMN "duration_mins",
ADD COLUMN     "duration_minutes" INTEGER;
