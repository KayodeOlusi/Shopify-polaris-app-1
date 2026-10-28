-- CreateTable
CREATE TABLE "ShopSettings" (
    "shop" TEXT NOT NULL PRIMARY KEY,
    "defaultDestination" TEXT NOT NULL DEFAULT 'product',
    "brandLabel" TEXT NOT NULL DEFAULT 'QR Studio',
    "foregroundColor" TEXT NOT NULL DEFAULT '#000000',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "showProductImages" BOOLEAN NOT NULL DEFAULT true,
    "defaultSort" TEXT NOT NULL DEFAULT 'newest',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

