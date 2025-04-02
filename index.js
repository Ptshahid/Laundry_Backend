const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const deliveryRoutes = require("./routes/deliveryRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();


// Log every incoming request
app.use((req, res, next) => {
  console.log(`🔹 [${req.method}] ${req.url}`);
  next();
});



// Middleware
app.use(express.json());
app.use(cors());


// app.use("/api/laundry", laundryRoutes);
// API Routes
app.use("/api/auth", authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery",deliveryRoutes);
app.use("/api/pay",paymentRoutes);






// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.log(err));

// Start Server
const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

