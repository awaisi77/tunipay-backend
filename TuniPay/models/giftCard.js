const mongoose = require("mongoose");
const users = require("./users");

const giftCardSchema = new mongoose.Schema({
  admin_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: {
    user_id: {type: mongoose.Schema.Types.ObjectId, required: true, ref: users},
    name: { type: String, required: true, ref: users },
    email: { type: String, required: true, ref: users },
    address: { type: String, required: true },
    phNumber: { type: String, required: true },
  },
  giftCard: { type: String, required: true },
  balance: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Gift_Card = mongoose.model("Gift_Card", giftCardSchema);

module.exports = Gift_Card;
