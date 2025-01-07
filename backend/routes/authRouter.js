const { Router } = require("express");
const router = Router();
const authController = require("../controllers/authController");

router.post("/register", authController.userPost);
router.post("/login", authController.loginPost);
router.post("/validate", authController.validatePost);

module.exports = router;
