const { Router } = require("express");
const router = new Router();
const messageController = require("../controllers/messageController");

router.post("/", messageController.messagePost);
router.get("/", messageController.messageGet);

module.exports = router;
