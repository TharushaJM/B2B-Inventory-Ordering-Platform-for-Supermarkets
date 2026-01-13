const Product = require("../models/Product");
const User = require("../models/User"); // මෙතන ඔයාගේ User model එකේ නම දාන්න (User හෝ Supplier)

// 1. CREATE PRODUCT
const createProduct = async (req, res, next) => {
  try {
    // Multer puts form fields in req.body
    const { name, description, price, category, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price required" });
    }

    // 1. Log වී සිටින User (Supplier) ගේ විස්තර Database එකෙන් ගන්නවා
    // req.user.id එක Auth middleware එකෙන් ලැබෙනවා
    const supplierDetails = await User.findById(req.user.id);

    if (!supplierDetails) {
      return res.status(404).json({ message: "Supplier details not found" });
    }

    // 2. Product එක හදනවා Supplier ගේ District එකත් එක්ක
    const product = new Product({
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock || 0),
      supplier: req.user.id,
      district: supplierDetails.district, // <--- මෙන්න මෙතනින් තමයි Auto District එක වැටෙන්නේ
    });

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// 2. SUPPLIER: Get My Products
const getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      supplier: req.user.id,
    }).sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// 3. SUPERMARKET: Get All Products
const getAllProducts = async (req, res, next) => {
  try {
    // Supermarket එකේ district එකට අදාල products විතරක් පෙන්වන්න
    // (මේ සඳහා AuthMiddleware එකෙන් req.user.district එක හරියට එන්න ඕනේ, 
    // නැත්නම් මෙතනත් User.findById දාලා district එක ගන්න වෙනවා)
    const q = {
      isActive: true,
      district: req.user.district, 
    };

    if (req.query.category) q.category = req.query.category;

    const products = await Product.find(q)
      .populate("supplier", "name email district")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// 4. GET PRODUCT BY ID
const getProductById = async (req, res, next) => {
  try {
    // Check if ID is valid MongoDB ID before querying
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(404).json({ message: "Product not found (Invalid ID)" });
    }

    const product = await Product.findById(req.params.id).populate(
      "supplier",
      "name email district"
    );

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Supermarket එකක් බලනවා නම්, ඒ district එකේ බඩු විතරක් පෙන්වන්න logic එක
    if (
      req.user.role === "supermarket" &&
      product.district !== req.user.district
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// 5. UPDATE PRODUCT
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.supplier.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { name, description, price, category, stock, isActive } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (category) product.category = category;
    if (stock) product.stock = Number(stock);
    if (isActive !== undefined) product.isActive = isActive;

    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// 6. DELETE PRODUCT
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.supplier.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
  } catch (err) {
    next(err);
  }
};

// 7. DASHBOARD STATS
const dashboardStats = async (req, res, next) => {
  try {
    const supplierId = req.user.id;

    const totalProducts = await Product.countDocuments({ supplier: supplierId });
    
    const activeProducts = await Product.countDocuments({
      supplier: supplierId,
      isActive: true,
    });

    const lowStock = await Product.countDocuments({
      supplier: supplierId,
      stock: { $lte: 10 },
    });

    res.json({ totalProducts, activeProducts, lowStock });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  dashboardStats,
};