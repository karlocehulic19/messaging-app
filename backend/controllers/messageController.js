const queries = require("../db/queries");
const asyncHandler = require("express-async-handler");
const validateBodyProps = require("../middleware/validateBodyProps");
const { MESSAGES_TIMESTAMP_THRESHOLD_SECONDS } = require("../utils/constants");
const validateQueryParams = require("../middleware/validateQueryParams");

const constructMessages = async (sender, receiver) => {
  return (await queries.getNewMessages(sender, receiver)).map((msg) => ({
    date: msg.date,
    message: msg.message,
  }));
};

const constructOldMessages = async (sender, receiver, position = undefined) => {
  return (await queries.getOldMessages(sender, receiver, position)).map(
    (msg) => ({
      date: msg.date,
      message: msg.message,
      sender: msg.sender,
      receiver: msg.receiver,
    })
  );
};

const messagePostBodyProps = [
  "sender",
  "receiver",
  "message",
  "clientTimestamp",
];

module.exports.messagePost = [
  validateBodyProps(messagePostBodyProps),
  asyncHandler(async (req, res) => {
    if (
      new Date() - new Date(req.body.clientTimestamp) >
      1000 * MESSAGES_TIMESTAMP_THRESHOLD_SECONDS
    ) {
      return res.status(400).send({
        error: "Client timestamp delay is too big",
      });
    }
    const userUsername = req.body.sender;
    const messagePartner = req.body.receiver;

    if (userUsername != req.user.username) {
      return res.sendStatus(401);
    }

    await queries.sendMessage(
      req.body.sender,
      req.body.receiver,
      req.body.message,
      new Date(req.body.clientTimestamp)
    );

    const messages = await constructMessages(messagePartner, userUsername);
    res.status(200).send(messages);
  }),
];

const messageGetQueryParams = ["sender", "receiver"];

module.exports.messageGet = [
  validateQueryParams(messageGetQueryParams),
  asyncHandler(async (req, res) => {
    const userUsername = req.query.receiver;
    const messagePartner = req.query.sender;
    if (!messagePartner || !userUsername) {
      return res.status(400).send({
        error: `Missing query parameters: ${!messagePartner ? "sender" : ""}${
          !messagePartner && !userUsername ? ", " : ""
        }${!userUsername ? "receiver" : ""}`,
      });
    }

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

const oldMessagesGetQueryParams = ["user", "partner"];

module.exports.oldMessagesGet = [
  validateQueryParams(oldMessagesGetQueryParams),
  asyncHandler(async (req, res) => {
    if (req.query.user != req.user.username) {
      return res.send(401);
    }

    if ("pos" in req.query && (req.query.pos === "" || isNaN(req.query.pos))) {
      return res.status(400).send({
        error: "Page query must be either not present or a number",
      });
    }

    return res.send(
      await constructOldMessages(
        req.query.user,
        req.query.partner,
        req.query.pos ? +req.query.pos : undefined
      )
    );
  }),
];
