-- CreateTable
CREATE TABLE "WorkerDefaultAvailability" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "WorkerDefaultAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkerDefaultAvailability_workerId_dayOfWeek_key" ON "WorkerDefaultAvailability"("workerId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "WorkerDefaultAvailability" ADD CONSTRAINT "WorkerDefaultAvailability_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
