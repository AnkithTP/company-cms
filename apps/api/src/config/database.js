import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isRemote =
  Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL) ||
  (process.env.DB_HOST &&
    process.env.DB_HOST !== "localhost" &&
    process.env.DB_HOST !== "127.0.0.1");

const sslConfig =
  process.env.DB_SSL === "true" || (isRemote && process.env.DB_SSL !== "false")
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {};

let sequelize;

if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  sequelize = new Sequelize(connectionString, {
    dialect: "postgres",
    dialectOptions: sslConfig,
    logging: false,
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || "company_cms",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      dialect: "postgres",
      dialectOptions: sslConfig,
      logging: false,
    }
  );
}

export default sequelize;