-- CreateTable
CREATE TABLE "ClinicSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "fullName" TEXT,
    "tagline" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "addressFull" TEXT,
    "mapsEmbedUrl" TEXT,
    "heroVideoUrl" TEXT,
    "heroImageUrl" TEXT,
    "hours" JSONB,
    "stats" JSONB,
    "socials" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicSettings_pkey" PRIMARY KEY ("id")
);
