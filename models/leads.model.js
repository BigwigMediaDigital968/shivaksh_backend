const mongoose = require("mongoose");

const leadSchema= new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    purpose:String,
    message:String,
    verified:{type: Boolean, default: false},
    createdAt:{type: Date,default:  Date.now()},
})

module.exports= mongoose.model("Lead",leadSchema);