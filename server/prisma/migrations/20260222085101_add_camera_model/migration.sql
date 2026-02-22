-- CreateTable
CREATE TABLE "rentals" (
    "id" SERIAL NOT NULL,
    "ClientName" TEXT NOT NULL,
    "roomNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "rentAmount" DECIMAL(65,30) NOT NULL DEFAULT 50,
    "depositAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "startDate" TEXT,
    "endDate" TEXT,
    "notes" TEXT,
    "clientPhone" TEXT,
    "clientEmail" TEXT,
    "clientAddress" TEXT,
    "nationality" TEXT,
    "gender" TEXT,
    "occupation" TEXT,
    "idCardType" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 1,
    "clientIDCard" TEXT,
    "clientImageCardFront" TEXT,
    "clientImageCardBack" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "telegramChatId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "image" TEXT,

    CONSTRAINT "rentals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bills" (
    "id" SERIAL NOT NULL,
    "rentalId" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "rentAmount" DECIMAL(65,30),
    "prevElectricityReading" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currElectricityReading" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "prevWaterReading" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currWaterReading" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "electricityAmount" DECIMAL(65,30) NOT NULL,
    "waterAmount" DECIMAL(65,30) NOT NULL,
    "electricityStatus" TEXT NOT NULL,
    "waterStatus" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "telegramBotToken" TEXT,
    "telegramChatId" TEXT,
    "telegramLanguage" TEXT NOT NULL DEFAULT 'en',
    "paymentBakongAccountId" TEXT,
    "paywayMerchantId" TEXT,
    "paywayApiKey" TEXT,
    "electricityRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "waterRate" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "exchangeRate" DECIMAL(65,30) NOT NULL DEFAULT 4100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cameras" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "streamUrl" TEXT,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cameras_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rentals_ClientName_idx" ON "rentals"("ClientName");

-- CreateIndex
CREATE INDEX "rentals_roomNumber_idx" ON "rentals"("roomNumber");

-- CreateIndex
CREATE INDEX "rentals_clientPhone_idx" ON "rentals"("clientPhone");

-- CreateIndex
CREATE INDEX "rentals_status_idx" ON "rentals"("status");

-- CreateIndex
CREATE INDEX "bills_rentalId_idx" ON "bills"("rentalId");

-- CreateIndex
CREATE INDEX "bills_month_idx" ON "bills"("month");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "expenses_category_idx" ON "expenses"("category");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- AddForeignKey
ALTER TABLE "bills" ADD CONSTRAINT "bills_rentalId_fkey" FOREIGN KEY ("rentalId") REFERENCES "rentals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
