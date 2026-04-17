/*
  Warnings:

  - You are about to drop the column `productImage` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "productImage";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "image";
