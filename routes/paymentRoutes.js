const express = require("express");
require("dotenv").config();
const Order = require("../models/Order");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Google Pay Payment Intent
router.post("/create-google-pay-payment", authenticate, async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (!order.totalPrice || order.totalPrice <= 0) {
            return res.status(400).json({ error: "Invalid order total price" });
        }

        // Mock Google Pay payment response
        const paymentSuccess = true; // Simulate a successful payment

        if (paymentSuccess) {
            order.paymentStatus = "Paid";
            await order.save();
            return res.json({ message: "Payment successful!", paymentStatus: "Paid" });
        } else {
            order.paymentStatus = "Failed";
            await order.save();
            return res.status(400).json({ error: "Google Pay payment failed" });
        }
    } catch (error) {
        console.error("Google Pay Error:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// Update Payment Status Route
router.put("/pay/:orderId/update-payment-status", authenticate, async (req, res) => {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!["Paid", "Failed"].includes(paymentStatus)) {
        return res.status(400).json({ error: "Invalid payment status" });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.paymentStatus = paymentStatus;
        await order.save();

        return res.json({ message: `Payment status updated to ${paymentStatus}`, paymentStatus });
    } catch (error) {
        console.error("Error updating payment status:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

module.exports = router;
