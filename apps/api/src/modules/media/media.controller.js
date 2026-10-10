import * as mediaService from "./media.service.js";
import * as stockMediaService from "./stock-media.service.js";

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

export const searchStockPhotos = async (req, res, next) => {
    try {
        const query = req.query.query || req.query.q || "business";
        const page = parseInt(req.query.page || "1", 10);
        const perPage = parseInt(req.query.per_page || "18", 10);

        const data = await stockMediaService.searchStockPhotos(query, page, perPage);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const importStockPhoto = async (req, res, next) => {
    try {
        const { photoUrl, downloadLocation, title, photographer, photographerUrl } = req.body;

        const media = await stockMediaService.importStockPhoto(
            { photoUrl, downloadLocation, title, photographer, photographerUrl },
            req.user.id
        );

        res.status(201).json({
            success: true,
            message: "Stock photo imported and stored in CMS library successfully",
            data: media,
        });
    } catch (error) {
        next(error);
    }
};