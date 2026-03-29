CREATE TYPE "ProductType" AS ENUM ('product', 'service');

CREATE TYPE "ProposalStatus" AS ENUM ('draft', 'sent', 'approved', 'rejected');

CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "products_services" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "type" "ProductType" NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "proposals" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "sequential_number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ProposalStatus" NOT NULL DEFAULT 'draft',
    "proposal_date" DATE NOT NULL,
    "followup_date" DATE,
    "notes" TEXT,
    "public_link_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "proposal_items" (
    "id" SERIAL NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "product_service_id" INTEGER,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,
    "whatsapp_default_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "proposals_public_link_uuid_key" ON "proposals"("public_link_uuid");
CREATE UNIQUE INDEX "proposals_account_id_sequential_number_key" ON "proposals"("account_id", "sequential_number");
CREATE UNIQUE INDEX "settings_account_id_key" ON "settings"("account_id");

CREATE INDEX "users_account_id_idx" ON "users"("account_id");
CREATE INDEX "customers_account_id_idx" ON "customers"("account_id");
CREATE INDEX "products_services_account_id_idx" ON "products_services"("account_id");
CREATE INDEX "proposals_account_id_idx" ON "proposals"("account_id");
CREATE INDEX "proposals_customer_id_idx" ON "proposals"("customer_id");
CREATE INDEX "proposal_items_proposal_id_idx" ON "proposal_items"("proposal_id");
CREATE INDEX "proposal_items_product_service_id_idx" ON "proposal_items"("product_service_id");

ALTER TABLE "users"
ADD CONSTRAINT "users_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "customers"
ADD CONSTRAINT "customers_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "products_services"
ADD CONSTRAINT "products_services_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "proposals"
ADD CONSTRAINT "proposals_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "proposals"
ADD CONSTRAINT "proposals_customer_id_fkey"
FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "proposal_items"
ADD CONSTRAINT "proposal_items_proposal_id_fkey"
FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "proposal_items"
ADD CONSTRAINT "proposal_items_product_service_id_fkey"
FOREIGN KEY ("product_service_id") REFERENCES "products_services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "settings"
ADD CONSTRAINT "settings_account_id_fkey"
FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
