-- Architecture studio domain. Additive & backward compatible:
-- existing rows and API payloads keep working.

-- Booking → enquiry / consultation request
ALTER TABLE "Booking" ALTER COLUMN "age" DROP NOT NULL;
ALTER TABLE "Booking" ALTER COLUMN "gender" DROP NOT NULL;
ALTER TABLE "Booking" ADD COLUMN "projectType" TEXT;
ALTER TABLE "Booking" ADD COLUMN "budget" TEXT;
ALTER TABLE "Booking" ADD COLUMN "location" TEXT;
ALTER TABLE "Booking" ADD COLUMN "assignedTo" TEXT;
ALTER TABLE "Booking" ADD COLUMN "followUpDate" TIMESTAMP(3);
ALTER TABLE "Booking" ADD COLUMN "projectId" INTEGER;

-- Service default category
ALTER TABLE "Service" ALTER COLUMN "category" SET DEFAULT 'architecture';

-- Projects
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'residential',
    "status" TEXT NOT NULL DEFAULT 'concept',
    "location" TEXT,
    "year" INTEGER,
    "area" TEXT,
    "summary" TEXT,
    "concept" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "gallery" TEXT[],
    "materials" TEXT[],
    "specs" TEXT[],
    "services" TEXT[],
    "clientName" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "budget" INTEGER,
    "startDate" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "documents" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- Team
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "discipline" TEXT NOT NULL DEFAULT 'architect',
    "photo" TEXT,
    "bio" TEXT,
    "email" TEXT,
    "linkedin" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
