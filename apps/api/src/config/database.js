import { Sequelize } from "sequelize";
import pg from "pg";

console.log("DB DEBUG:", {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  passwordType: typeof process.env.DB_PASSWORD,
  passwordExists: !!process.env.DB_PASSWORD,
  passwordLength: process.env.DB_PASSWORD
    ? process.env.DB_PASSWORD.length
    : 0,
});

const isNeon = process.env.DB_HOST?.includes("neon.tech");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    dialectModule: pg,

    ...(isNeon && {
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    }),

    logging: false,
  }
);

export default sequelize;