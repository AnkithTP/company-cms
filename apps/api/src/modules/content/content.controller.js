import * as contentService from "./content.service.js";

const createContent = async (req, res, next) => {
    try {
        const content = await contentService.createContent(
            req.body,
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Content created successfully",
            data: content,
        });
    } catch (error) {
        next(error);
    }
};

const getAllContents = async (req, res, next) => {
    try {
        const contents = await contentService.getAllContents();

        res.status(200).json({
            success: true,
            data: contents,
        });
    } catch (error) {
        next(error);
    }
};

const getContentById = async (req, res, next) => {
    try {
        const content = await contentService.getContentById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data: content,
        });
    } catch (error) {
        next(error);
    }
};

const updateContent = async (req, res, next) => {
    try {
        const content = await contentService.updateContent(
            req.params.id,
            req.body,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: "Content updated successfully",
            data: content,
        });
    } catch (error) {
        next(error);
    }
};

const saveEditorContent = async (req, res, next) => {
    try {
        const result =
            await contentService.saveEditorContent(
                req.params.id,
                req.body,
                req.user.id
            );

        res.status(200).json({
            success: true,
            message: "Content saved successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};


export const getContents = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await contentService.getContents(
                req.query
            );

        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
};



export {
    createContent,
    getAllContents,
    getContentById,
    updateContent,
    saveEditorContent
};

