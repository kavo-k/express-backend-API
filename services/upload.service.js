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


module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
};