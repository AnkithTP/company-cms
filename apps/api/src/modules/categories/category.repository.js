import { Category, Content } from "../../database/models.js";

const create = async (categoryData) => {
    return await Category.create(categoryData);
};

const findAll = async () => {
    return await Category.findAll({
        include: [
            {
                model: Category,
                as: "parent",
                attributes: ["id", "name", "slug"],
            },
            {
                model: Content,
                as: "contents",
                attributes: ["id"],
                through: { attributes: [] },
            },
        ],
        order: [["name", "ASC"]],
    });
};

const findById = async (id) => {
    return await Category.findByPk(id, {
        include: [
            {
                model: Category,
                as: "parent",
                attributes: ["id", "name", "slug"],
            },
            {
                model: Category,
                as: "children",
                attributes: ["id", "name", "slug"],
            },
            {
                model: Content,
                as: "contents",
                attributes: ["id", "title"],
                through: { attributes: [] },
            },
        ],
    });
};

const findBySlug = async (slug) => {
    return await Category.findOne({
        where: { slug },
    });
};

const update = async (id, categoryData) => {
    const [updatedRows] = await Category.update(
        categoryData,
        {
            where: { id },
        }
    );

    if (updatedRows === 0) {
        return null;
    }

    return await Category.findByPk(id);
};

const remove = async (id) => {
    return await Category.destroy({
        where: { id },
    });
};

export {
    create,
    findAll,
    findById,
    findBySlug,
    update,
    remove,
};