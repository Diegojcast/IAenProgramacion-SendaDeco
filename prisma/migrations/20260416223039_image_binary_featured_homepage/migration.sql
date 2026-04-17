-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "imageData" BYTEA,
ADD COLUMN     "imageHeight" INTEGER,
ADD COLUMN     "imageMime" TEXT,
ADD COLUMN     "imageWidth" INTEGER;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "imageData" BYTEA NOT NULL,
    "imageMime" TEXT NOT NULL DEFAULT 'image/webp',
    "imageWidth" INTEGER,
    "imageHeight" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSettings" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "heroImageData" BYTEA,
    "heroImageMime" TEXT,
    "heroAlt" TEXT NOT NULL DEFAULT 'Decoración hecha a mano',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
