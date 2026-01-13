const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // ✅ Image upload fix

const {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  dashboardStats, // ✅ Make sure this is imported
} = require("../controllers/productController");

// ==========================================
// SPECIFIC ROUTES (MUST BE AT THE TOP)
// ==========================================

// 1. Dashboard Stats (Fix for CastError)
router.get(
  "/dashboard-stats",
  protect,
  authorizeRoles("supplier"),
  dashboardStats
);

// 2. Supplier: Get Own Products
router.get(
  "/my-products",
  protect,
  authorizeRoles("supplier"),
  getMyProducts
);

// 3. Supermarket: Get All Products (Filtered by district)
router.get(
  "/",
  protect,
  authorizeRoles("supermarket"),
  getAllProducts
);

// 4. Supplier: Create Product (Added upload middleware)
router.post(
  "/",
  protect,
  authorizeRoles("supplier"),
  upload.single("image"), // ✅ Fix for "Cannot add item"
  createProduct
);

// ==========================================
// DYNAMIC ROUTES (MUST BE AT THE BOTTOM)
// ==========================================

// 5. Get Product by ID (This catches anything like /:id)
router.get("/:id", protect, getProductById);

// 6. Update Product (Added upload middleware)
router.patch(
  "/:id",
  protect,
  upload.single("image"), // ✅ Fix for image update
  updateProduct
);

// 7. Delete Product
router.delete("/:id", protect, deleteProduct);

module.exports = router;