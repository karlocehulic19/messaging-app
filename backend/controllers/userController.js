const queries = require("../db/queries");
const asyncHandler = require("express-async-handler");

const getUsers = asyncHandler(async (req, res) => {
  if (!req.query.s)
    return res
      .status(400)
      .send({ error: "At least s query is needed to send users get request." });
  const usernameSearch = req.query.s;
  const users = await queries.getUsersByUsername(usernameSearch);

  const usersProfiles = users.map((user) => ({
    username: user.username,
    profileUrl: user.photoPublicId
      ? `/profiles/photos/${user.photoPublicId}`
      : null,
  }));

  return res.send(usersProfiles);
});

module.exports = {
  getUsers,
};
