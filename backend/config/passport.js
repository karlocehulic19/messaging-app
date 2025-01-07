const passport = require("passport");
const LocalStrategy = require("passport-local");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const queries = require("../db/queries");
const bcrypt = require("bcrypt");

module.exports.config = () => {
  const verifyUser = async (username, password, done) => {
    try {
      const user = await queries.getUserByUsername(username);

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
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await queries.getUserByUsername(
            jwt_payload.user.username
          );
          done(null, user);
        } catch (error) {
          done(error, false);
        }
      }
    )
  );
};
