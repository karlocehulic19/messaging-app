const passport = require("passport");
const LocalStrategy = require("passport-local");
const queries = require("../db/queries");
const bcrypt = require("bcrypt");

module.exports.config = () => {
  const verifyUser = async (username, password, done) => {
    try {
      const user = await queries.getUserByUsername(username);

      console.log(user);

      if (!user) {
        return done(null, false, {
          message: "Username or password is incorrect",
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return done(null, false, {
          message: "Username or password is incorrect",
        });
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  };

  passport.use(new LocalStrategy(verifyUser));
};
