const { Router } = require("express");
const router = Router();
const authController = require("../controllers/authController");
const CloudinaryImageManager = require("../utils/CloudinaryImageManager");

router.post("/register", authController.userPost(CloudinaryImageManager));
router.post("/login", authController.loginPost);
router.post("/validate", authController.validatePost);

module.exports = router;
