import { AuditLog } from "../../database/models.js";

const create = async (
    auditData,
    transaction = null
) => {
    return await AuditLog.create(
        auditData,
        {
            transaction,
        }
    );
};

const findAll = async () => {
    return await AuditLog.findAll({
        order: [["created_at", "DESC"]],
    });
};

const findByEntity = async (
    entityType,
    entityId
) => {
    return await AuditLog.findAll({
        where: {
            entity_type: entityType,
            entity_id: entityId,
        },
        order: [["created_at", "DESC"]],
    });
};

export {
    create,
    findAll,
    findByEntity,
};