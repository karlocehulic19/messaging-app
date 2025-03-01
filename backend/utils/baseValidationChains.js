const { body } = require("express-validator");
const queries = require("../db/queries");

module.exports.getBaseEmailVC = (field = "email") => {
  return body(field)
    .isEmail()
    .withMessage("Email must have format username@example.com")
    .custom(async (email) => {
      if (await queries.getUserByEmail(email)) {
        throw new Error("User with that email already exists");
      }

      return true;
    });
};

module.exports.getBaseUsernameVC = (field = "username") => {
  return body(field)
    .isAscii()
    .withMessage("Username contains invalid characters")
    .custom(async (value) => {
      const user = await queries.getUserByUsername(value);
      if (user) {
        throw new Error("User with that username already exists");
      }
    });
};
