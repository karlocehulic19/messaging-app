const passport = require("passport");
const queries = require("../db/queries");
const asyncHandler = require("express-async-handler");
const { validationResult } = require("express-validator");
const {
  getBaseEmailVC,
  getBaseUsernameVC,
} = require("../utils/baseValidationChains");

const getUsers = asyncHandler(async (req, res) => {
  if (req.query.exists)
    return res.sendStatus(
      (await queries.getUserByUsername(req.query.exists)) ? 200 : 404
    );
  if (!req.query.s)
    return res
      .status(400)
      .send({
        error:
          "At least s or exists query is needed to send users get request.",
      });
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
  return [
    passport.authenticate("jwt", { session: false }),
    getBaseUsernameVC("newUsername").optional(),
    getBaseEmailVC("newEmail").optional(),
    asyncHandler(async (req, res) => {
      let newPhotoPublicId;
      if (!req.body.senderUsername)
        return res.status(400).send({
          error: { message: 'Missing required property: "senderUsername"' },
        });
      if (
        !req.body.newUsername &&
        !req.body.newEmail &&
        !req.body.newPictureBase64
      )
        return res.status(400).send({
          error: {
            message:
              "Missing update data. Request must contain at lest one of: newUsername, newEmail, newPictureBase64",
          },
        });

      const valError = validationResult(req);
      if (!valError.isEmpty()) {
        const result = valError.formatWith((error) => {
          const paths = {
            newEmail: "email",
            newUsername: "username",
          };

          return {
            field: paths[error.path],
            message: error.msg,
          };
        });
        return res.status(422).send({
          error: {
            validation: result.array(),
          },
        });
      }

      if (req.user.username != req.body.senderUsername)
        return res.status(401).send();

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
    }),
  ];
};

module.exports = {
  getUsers,
  getProfilePictureByUsername,
  putUser,
};
