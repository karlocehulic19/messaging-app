const userController = require("../../controllers/userController");
const authController = require("../../controllers/authController");
const { faker } = require("@faker-js/faker");
const { Buffer } = require("node:buffer");
const { Jimp } = require("jimp");
const { randomUUID } = require("node:crypto");

const mockedBufferImages = {
  validId1: {
    imageBuffer: Buffer.from("test buffer 1"),
    mimeType: "image/jpeg",
  },
  validId2: {
    imageBuffer: Buffer.from("test buffer 2"),
    mimeType: "image/jpeg",
  },
  validId3: {
    imageBuffer: Buffer.from("test buffer 3"),
    mimeType: "image/jpeg",
  },
};

function getRealBase64(dataURIBase64) {
  const base = dataURIBase64.split(",")[1];
  if (!base) {
    throw new Error("Provided dataURI isn't data URL");
  }
  return base;
}

const MockedImageManager = (() => {
  const profPictures = { ...mockedBufferImages };

  const uploadCropped = async (dataURIBase64) => {
    const id = randomUUID();
    profPictures[id] = {
      imageBuffer: Buffer.from(getRealBase64(dataURIBase64), "base64"),
      mimeType: "image/jpeg",
    };
    return id;
  };

  const getProfilePicture = async (profPicId) => {
    return profPicId in profPictures ? profPictures[profPicId] : null;
  };

  const deletePicture = async (profPicId) => {
    if (profPicId in profPictures) delete profPictures[profPicId];
    return;
  };

  return { uploadCropped, getProfilePicture, deletePicture };
})();

const setupLogged = async () => {
  const originalImage = new Jimp({ width: 400, height: 400 }, "#FFFFFF");
  const dataURIImageBase64 = await originalImage.getBase64("image/jpeg");
  const originalLoggedUser = {
    username: "TestUser",
    firstName: "First",
    lastName: "Last",
    email: "test@email.com",
    password: "testPassword@1",
    pictureBase64: dataURIImageBase64,
  };

  await request(app).post("/register").send(originalLoggedUser);
  const token = (
    await request(app)
      .post("/login")
      .send({ username: "TestUser", password: "testPassword@1" })
  ).body.token;

  const putWrapper = (data) => {
    return request(app)
      .put("/users/update")
      .send(data)
      .set("Authorization", `Bearer ${token}`);
  };

  return { originalImage, originalLoggedUser, putWrapper };
};

const { request, app, prisma } = require("../setupApp")((app) => {
  require("../../config/passport").config();
  app.get(
    "/profile-picture/:username",
    userController.getProfilePictureByUsername(MockedImageManager)
  );
  app.put("/users/update", userController.putUser(MockedImageManager));
  app.post("/register", authController.userPost(MockedImageManager));
  app.post("/login", authController.loginPost);
});

describe("getProfilePictureByUsername", () => {
  it("sends picture blob if photoPublicId is present in user", async () => {
    const usernameProfPicArr = [
      ["testUser1", "validId1"],
      ["testUser2", "validId2"],
      ["testUser3", "validId3"],
    ];

    for (const [username, photoPublicId] of usernameProfPicArr)
      await prisma.user.createMany({
        data: {
          username,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          password: faker.internet.password(),
          photoPublicId,
        },
      });

    for (const [testUsername, tesPhotoPublicId] of usernameProfPicArr) {
      const response = await request(app).get(
        `/profile-picture/${testUsername}`
      );
      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe(
        mockedBufferImages[tesPhotoPublicId].mimeType
      );
      expect(response.body).toEqual(
        mockedBufferImages[tesPhotoPublicId].imageBuffer
      );
    }
  });

  it("sends 404 on user not existing in database", async () => {
    const response1 = await request(app).get(
      "/profile-picture/invalidUsername"
    );

    expect(response1.status).toBe(404);
    expect(response1.body).toEqual({
      error: "Searched username doesn't exist in the database",
    });

    await prisma.user.create({
      data: {
        username: "invalidUsername",
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        photoPublicId: "validId1",
      },
    });

    const response2 = await request(app).get(
      "/profile-picture/invalidUsername"
    );

    expect(response2.status).toBe(200);
  });

  it("sends 204 when searching for valid user but no profile picture", async () => {
    await prisma.user.create({
      data: {
        username: "noPictureUser",
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      },
    });

    const response = await request(app).get("/profile-picture/noPictureUser");

    expect(response.status).toBe(204);
  });

  it("sends 204 when ImageManager.getProfilePicture return null", async () => {
    await prisma.user.create({
      data: {
        username: "invalidPictureUser",
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        photoPublicId: "invalidId",
      },
    });

    const response = await request(app).get(
      "/profile-picture/invalidPictureUser"
    );

    expect(response.status).toBe(204);
  });
});

