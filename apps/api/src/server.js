import "dotenv/config";

import app from "./app.js";
import sequelize from "./config/database.js";
import "./database/models.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();

        console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(
            "Unable to connect to the database:",
            error.message
        );
        process.exit(1);
    }
};

startServer();