const { Router } = require("express");
const router = Router();
const authController = require("../controllers/authController");

router.post("/register", authController.userPost);

module.exports = router;
