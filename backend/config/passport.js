const passport = require("passport");
const LocalStrategy = require("passport-local");
const queries = require("../db/queries");

const validateUser = new LocalStrategy(async (username, password, done) => {
  try {
    await queries.getUserByUsername(username);
  } catch (error) {
    done(error);
  }
});
