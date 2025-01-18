const { body, validationResult } = require("express-validator");
const queries = require("../db/queries");
const { customIsAlpha, hasGlobalAlpha } = require("fix-esm").require(
  "../../common/utils/customIsAlpha"
);
const isContainingCallback = require("../utils/isContainingCallback");
const validator = require("validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const validateUser = [
  body("firstName").custom(customIsAlpha("First Name")),
  body("lastName").custom(customIsAlpha("Last Name")),
  body("username")
    .isAscii()
    .withMessage("Username contains invalid characters")
    .custom(async (value) => {
      const user = await queries.getUserByUsername(value);
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
        hasGlobalAlpha
      )
    )
    .custom(
      isContainingCallback(
        "lowercase letter",
        validator.isLowercase,
        hasGlobalAlpha
      )
    )
    .custom(isContainingCallback("number", validator.isNumeric))
    // eslint-disable-next-line no-useless-escape
    .matches(/[-!$%@^&*()_+|~=`{}\[\]:";'<>?,.\/]/)
    .withMessage("Password must contain at least one symbol"),
  body("email")
    .isEmail()
    .withMessage("Email must be have form username@example.com")
    .custom(async (email) => {
      if (await queries.getUserByEmail(email)) {
        throw new Error("User with that email already exists");
      }

      return true;
    }),
];

module.exports.userPost = (ImageManager) => {
  return [
    validateUser,
    async (req, res) => {
      const formDataProps = [
        "username",
        "firstName",
        "lastName",
        "password",
        "email",
      ];

      const missing = [];
      const surplus = [];

      for (const prop of formDataProps) {
        if (!Object.keys(req.body).includes(prop)) missing.push(prop);
      }

      if (missing.length) {
        return res
          .status(400)
          .send({ error: `Missing body property/ies: ${missing.join(", ")}` });
      }

      for (const bProp of Object.keys(req.body)) {
        if (![...formDataProps, "pictureBase64"].includes(bProp))
          surplus.push(bProp);
      }

      if (surplus.length) {
        return res.status(400).send({
          error: `Request sent invalid properties: ${surplus.join(", ")}`,
        });
      }

      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res
          .status(422)
          .send({ message: validationErrors.array().map((err) => err.msg) });
      }

      const userData = { ...req.body };
      delete userData.pictureBase64;
      userData.password = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync()
      );

      const photoPublicId = req.body.pictureBase64
        ? await ImageManager.uploadCropped(req.body.pictureBase64)
        : null;

      if (photoPublicId) {
        userData.photoPublicId = photoPublicId;
      }

      await queries.createUser(userData);

      res.status(200).send();
    },
  ];
};

module.exports.loginPost = [
  (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        next(err);
      }
      if (!user) {
        return res.status(401).send({ messages: [info.message] });
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    res.status(200).send({
      token: jwt.sign({ user: req.user }, process.env.JWT_SECRET),
      user: req.user,
    });
  },
];

module.exports.validatePost = [
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send({ user: req.user });
  },
];
