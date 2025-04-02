const express = require("express");
const authenticate = require("../middleware/authMiddleware"); // Protect routes
const Order = require("../models/Order");
const { authRole } = require("../middleware/authMiddleware");

const router = express.Router();


// View Orders (Status = Pending)
router.get("/pending", authenticate, authRole("delivery_boy"), async (req, res) => {
    try {
        const orders = await Order.find({status: "Pending"}).populate("user", "name email address phoneNumber");

        if (!orders.length) {
            return res.status(404).json({ message: "No pending or picked up orders found" });
        }

        res.json(orders);
    } catch (error) {
        console.error("🔴 Error fetching pending or picked up orders:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

// View Orders (Status Picked Up )
router.get("/picked", authenticate, authRole("delivery_boy"), async (req, res) => {
    try {
        // console.log("🔹 Fetching assigned orders for delivery boy:", req.user.id);

        const orders = await Order.find({status: "Picked up"}).populate("user", "name email address phoneNumber");

        if (!orders.length) {
            return res.status(404).json({ message: "No pending or picked up orders found" });
        }

        res.json(orders);
    } catch (error) {
        console.error("🔴 Error fetching pending or picked up orders:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

// View Orders (Status = Pending and Picked Up )
router.get("/view-orders", authenticate, authRole("delivery_boy"), async (req, res) => {
    try {
        // console.log("🔹 Fetching assigned orders for delivery boy:", req.user.id);

        const orders = await Order.find({status: { $in: ["Pending", "Picked up"] }});

        if (!orders.length) {
            return res.status(404).json({ message: "No pending or picked up orders found" });
        }

        res.json(orders);
    } catch (error) {
        console.error("🔴 Error fetching pending or picked up orders:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

//notifivcation
router.get('/new-item',authenticate,authRole("delivery_boy"), async (req, res) => {
    try {
      const newOrders = await Order.find({ status: 'Pending' }).sort({ createdAt: -1 });
      res.json({ orders: newOrders });
    } catch (error) {
      res.status(500).json({ message: "Error fetching new orders." });
    }
  });

// View Orders (Status = Pending)
router.get("/view-pending-orders", authenticate, authRole("delivery_boy"), async (req, res) => {
    try {
        const orders = await Order.find({ status: "Pending" });

        if (!orders.length) {
            return res.status(404).json({ message: "No pending or picked up orders found" });
        }

        res.json(orders);
    } catch (error) {
        console.error("🔴 Error fetching pending or picked up orders:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

// View Orders (Status Picked Up )
router.get("/view-picked-orders", authenticate, authRole("delivery_boy"), async (req, res) => {
    try {
        // console.log("🔹 Fetching assigned orders for delivery boy:", req.user.id);

        const orders = await Order.find({status: "Pending"});

        if (!orders.length) {
            return res.status(404).json({ message: "No pending or picked up orders found" });
        }

        res.json(orders);
    } catch (error) {
        console.error("🔴 Error fetching pending or picked up orders:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

// Update Status of order 
router.put("/:orderId/status", authenticate, authRole("delivery_boy"), async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Picked up", "Delivered"];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status update" });
        }

        const order = await Order.findOne({ _id: req.params.orderId,});

        if (!order) {
            return res.status(404).json({ error: "Order not found or not assigned to you" });
        }

        order.status = status;
        order.notifications.push({ message: `Order status updated to: ${status}` });

        await order.save();
        res.json({ message: "Order status updated successfully", order });
    } catch (error) {
        console.error("🔴 Error updating order status:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
