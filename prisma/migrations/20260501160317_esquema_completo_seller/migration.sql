-- CreateEnum
CREATE TYPE "EstadoOrden" AS ENUM ('CREADA', 'PAGADA', 'CANCELADA', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "EstadoPaquete" AS ENUM ('PREPARADO', 'RETIRADO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "Categoria" (
    "id_category" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id_category")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id_item" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "discount_price" DECIMAL(65,30),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "id_seller" TEXT NOT NULL,
    "id_category" TEXT NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id_item")
);

-- CreateTable
CREATE TABLE "OrdenCompra" (
    "id_purchase_order" TEXT NOT NULL,
    "id_buyer" TEXT NOT NULL,
    "id_buyer_app" TEXT NOT NULL,
    "total_price" DECIMAL(65,30) NOT NULL,
    "id_payment_operation" TEXT,
    "status" "EstadoOrden" NOT NULL DEFAULT 'CREADA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrdenCompra_pkey" PRIMARY KEY ("id_purchase_order")
);

-- CreateTable
CREATE TABLE "Paquete" (
    "id_package" TEXT NOT NULL,
    "id_seller_app" TEXT NOT NULL,
    "price_package" DECIMAL(65,30) NOT NULL,
    "status" "EstadoPaquete" NOT NULL DEFAULT 'PREPARADO',
    "id_purchase_order" TEXT NOT NULL,
    "id_seller" TEXT NOT NULL,

    CONSTRAINT "Paquete_pkey" PRIMARY KEY ("id_package")
);

-- CreateTable
CREATE TABLE "ArticuloPaquete" (
    "id_item_package" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "sale_price" DECIMAL(65,30) NOT NULL,
    "id_package" TEXT NOT NULL,
    "id_item" TEXT NOT NULL,

    CONSTRAINT "ArticuloPaquete_pkey" PRIMARY KEY ("id_item_package")
);

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_id_seller_fkey" FOREIGN KEY ("id_seller") REFERENCES "Vendedor"("id_seller") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "Categoria"("id_category") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paquete" ADD CONSTRAINT "Paquete_id_purchase_order_fkey" FOREIGN KEY ("id_purchase_order") REFERENCES "OrdenCompra"("id_purchase_order") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paquete" ADD CONSTRAINT "Paquete_id_seller_fkey" FOREIGN KEY ("id_seller") REFERENCES "Vendedor"("id_seller") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloPaquete" ADD CONSTRAINT "ArticuloPaquete_id_package_fkey" FOREIGN KEY ("id_package") REFERENCES "Paquete"("id_package") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloPaquete" ADD CONSTRAINT "ArticuloPaquete_id_item_fkey" FOREIGN KEY ("id_item") REFERENCES "Producto"("id_item") ON DELETE RESTRICT ON UPDATE CASCADE;
