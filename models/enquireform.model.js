const mongoose = require("mongoose");
const enquireFormSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        default: "",
    },
});

module.exports = mongoose.model("EnquireForm", enquireFormSchema);    