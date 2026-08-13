-- جلسات چت ربات پشتیبان — تاریخچه و کانتکست مکالمه
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "context" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);
