-- CreateTable
CREATE TABLE "Vendedor" (
    "id_seller" TEXT NOT NULL,
    "clerk_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "sales_made" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "Vendedor_pkey" PRIMARY KEY ("id_seller")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendedor_clerk_user_id_key" ON "Vendedor"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Vendedor_email_key" ON "Vendedor"("email");
