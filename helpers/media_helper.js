const multer = require("multer");
const path = require("path");
const { unlink } = require("fs/promises");
const ALLOWED_EXTENSION = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, "public/uploads");
  },
  filename: (_, file, cb) => {
    const filename = file.originalname
      .replace(" ", "-")
      .replace(".png", "")
      .replace(".jpg", "")
      .replace(".jpeg", "");
    const extension = ALLOWED_EXTENSION[file.mimetype];
    cb(null, `${filename}-${Date.now()}.${extension}`);
  },
});

exports.uploadMedia = multer({
  storage: storage,
  //5mb
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_, file, cb) => {
    const isValid = ALLOWED_EXTENSION[file.mimetype];

    let uploadError = new Error(
      "Invalid image type\n ${file.mimetype} is not allowed"
    );
    if (!isValid) return cb(uploadError);
    return cb(null, true);
  },
});

exports.deleteImages = async (imagesUrls, continueOneErrorName) => {
  await Promise.all(
    imagesUrls.map(async (imageUrl) => {
      const imagePath = path.resolve(
        __dirname,
        "..",
        "public",
        "uploads",
        path.basename(imageUrl)
      );
      try{
        await unlink(imagePath);
      }catch(error){
        console.log(error);
        if(error.code === continueOneErrorName){
          console.error(`Continuing with the next image : ${error.message}`); 
        }else{
          console.error(`Error deleting image : ${error.message}`);
          throw error;
        }
      }
    })
  );
};
