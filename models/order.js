const mongoose = require("mongoose");
const users = require("./users");

const orderSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: {
    user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: users},
    name: { type: String, required: true, ref: users },
    email: { type: String, required: true, ref: users },
    address: { type: String, required: true },
    phNumber: { type: String, required: true },
  },
  product: {
    product_id: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
  },
  status: { type: String, required: true },
  quantity: { type: Number, required: true },
  shippingFee: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
