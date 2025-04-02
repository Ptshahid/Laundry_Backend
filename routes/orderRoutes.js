const express = require("express");
const authenticate = require("../middleware/authMiddleware"); // Protect routes
const Order = require("../models/Order");

const router = express.Router();

console.log("🔹 orderRoutes.js loaded");

// Place Order
router.post("/place", authenticate, async (req, res) => {
  try {
    const { laundryType, weight, pickupTime } = req.body;

    if (!laundryType || !weight || !pickupTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newOrder = new Order({
      user: req.user.id,
      laundryType,
      weight,
      pickupTime,
    });

    await newOrder.save();
    res.json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get User Notifications
router.get("/notifications", authenticate, async (req, res) => {
    try {
      console.log("🔹 Fetching notifications for user:", req.user.id);
  
      if (!req.user.id) {
        console.log("🔴 User ID is missing");
        return res.status(400).json({ error: "Unauthorized request" });
      }
    const orders = await Order.find({ user: req.user.id }).select("notifications");
    console.log("🔹 Orders Found:", orders.length);

    if (!orders || orders.length === 0) {
      console.log("🔹 No orders found for user");
      return res.status(404).json({ error: "No notifications found" });
    }
      // Collect all notifications from user's orders
      const allNotifications = orders.flatMap((order) => order.notifications || []);
  
      console.log("🔹 Notifications fetched:", allNotifications.length);
  
      res.json(allNotifications);
    } catch (error) {
      console.error("🔴 Error fetching notifications:", error.message);
      res.status(500).json({ error: "Server error", details: error.message });
    }
});

// Get User Orders
router.get("/my-orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get User Orders which order status is pending(for the iot)
router.get("/pending", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id, status:"Pending" }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get User Orders for payment
router.get("/bills", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id, status: "Completed" }).sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No completed orders found." });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// admin delivery boy notification
router.get("/new-orders", authenticate, async (req, res) => {
  try {
      console.log("🔹 Checking for new orders...");

      // Fetch orders placed in the last 10 minutes (adjust as needed)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const newOrders = await Order.find({ createdAt: { $gte: tenMinutesAgo } });

      res.json({ newOrders });
  } catch (error) {
      console.error("🔴 Error fetching new orders:", error.message);
      res.status(500).json({ error: "Server error" });
  }
});

// GET latest placed order
router.get('/latest-order', async (req, res) => {
  try {
    const latestOrder = await Order.findOne().sort({ createdAt: -1 }); // Get the most recent order

    if (!latestOrder) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json(latestOrder);
  } catch (error) {
    console.error("Error fetching latest order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Get a Specific Order by the order placed user(Tracking)
router.get("/:orderId", authenticate, async (req, res) => {
    try {
      const order = await Order.findOne({ _id: req.params.orderId, user: req.user.id });
  
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
