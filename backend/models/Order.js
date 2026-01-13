const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    supermarket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // හෝ "Supermarket" (ඔයාගේ user model නම අනුව)
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // හෝ "Supplier"
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      type: String,
      required: true, // Frontend එකෙන් මේක එවන නිසා මේක required කළා
    },
    note: {
      type: String, // Optional
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Shipped", "Delivered", "Rejected", "Cancelled"],
      default: "Pending",
    },
    district: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);