const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' }, // Default role is "user"
  address: { type: String, required: true }, // Address field
  fcmToken: { type: String, default: "" },  // Store FCM Token
  phoneNumber: { type: String, required: true, unique: true }, // Phone number field
});

module.exports = mongoose.model('User', UserSchema);