describe("putUser", () => {
  it("updates all updatable values", async () => {
    // Need right JWT authentication
    // Need right user to authenticate
    const { originalImage, originalLoggedUser, putWrapper } =
      await setupLogged();
    const newImg = new Jimp({ width: 400, height: 400 }, "#EEEEEE");
    const newImgDataURIBase64 = await newImg.getBase64("image/jpeg");
    const newImgBuffer = await newImg.getBuffer("image/jpeg");
    const oldImgBuffer = await originalImage.getBuffer("image/jpeg");
    const oldProfPicId = (
      await prisma.user.findFirst({
        where: { username: originalLoggedUser.username },
      })
    ).photoPublicId;

    const res = await putWrapper({
      senderUsername: originalLoggedUser.username,
      newUsername: "UpdatedUser",
      newEmail: "email@test.com",
      newPictureBase64: newImgDataURIBase64,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      username: "UpdatedUser",
      email: "email@test.com",
    });
    const imageResponse = await request(app).get(
      "/profile-picture/UpdatedUser"
    );
    expect(imageResponse.body).toEqual(newImgBuffer);
    expect(imageResponse.body).toEqual(oldImgBuffer);
    expect(
      await prisma.user.findFirst({
        where: { username: originalLoggedUser.username },
      })
    ).toBeNull();

    // needed to se if controller calls deleteProfilePicture inside ImageManager -> saves space and cost of Cloud Services
    expect(await MockedImageManager.getProfilePicture(oldProfPicId)).toBeNull();
  });

  it("updates updatable values separately", async () => {
    const { originalLoggedUser, originalImage, putWrapper } =
      await setupLogged();

    const res1 = await putWrapper({
      senderUsername: originalLoggedUser.username,
      newUsername: "UpdatedUsername1",
    });
    expect(res1.statusCode).toBe(200);
    expect(res1.body).toEqual({ username: "UpdatedUsername1" });
    expect(
      await prisma.user.findFirst({
        where: { username: originalLoggedUser.username },
      })
    ).toBeNull();
    const imageRes1 = await request(app).get(
      "/profile-picture/UpdatedUsername1"
    );
    expect(imageRes1.body).toEqual(await originalImage.getBuffer("image/jpeg"));

    const res2 = await putWrapper({
      senderUsername: "UpdatedUsername1",
      newEmail: "updated@email.com",
    });
    expect(res2.statusCode).toBe(200);
    expect(res2.body).toEqual({ email: "updated@email.com" });
    expect(
      await prisma.user.findFirst({
        where: { email: originalLoggedUser.email },
      })
    ).toBeNull();
    expect(
      await prisma.user.findFirst({ where: { email: "updated@email.com" } })
    ).not.toBeNull();
    const imageRes2 = await request(app).get(
      "/profile-picture/UpdatedUsername1"
    );
    expect(imageRes2.body).toEqual(await originalImage.getBuffer("image/jpeg"));

    const originalProfPicId = (
      await prisma.user.findFirst({ where: { username: "UpdatedUsername1" } })
    ).photoPublicId;
    const newImg = new Jimp({ width: 200, height: 200 }, "#FFFFFF");

    const res3 = await putWrapper({
      senderUsername: "UpdatedUsername1",
      newPictureBase64: await newImg.getBase64("image/jpeg"),
    });
    expect(res3.statusCode).toBe(200);
    expect(res3.body).toEqual({});
    const imageRes3 = await request(app).get(
      "/profile-picture/UpdatedUsername1"
    );
    expect(imageRes3.body).toEqual(await newImg.getBuffer("image/jpeg"));
    expect(
      await MockedImageManager.getProfilePicture(originalProfPicId)
    ).toBeNull();
  });

  it("sends 401 on wrong user authentication", async () => {
    const { putWrapper } = await setupLogged();

    await request(app).post("/register").send({
      username: "SomeUsername",
      firstName: "First",
      lastName: "Last",
      password: "Password@1",
      email: "some@email.com",
    });

    const res = await putWrapper({
      senderUsername: "SomeUsername",
      newUsername: "AnotherUsername",
    });
    expect(res.status).toBe(401);
  });

  it("sends 400 on missing senderUsername", async () => {
    const { putWrapper } = await setupLogged();
    const res = await putWrapper({
      newUsername: "SomeOtherUsername",
      newEmail: "OtherEmail",
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe(
      'Missing required property: "senderUsername"'
    );
  });

  it("sends 400 on no updated data", async () => {
    const { putWrapper, originalLoggedUser } = await setupLogged();

    const res = await putWrapper({
      senderUsername: originalLoggedUser.username,
    });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe(
      "Missing update data. Request must contain at lest one of: newUsername, newEmail, newPictureBase64"
    );
  });

  it("sends 422 on invalid email", async () => {
    const { originalLoggedUser, putWrapper } = await setupLogged();
    const res = await putWrapper({
      senderUsername: originalLoggedUser.username,
      newEmail: "invalid",
    });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      error: {
        validation: [
          {
            field: "email",
            message: "Email must have format username@example.com",
          },
        ],
      },
    });
  });

  it("sends 422 on if user with updated email exists", async () => {
    const { originalLoggedUser, putWrapper } = await setupLogged();

    await request(app).post("/register").send({
      firstName: "First",
      lastName: "Last",
      username: "SomeUsername",
      password: "Password@1",
      email: "inuse@email.com",
    });

    const res = await putWrapper({
      senderUsername: originalLoggedUser.username,
      newEmail: "inuse@email.com",
    });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      error: {
        validation: [
          {
            field: "email",
            message: "User with that email already exists",
          },
        ],
      },
    });
  });

  it("sends 422 if user with username already exists", async () => {
    const { originalLoggedUser, putWrapper } = await setupLogged();

    await request(app).post("/register").send({
      username: "inuse",
      firstName: "First",
      lastName: "Last",
      password: "Password@1",
      email: "some@email.com",
    });

    const res = await putWrapper({
      senderUsername: originalLoggedUser.username,
      newUsername: "inuse",
    });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      error: {
        validation: [
          {
            field: "username",
            message: "User with that username already exists",
          },
        ],
      },
    });
  });

  it("sends 422 on non ascii characters in username", async () => {
    const { originalLoggedUser, putWrapper } = await setupLogged();
    const res = await putWrapper({
      senderUsername: originalLoggedUser.username,
      newUsername: "Žiko",
    });

    expect(res.status).toBe(422);
    expect(res.body.error.validation).toEqual([
      {
        field: "username",
        message: "Username contains invalid characters",
      },
    ]);
  });
});
