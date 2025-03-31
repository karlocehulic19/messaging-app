const queries = require("../db/queries");
const asyncHandler = require("express-async-handler");
const validateBodyProps = require("../middleware/validateBodyProps");

const constructMessages = async (sender, receiver) => {
  return (await queries.getNewMessages(sender, receiver)).map((msg) => ({
    date: msg.date,
    message: msg.message,
  }));
};

const messagePostBodyProps = ["sender", "receiver", "message"];

module.exports.messagePost = [
  validateBodyProps(messagePostBodyProps),
  asyncHandler(async (req, res) => {
    const userUsername = req.body.sender;
    const messagePartner = req.body.receiver;

    if (userUsername != req.user.username) {
      return res.sendStatus(401);
    }

    await queries.sendMessage(
      req.body.sender,
      req.body.receiver,
      req.body.message
    );

    const messages = await constructMessages(messagePartner, userUsername);
    res.status(200).send(messages);
  }),
];

const messageGetBodyProps = ["sender", "receiver"];

module.exports.messageGet = [
  validateBodyProps(messageGetBodyProps),
  asyncHandler(async (req, res) => {
    const userUsername = req.body.receiver;
    const messagePartner = req.body.sender;
    if (userUsername != req.user.username) {
      return res.sendStatus(401);
    }

    const messages = await constructMessages(messagePartner, userUsername);
    if (!messages.length) {
      return res.sendStatus(204);
    }

    res.send(messages);
  }),
];

const oldMessagesGetBodyProps = ["user", "partner"];

module.exports.oldMessagesGet = [
  validateBodyProps(oldMessagesGetBodyProps),
  async (req, res) => {
    if (req.user.username != req.body.user) return res.sendStatus(401);
    res.send(
      await queries.getOldMessages(
        req.body.user,
        req.body.partner,
        req.query.page
      )
    );
  },
];
