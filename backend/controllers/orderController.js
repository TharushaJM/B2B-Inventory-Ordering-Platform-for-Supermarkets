const Order = require("../models/Order");
const Product = require("../models/Product");

// 1. Create Order (Supermarket creates an order)
// 1. Create Order
const createOrder = async (req, res) => {
  try {
    console.log("---- CREATE ORDER REQUEST RECEIVED ----");
    console.log("Data from Frontend:", req.body); // Frontend එකෙන් එන data බලාගන්න
    console.log("Logged User:", req.user); // User authenticate වෙලාද බලන්න

    const { items, totalAmount, supplierId, deliveryAddress, note } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No order items found" });
    }
    if (!supplierId) {
      return res.status(400).json({ message: "Supplier ID is missing" });
    }
    if (!deliveryAddress) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    // Create Order Object
    const order = new Order({
      supermarket: req.user.id, // Auth middleware එකෙන් එන User ID
      supplier: supplierId,
      items: items.map((item) => ({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      deliveryAddress, // Address එක save කරන්න
      note,            // Note එක save කරන්න
      status: "Pending",
      district: req.user.district, // Supermarket එකේ District එක
    });

    const createdOrder = await order.save();
    console.log("✅ Order Created Successfully:", createdOrder._id);
    
    res.status(201).json(createdOrder);

  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error); // Terminal එකේ රතු පාටින් වැරැද්ද පෙන්නයි
    res.status(500).json({ message: "Order creation failed: " + error.message });
  }
};

// 2. Get My Orders (Supermarket views their own orders)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ supermarket: req.user.id })
      .populate("supplier", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Get Supplier Orders (Supplier views orders assigned to them)
const getSupplierOrders = async (req, res) => {
  try {
    const orders = await Order.find({ supplier: req.user.id })
      .populate("supermarket", "name email district") // Populate supermarket details
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get Order By ID (Common for both)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("supermarket", "name email")
      .populate("supplier", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Security check: Only allow the relevant supplier or supermarket to view
    if (
      order.supermarket._id.toString() !== req.user.id &&
      order.supplier._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 5. Update Order Status (Supplier updates status)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only supplier can update status
    if (order.supplier.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// වැදගත්ම කොටස: මේවා හරියට Export කරලා තියෙන්න ඕනේ
module.exports = {
  createOrder,
  getMyOrders,
  getSupplierOrders,
  getOrderById,
  updateOrderStatus,
};