const express = require("express");
const User = require("../models/User");
const authenticate = require('../middleware/authMiddleware');
const { authRole } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/authMiddleware");
const Order = require("../models/Order");


const router = express.Router();

console.log("🔹 adminRoutes.js loaded");

// View All Users
router.get("/users", authenticate, authRole("admin"), async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password"); // Exclude password
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
// View All Delivery Boys
router.get("/delivery_boy", authenticate, authRole("admin"), async (req, res) => {
    try {
        const users = await User.find({ role: "delivery_boy" }).select("-password"); // Exclude password
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});


// Edit User Details
router.put("/users/:userId", authenticate, authRole("admin"), async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.userId,
            { name, email, role },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

//  Get all orders (Admin Only)
router.get("/orders", authenticate, isAdmin, async (req, res) => {
    try {
      console.log("🔹 Admin fetching all orders");
      const orders = await Order.find().populate("user", "name email address phoneNumber");
      res.json(orders);
    } catch (error) {
      console.error("🔴 Error fetching orders:", error.message);
      res.status(500).json({ error: "Server error" });
    }
});




// Get Order Analytics
router.get("/dashboard/orders", authenticate, isAdmin, async (req, res) => {
    try {
      console.log("🔹 Fetching order analytics");
  
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: "Pending" });
      const pickedupOrders = await Order.countDocuments({ status: "Picked up" });
      const deliveredOrders = await Order.countDocuments({ status: "Delivered" });
      const processingOrders = await Order.countDocuments({ status: "Processing" });
      const completedOrders = await Order.countDocuments({ status: "Completed" });
  
      res.json({
        totalOrders,
        pendingOrders,
        pickedupOrders,
        deliveredOrders,
        processingOrders,
        completedOrders,
      });
    } catch (error) {
      console.error("🔴 Error fetching order analytics:", error.message);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  //  Get Revenue Tracking
router.get("/dashboard/revenue", authenticate, isAdmin, async (req, res) => {
    try {
        console.log("🔹 Fetching revenue data");

        // Get completed orders
        const completedOrders = await Order.find({ status: "Completed" });

        // Sum up revenue from totalPrice field
        const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        res.json({ totalRevenue });
    } catch (error) {
        console.error("🔴 Error fetching revenue:", error.message);
        res.status(500).json({ error: "Server error" });
    }
});

//notifivcation
router.get('/new-item',authenticate,isAdmin, async (req, res) => {
    try {
      const newOrders = await Order.find({ status: 'Pending' }).sort({ createdAt: -1 });
      res.json({ orders: newOrders });
    } catch (error) {
      res.status(500).json({ message: "Error fetching new orders." });
    }
  });

// Get a Specific User (delivery boy or user) by User ID (Admin Access)
router.get("/role/:userId", authenticate, isAdmin, async (req, res) => {
    try {
        
        const user = await User.findOne({ _id: req.params.userId,});
  
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
  
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
  });

// Delete User
router.delete("/users/:userId", authenticate, authRole("admin"), async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Delete Delivery boy
router.delete("/delivery_boy/:userId", authenticate, authRole("admin"), async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.userId);
        if (!deletedUser) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// Update Order Status (Admin Only)
router.put("/orders/:orderId/status", authenticate, isAdmin, async (req, res) => {
    try {
      const { status } = req.body;
  
      // Check if status is valid
      const validStatuses = ["Pending", "Processing", "Picked up", "Delivered", "Completed"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
      }
  
      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      order.status = status;
      order.notifications.push({ message: `Your order status changed to: ${status}` });

      // I-f completing the order, calculate total price
        if (status === "Completed") {
            const pricePerKg = 10; //  Set price per kg (change this as needed)
            order.totalPrice = order.weight * pricePerKg;
            // console.log(`Total price is : ${order.totalPrice}`);
        }
  
      await order.save();
      console.log(`✅ Order ${order._id} status updated to ${status}`);
  
      res.json({ message: "Order status updated", order });
    } catch (error) {
      console.error("🔴 Error updating order status:", error.message);
      res.status(500).json({ error: "Server error" });
    }
});

// Get a Specific Order by Order ID (Admin Access)
router.get("/admin/:orderId", authenticate, isAdmin, async (req, res) => {
  try {
      // const order = await Order.findById(req.params.orderId);
      const order = await Order.findOne({ _id: req.params.orderId,});

      if (!order) {
          return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
  } catch (error) {
      res.status(500).json({ error: "Server error" });
  }
});


 

  

module.exports = router;
