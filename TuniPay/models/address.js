const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    phoneNo: {
        type: String,
        required: true
    },
  
});

module.exports = mongoose.model('Address', addressSchema);
