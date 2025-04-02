const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  laundryType: { type: String, required: true },
  weight: { type: Number, required: true },
  pickupTime: { type: String, required: true },
  status: { type: String, enum: [ "Pending", "Picked up", "Delivered", "Processing", "Completed"], default: "Pending" },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  totalPrice: { type: Number, default: 0 }, 
  notifications: [
    {
      message: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", OrderSchema);
