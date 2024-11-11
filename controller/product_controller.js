const { product, Product } = require("../models/product");

exports.getProducts = async (req, res) => {
  try {
    let products;
    const page = req.body.page || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    if (req.body.criteria) {
      let query = {};
      if (req.body.category) {
        query["category"] = req.body.category;
      }
      switch (req.body.criteria) {
        case "newArrivals":
          const twoWeeksAgo = new Date();
          twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
          query["dateAdded"] = { $gte: twoWeeksAgo };
          break;
        case "popular":
          query["ratings"] = { $gte: 4.5 };
          break;
        default:
          break;
      }
      product = await Product.find(query)
        .select("-reviews -images -sizes")
        .skip(skip)
        .limit(pageSize);
    }else if(req.body.category){
      products = await Product.find({category: req.body.category})
      .select("-reviews -images -sizes").skip(skip).limit(pageSize);
    }else{
      products = await Product.find()
      .select("-reviews -images -sizes").skip(skip).limit(pageSize);
    }
    if(!products) return res.status(404).json({message:"Products not found"});
    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.searchProduct = async (req, res) => {};

exports.getProductById = async (req, res) => {};
