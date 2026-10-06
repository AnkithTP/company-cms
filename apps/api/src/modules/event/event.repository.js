import EventDetail from "./event.model.js";

export const create = async (
    eventData,
    transaction = null
) => {
    return EventDetail.create(eventData, {
        transaction,
    });
};

export const findByContentId = async (
    contentId,
    transaction = null
) => {
    return EventDetail.findOne({
        where: {
            content_id: contentId,
        },
        transaction,
    });
};

export const update = async (
    contentId,
    eventData,
    transaction = null
) => {
    const [updatedRows] =
        await EventDetail.update(
            eventData,
            {
                where: {
                    content_id: contentId,
                },
                transaction,
            }
        );

    if (updatedRows === 0) {
        return null;
    }

    return findByContentId(
        contentId,
        transaction
    );
};

export const remove = async (
    contentId,
    transaction = null
) => {
    return EventDetail.destroy({
        where: {
            content_id: contentId,
        },
        transaction,
    });
};