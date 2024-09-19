const asyncHandler = require("express-async-handler");
const Order = require("../models/order");

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { admin_id, user, product, status, quantity, shippingFee } = req.body;

    const totalPrice = product.price * quantity;
    const totalCost = totalPrice + shippingFee;

    const order = new Order({
      admin_id,
      user,
      product,
      status,
      quantity,
      shippingFee,
      totalCost,
    });

    const savedOrder = await order.save();
    res.json(savedOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const allOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const updateStatus = asyncHandler(async (req,res)=>{
    try {
        const orderId = req.params._orderId;
        const { status } = req.body;
    
        if (!status) {
          return res.status(400).json({ message: "Status is required" });
        }
    
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    
        if (!updatedOrder) {
          return res.status(404).json({ message: "Order not found" });
        }
    
        res.json(updatedOrder);
      } catch (err) {
        res.status(400).json({ message: err.message });
      }
})

module.exports = {
  createOrder,
  allOrders,
  updateStatus,
};
