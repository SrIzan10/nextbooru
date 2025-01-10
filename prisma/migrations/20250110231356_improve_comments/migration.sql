/*
  Warnings:

  - You are about to drop the column `downvotes` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "downvotes",
ADD COLUMN     "votedBy" TEXT[];
