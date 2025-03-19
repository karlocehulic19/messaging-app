const queries = require("../db/queries");
const asyncHandler = require("express-async-handler");
const validateBodyProps = require("../middleware/validateBodyProps");

const messagePostBodyProps = ["sender", "receiver", "message"];

module.exports.messagePost = [
  validateBodyProps(messagePostBodyProps),
  asyncHandler(async (req, res) => {
    if (req.body.sender != req.user.username) {
      return res.sendStatus(401);
    }

    await queries.sendMessage(
      req.body.sender,
      req.body.receiver,
      req.body.message
    );
    res.send(200);
  }),
];

module.exports.messageGet = asyncHandler(async (req, res) => {
  const searchUser = req.query.user;
  if (searchUser != req.user.username) {
    return res.sendStatus(401);
  }

  const messages = (await queries.getNewMessages(searchUser)).map((msg) => ({
    date: msg.date,
    message: msg.message,
  }));

  if (!messages.length) {
    return res.sendStatus(204);
  }

  res.send(messages);
});
