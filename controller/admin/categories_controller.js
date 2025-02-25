const { Category } = require("../../models/category");
const media_helper = require("../../helpers/media_helper");
const util = require("util");
exports.addCategory = async (req, res) => {
  try {
    // Promisify the media upload function
    const uploadImage = (req, res) => {
      return new Promise((resolve, reject) => {
        media_helper.uploadMedia.fields([{ name: "image", maxCount: 1 }])(
          req,
          res,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    };

    // Attempt to upload the image
    try {
      await uploadImage(req, res);
    } catch (error) {
      console.error("Image upload error:", error);
      return res.status(500).json({
        type: error.code || "UPLOAD_ERROR",
        message: error.message,
        storageErrors: error.storageErrors || [],
      });
    }

    // Check if the image was uploaded
    const image = req.files && req.files["image"] ? req.files["image"][0] : null;
    if (!image) return res.status(400).json({ message: "No image uploaded" });
    

    // Construct the image URL
    req.body["image"] = `${req.protocol}://${req.get("host")}/${image.path}`;

    // Create and save the category
    const category = new Category(req.body);
    await category.save();

    // Check if the category was successfully created
    if (!category) {
      return res.status(500).json({ message: "Could not create category" });
    }

    // Return the created category
    return res.status(201).json(category);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({
      type: error.name || "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred",
    });
  }
};

exports.editCategory = async (req, res) => {
  try {
    const {name ,icon , color} = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {name,icon,color},
      { new: true }
    );
    if(!category) return res.status(404).json({message:"Category not found!"});
    return res.status(200).json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found!" });
    category.markedForDeletion = true;
    await category.save();
    return res.status(204).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
