-- CreateTable
CREATE TABLE "Message" (
    "sender" TEXT NOT NULL,
    "receiver" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);
