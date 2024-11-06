const { Product } = require("../../models/product");
const { Category } = require("../../models/category");
const {Review} = require("../../models/reviews");
const media_helper = require("../../helpers/media_helper");
const util = require("util");
const multer = require("multer");
const { default: mongoose } = require("mongoose");

exports.getProductsCount = async (req, res) => {
  try {
    const productsCount = await Product.countDocuments();
    if (!productsCount)
      return res.status(500).json({ message: "Products not found!" });
    return res.status(200).json({ productsCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const uploadImage = util.promisify(
      media_helper.uploadMedia.fields([
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
      ])
    );
    try {
      await uploadImage(req, res);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        type: error.code,
        message: ` ${error.message}{${err.fields}}`,
        storageErrors: error.storageErrors,
      });
    }
    const category = await Category.findById(req.body.category);
    if (!category)
      return res.status(404).json({ message: "Invalid Category." });
    if (category.markedForDeletion) {
      return res.status(404).json({
        message:
          "Category marked for deletion, you cannot add products to this category",
      });
    }
    const image = req.files["image"][0];
    if (!image) return res.status(400).json({ message: "No image uploaded" });
    req.body["image"] = `${req.protocol}://${req.get("host")}/${image.path}`;
    const gallery = req.files["images"][0];
    const imagePaths = [];

    if (gallery) {
      for (const image of gallery) {
        const imagePath = `${req.protocol}://${req.get("host")}/${image.path}`;
        imagePaths.push(imagePath);
      }
    }
    if (imagePaths.length > 0) {
      req.body["images"] = imagePaths;
    }
    const product = await new Product(req.body).save();
    if (!product)
      return res.status(500).json({ message: "Could not create product" });

    return res.status(201).json(product);
  } catch (error) {
    console.error(error);
    if (err instanceof multer.MulterError) {
      return res.status(err.code).json({ message: err.message });
    }
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
exports.getProduct = async (req, res) => {};
exports.editProduct = async (req, res) => {
  try {
    if (
      !mongoose.isValidObjectId(req.params.id) ||
      !(await Product.findById(req.params.id))
    ) {
      return res.status(400).json({ message: "Invalid product " });
    }
    if (req.body.category) {
      const category = await Category.findById(req.body.category);
      if (!category)
        return res.status(404).json({ message: "Invalid Category." });
      if (category.markedForDeletion) {
        return res.status(404).json({
          message:
            "Category marked for deletion, you cannot add products to this category",
        });
      }
    }
    let product = await Product.findById(req.params.id);

    if (req.body.image) {
      const limit = 10 - product.images.length;
      const galleryUploadImage = util.promisify(
        media_helper.uploadMedia.fields([{ name: "images", maxCount: limit }])
      );
      try {
        await galleryUploadImage(req, res);
      } catch (error) {
        console.error(error);
        return res.status(500).json({
          type: error.code,
          message: ` ${error.message}{${err.fields}}`,
          storageErrors: error.storageErrors,
        });
      }
      const imageFiles = req.files["images"];
      const updateGallery = imageFiles && imageFiles.length > 0;
      if (updateGallery) {
        const imagePaths = [];
        for (const image of gallery) {
          const imagePath = `${req.protocol}://${req.get("host")}/${
            image.path
          }`;
          imagePaths.push(imagePath);
        }
        req.body["images"] = [...product.images, ...imagePaths];
      }
      if (req.body.image) {
        const uploadImage = util.promisify(
          media_helper.uploadMedia.fields([{ name: "image", maxCount: 1 }])
        );
        try {
          await uploadImage(req, res);
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            type: error.code,
            message: ` ${error.message}{${err.fields}}`,
            storageErrors: error.storageErrors,
          });
        }
        const image = req.files["image"][0];
        if (!image)
          return res.status(400).json({ message: "No image uploaded" });
        req.body["image"] = `${req.protocol}://${req.get("host")}/${
          image.path
        }`;
        const imagePaths = [];
        for (const image of gallery) {
          const imagePath = `${req.protocol}://${req.get("host")}/${
            image.path
          }`;
          imagePaths.push(imagePath);
        }
      }
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ message: "Could not update product" });
    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    if (err instanceof multer.MulterError) {
      return res.status(err.code).json({ message: err.message });
    }
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};
exports.deleteProductImage = async (req, res) => {
  try {
    const productId = req.params.id;
    const { deletedImageUrls } = req.body;
    if(!mongoose.isValidObjectId(productId) || !Array.isArray(deletedImageUrls)){
      return res.status(400).json({message:"Invalid product"});
    }
    await media_helper.deleteImages(deletedImageUrls);
    const product = await Product.findById(productId);
    if(!product) return res.status(404).json({message:"Product not found"});
    product.images = product.images.filter(
       (image)=> !deletedImageUrls.includes(image)
    );
    await product.save();
    return res.status(204).end();
  } catch (error) {
    console.error(`Error deleting image : ${error.message}`);
    if(error.code === "ENOENT"){
      return res.status(404).json({message:"Image not found"});
  }
  return res.status(500).json({
    message:'Image not found',
  });
}};
exports.deleteProduct = async (req, res) => {
     try {
          const productId = req.params.id;
          if(!mongoose.isValidObjectId(productId)){
            return res.status(404).json({message:"Invalid product"});
          }
          const product = await Product.findById(productId);
          if(!product) return res.status(404).json({message:"Product not found"});
          await media_helper.deleteImages([...product.images,product.image],"ENOENT");

          await Review.deleteMany({_id:{$in:product.reviews}});
          await Product.findByIdAndDelete(productId);
          await product.save();
          return res.status(204).end();
     } catch (error) {
          
     }
};
