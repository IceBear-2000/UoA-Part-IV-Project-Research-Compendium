-- CreateEnum
CREATE TYPE "Curriculum" AS ENUM ('NCERT', 'NZC');

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "curriculum" "Curriculum" NOT NULL DEFAULT 'NCERT';
