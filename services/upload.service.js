const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(buffer);
    });


const deleteFromCloudinary = (publicId) => {
    return cloudinary.uploader.destroy(publicId);
}

const getOptimizedImageUrl = (imagePublicId) => {
    if (!imagePublicId) return null;
    return cloudinary.url(imagePublicId, {
        transformation: [
            { quality: "auto", fetch_format: "auto" },
            { width: 1200, height: 1200, crop: "fill", gravity: "auto" },
        ],
    });
}


module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    getOptimizedImageUrl,
};