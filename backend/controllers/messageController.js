const queries = require("../db/queries");
const asyncHandler = require("express-async-handler");

module.exports.messagePost = asyncHandler(async (req, res) => {
  await queries.sendMessage(
    req.body.sender,
    req.body.receiver,
    req.body.message
  );
  res.send(200);
});

module.exports.messageGet = asyncHandler(async (req, res) => {
  const messages = (await queries.getNewMessages(req.query.user)).map(
    (msg) => ({ date: msg.date, message: msg.message })
  );

  res.send(messages);
});
