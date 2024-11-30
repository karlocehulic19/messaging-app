const { body, validationResult } = require("express-validator");
const queries = require("../db/queries");
const { customIsAlpha, isGlobalAlpha } = require("../utils/customIsAlpha");
const isContainingCallback = require("../utils/isContainingCallback");
const validator = require("validator");

const validateUser = [
  body("firstName").custom(customIsAlpha("First Name")),
  body("lastName").custom(customIsAlpha("Last Name")),
  body("username")
    .isAscii()
    .withMessage("Username contains invalid characters")
    .custom(async (value) => {
      const user = await queries.readUserByUsername(value);
      if (user) {
        throw new Error("User with that username already exists");
      }
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must contain at least 8 characters")
    .custom(
      isContainingCallback(
        // better than using matchers bcs it includes all uppercase letters (not only from A - Z)
        "uppercase letter",
        validator.isUppercase,
        isGlobalAlpha
      )
    )
    .custom(
      isContainingCallback(
        "lowercase letter",
        validator.isLowercase,
        isGlobalAlpha
      )
    )
    .custom(isContainingCallback("number", validator.isNumeric))
    .matches(/[-!$%@^&*()_+|~=`{}\[\]:";'<>?,.\/]/)
    .withMessage("Password must contain at least one symbol"),
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
      return res
        .status(422)
        .send({ message: validationErrors.array().map((err) => err.msg) });
    }

    await queries.createUser({ ...req.body });

    res.status(200).send();
  },
];
