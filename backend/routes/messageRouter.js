const { Router } = require("express");
const router = new Router();
const messageController = require("../controllers/messageController");
const passport = require("passport");

router.use(passport.authenticate("jwt", { session: false }));
router.post("/", messageController.messagePost);
router.get("/", messageController.messageGet);

module.exports = router;
