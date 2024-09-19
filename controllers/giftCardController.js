const Gift_Card = require("../models/giftCard");
const asyncHandler = require("express-async-handler");

const createCardOrder = asyncHandler(async (req, res) => {
  try {
    const { admin_id, user, giftCard, balance, paymentMethod } = req.body;

    const gift_Card = new Gift_Card({
      admin_id,
      user,
      giftCard,
      balance,
      paymentMethod,
    });

    const savedCard = await gift_Card.save();
    res.json(savedCard);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const allCardHolders = asyncHandler(async (req, res) => {
  try {
    const gift_Card = await Gift_Card.find();
    res.json(gift_Card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const cardUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(userId);
    const gift_Card = await Gift_Card.findOne({ "user.user_id": userId });
    res.json(gift_Card);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = {
  createCardOrder,
  allCardHolders,
  cardUser,
};
