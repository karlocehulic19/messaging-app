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
    const pictureResponse = await ImageManager.getProfilePicture(photoPublicId);

    if (!pictureResponse) return res.status(204).send();

    res.type(pictureResponse.mimeType).send(pictureResponse.imageBuffer);
  });

const putUser = (ImageManager) => {
  return asyncHandler(async (req, res) => {
    let newPhotoPublicId;
    if (req.body.newPictureBase64) {
      newPhotoPublicId = await ImageManager.uploadCropped(
        req.body.newPictureBase64
      );
    }
    const originalUser = await queries.getUserByUsername(
      req.body.senderUsername
    );
    const updatedUser = await queries.updateUser(req.body.senderUsername, {
      username: req.body.newUsername,
      email: req.body.newEmail,
      photoPublicId: newPhotoPublicId,
    });
    if (req.body.newPictureBase64) {
      ImageManager.deletePicture(originalUser.photoPublicId);
    }
    return res.send({
      username: req.body.newUsername ? updatedUser.username : undefined,
      email: req.body.newEmail ? updatedUser.email : undefined,
    });
  });
};

module.exports = {
  getUsers,
  getProfilePictureByUsername,
  putUser,
};
