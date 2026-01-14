const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const multer = require("multer");
const storage = require("../config/storage"); // Cloudinary storage
