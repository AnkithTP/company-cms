import * as auditRepository
    from "./audit-log.repository.js";

const createAuditLog = async ({
    userId,
    action,
    entityType,
    entityId,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    transaction = null,
}) => {
    return await auditRepository.create(
        {
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            old_values: oldValues,
            new_values: newValues,
            ip_address: ipAddress,
        },
        transaction
    );
};

const getEntityAuditLogs = async (
    entityType,
    entityId
) => {
    return await auditRepository.findByEntity(
        entityType,
        entityId
    );
};

export {
    createAuditLog,
    getEntityAuditLogs,
};