const { v2: cloudinary } = require("cloudinary");

const DEFAULT_SIZE = 200;

cloudinary.config({
  secure: true,
});

class CloudinaryImageManager {
  static async uploadCropped(file, size = DEFAULT_SIZE) {
    try {
      const response = await cloudinary.uploader.upload(file, {
        width: size,
        height: size,
        crop: "fill",
      });

      return response.public_id;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = CloudinaryImageManager;
