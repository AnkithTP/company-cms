import * as mediaService from "./media.service.js";

export const uploadMedia = async (req, res, next) => {
    try {
        const altText = req.body.alt_text || null;

        const media = await mediaService.uploadMedia(
            req.file,
            req.user.id,
            altText
        );

        res.status(201).json({
            success: true,
            message: "Media uploaded successfully",
            data: media,
        });
    } catch (error) {
        next(error);
    }
};

export const getAllMedia = async (req, res, next) => {
    try {
        const media = await mediaService.getAllMedia();

        res.status(200).json({
            success: true,
            data: media,
        });
    } catch (error) {
        next(error);
    }
};

export const getMediaById = async (req, res, next) => {
    try {
        const media = await mediaService.getMediaById(
            req.params.id
        );

        res.status(200).json({
            success: true,
            data: media,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteMedia = async (req, res, next) => {
    try {
        await mediaService.deleteMedia(req.params.id);

        res.status(200).json({
            success: true,
            message: "Media deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};