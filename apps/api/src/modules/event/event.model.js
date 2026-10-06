import { DataTypes } from "sequelize";
import sequelize from "../../config/database.js";

const EventDetail = sequelize.define(
    "EventDetail",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        content_id: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
        },

        event_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },

        start_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },

        end_time: {
            type: DataTypes.TIME,
            allowNull: true,
        },

        location: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },

        meeting_url: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },

        organizer: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },

        registration_url: {
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
    },
    {
        tableName: "event_details",
        timestamps: true,
        underscored: true,
    }
);

export default EventDetail;