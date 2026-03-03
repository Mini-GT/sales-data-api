-- DropIndex
DROP INDEX "Sale_customerId_productId_key";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1;
