const { body, validationResult } = require("express-validator");
const queries = require("../db/queries");
const customIsAlpha = require("../utils/customIsAlpha");

const validateUser = [
  body("firstName").custom(customIsAlpha),
  body("lastName").custom(customIsAlpha),
  body("username")
    .isAscii()
    .withMessage("username contains invalid characters"),
];

module.exports.postUser = [
  validateUser,
  async (req, res) => {
    const formDataProps = ["firstName", "lastName", "password"];

    const missing = [];
    for (const prop of formDataProps) {
      if (!Object.keys(req.body).includes(prop)) missing.push(prop);
    }

    if (missing.length) {
      return res
        .status(400)
        .send(`Missing body property/ies: ${missing.join(", ")}`);
    }

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(422).send(
        validationErrors
          .array()
          .map((err) => err.msg)
          .join(", ")
      );
    }

    await queries.createUser({ ...req.body });

    res.status(200).send();
  },
];
