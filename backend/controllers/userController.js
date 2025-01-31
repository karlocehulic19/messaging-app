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
  }));

  return res.send(usersProfiles);
});

const getProfilePictureByUsername = (ImageManager) =>
  asyncHandler(async (req, res) => {
    const user = await queries.getUserByUsername(req.params.username);
    if (!user) {
      return res
        .status(404)
        .send({ error: "Searched username doesn't exist in the database" });
    }
    const photoPublicId = user.photoPublicId;
    if (!photoPublicId) return res.status(204).send();
    const [imageBuffer, mimeType] = await ImageManager.getProfilePicture(
      photoPublicId
    );

    res.type(mimeType).send(imageBuffer);
  });
module.exports = {
  getUsers,
  getProfilePictureByUsername,
};
