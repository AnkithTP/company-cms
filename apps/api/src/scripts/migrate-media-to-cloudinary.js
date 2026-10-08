import "dotenv/config";

import fs from "fs";
import path from "path";
import { promisify } from "util";

import sequelize from "../config/database.js";
import cloudinary from "../config/cloudinary.js";
import Media from "../modules/media/media.model.js";

const access = promisify(fs.access);

const uploadsDirectory = path.resolve(
    process.cwd(),
    "uploads"
);

const getResourceType = (mimeType) => {
    if (mimeType.startsWith("image/")) {
        return "image";
    }

    if (mimeType.startsWith("video/")) {
        return "video";
    }

    return "raw";
};

const uploadToCloudinary = async (filePath, media) => {
    const resourceType = getResourceType(media.mime_type);

    return cloudinary.uploader.upload(filePath, {
        folder: "company-cms",
        public_id: media.file_name,
        resource_type: resourceType,
    });
};

const migrate = async () => {
    console.log("========================================");
    console.log(" Cloudinary Media Migration");
    console.log("========================================");

    try {
        await sequelize.authenticate();

        console.log("✓ Database connection successful");

        const mediaRecords = await Media.findAll({
            order: [["created_at", "ASC"]],
        });

        console.log(`✓ Found ${mediaRecords.length} media records`);

        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        for (const media of mediaRecords) {
            console.log("\n----------------------------------------");
            console.log(`Media ID: ${media.id}`);
            console.log(`File: ${media.file_name}`);

            // Already migrated?
            if (
                media.url?.startsWith("https://res.cloudinary.com/") &&
                media.storage_path?.startsWith("company-cms/")
            ) {
                console.log("→ Already migrated. Skipping.");
                skippedCount++;
                continue;
            }

            const filePath = path.join(
                uploadsDirectory,
                media.file_name
            );

            try {
                await access(filePath, fs.constants.F_OK);
            } catch {
                console.error(`✗ Local file not found: ${filePath}`);
                failedCount++;
                continue;
            }

            try {
                console.log("→ Uploading to Cloudinary...");

                const result = await uploadToCloudinary(
                    filePath,
                    media
                );

                console.log("✓ Uploaded");

                console.log(`  Public ID: ${result.public_id}`);
                console.log(`  URL: ${result.secure_url}`);

                // Update PostgreSQL
                await media.update({
                    storage_path: result.public_id,
                    url: result.secure_url,
                });

                console.log("✓ Database record updated");

                successCount++;
            } catch (error) {
                console.error("✗ Migration failed");
                console.error(error.message);

                failedCount++;
            }
        }

        console.log("\n========================================");
        console.log(" Migration Summary");
        console.log("========================================");

        console.log(`Total records : ${mediaRecords.length}`);
        console.log(`Migrated      : ${successCount}`);
        console.log(`Skipped       : ${skippedCount}`);
        console.log(`Failed        : ${failedCount}`);

        console.log("========================================");

        if (failedCount > 0) {
            console.log(
                "⚠ Migration completed with failures."
            );
        } else {
            console.log(
                "✓ Migration completed successfully."
            );
        }
    } catch (error) {
        console.error("\nMigration stopped:");
        console.error(error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

migrate();