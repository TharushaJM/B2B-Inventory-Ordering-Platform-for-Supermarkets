const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getSupplierOrders,
  getOrderById,
  updateOrderStatus,
  // createOrder, // (optional - friend side)
} = require("../controllers/orderController");

//  Supplier: list own incoming orders
router.get(
  "/supplier",
  protect,
  authorizeRoles("supplier"),
  getSupplierOrders
);

//  Supplier/Admin: view order details
router.get("/:id", protect, getOrderById);

//  Supplier: update order status
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("supplier"),
  updateOrderStatus
);




module.exports = router;
