import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
import "./database/models.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
const initDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Unable to connect to the database:", error.message);
        // Only exit process in local standalone dev, never in serverless environments like Vercel
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};

initDatabase();

// Only listen locally, Vercel serverless exports the app handler directly
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;