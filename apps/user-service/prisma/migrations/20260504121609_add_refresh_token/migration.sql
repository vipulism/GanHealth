/*
  Warnings:

  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `refreshToken` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';
