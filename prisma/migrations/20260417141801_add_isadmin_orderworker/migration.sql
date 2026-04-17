-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OrderWorker" (
    "orderId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,

    CONSTRAINT "OrderWorker_pkey" PRIMARY KEY ("orderId","workerId")
);

-- AddForeignKey
ALTER TABLE "OrderWorker" ADD CONSTRAINT "OrderWorker_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderWorker" ADD CONSTRAINT "OrderWorker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
