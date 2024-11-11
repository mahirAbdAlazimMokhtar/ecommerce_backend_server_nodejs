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
    } else if (req.body.category) {
      products = await Product.find({ category: req.body.category })
        .select("-reviews -images -sizes")
        .skip(skip)
        .limit(pageSize);
    } else {
      products = await Product.find()
        .select("-reviews -images -sizes")
        .skip(skip)
        .limit(pageSize);
    }
    if (!products)
      return res.status(404).json({ message: "Products not found" });
    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.searchProduct = async (req, res) => {
  try {
    const searchTerm = req.body.q;
    const page = req.body.page || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;
    /*
     * Search for products based on the search term
     const simpleTextSearch = name: { $regex: searchTerm, $options: "i" };
     const indexedTextSearch =  $text: { 
     $search: searchTerm,
      $caseSensitive: false ,
       $language: "en" } ;
     */

    let query = {};
    if (req.query.category) {
      query = { category: req.body.category };
      if (req.query.genderAgeCategory) {
        query["genderAgeCategory"] = req.body.genderAgeCategory.toLowerCase();
      }
    } else if (req.query.genderAgeCategory) {
      query = { genderAgeCategory: req.body.genderAgeCategory.toLowerCase() };
    }
    
    if (searchTerm) {
      query = {
        ...query,
        $text: {
          $search: searchTerm,
          $caseSensitive: false,
          $language: "english",
        },
      };
    }
    const searchResults = await Product.find({
      query,
    })
      .skip(skip)
      .limit(pageSize);
      return res.json(searchResults);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      type: error.name,
      message: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
     try {
          const product = await Product.findById(req.params.id).select(
               '-reviews'
          );
          if(!product) return res.status(404).json({message:"Product not found"});
          return res.status(200).json({product});
     } catch (error) {
          console.error(error);
          return res.status(500).json({
               type: error.name,
               message: error.message,
          });
     }
};
