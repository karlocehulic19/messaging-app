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

const MockedImageManager = (() => {
  const profPictures = { ...mockedBufferImages };

  const uploadCropped = async (base64) => {
    const id = randomUUID();
    profPictures[id] = {
      imageBuffer: Buffer.from(base64, "base64"),
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

function getRealBase64(JimpBase64) {
  return JimpBase64.split(",")[1];
}

const setupLogged = async () => {
  const originalImage = new Jimp({ width: 400, height: 400 }, "#FFFFFF");
  const originalImageBase64 = getRealBase64(
    await originalImage.getBase64("image/jpeg")
  );
  const originalLoggedUser = {
    username: "TestUser",
    firstName: "First",
    lastName: "Last",
    email: "test@email.com",
    password: "testPassword@1",
    pictureBase64: originalImageBase64,
  };

  await request(app).post("/register").send(originalLoggedUser);
  const token = await request(app)
    .post("/login")
    .send({ username: "TestUser", password: "testPassword@1" });

  return { originalImage, originalLoggedUser, token };
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
    const { originalImage, originalLoggedUser, token } = await setupLogged();
    const newImg = new Jimp({ width: 400, height: 400 }, "#EEEEEE");
    const newImgBase64 = getRealBase64(await newImg.getBase64("image/jpeg"));
    const newImgBuffer = await newImg.getBuffer("image/jpeg");
    const oldImgBuffer = await originalImage.getBuffer("image/jpeg");
    const oldProfPicId = (
      await prisma.user.findFirst({
        where: { username: originalLoggedUser.username },
      })
    ).photoPublicId;

    const res = await request(app)
      .put("/users/update")
      .send({
        senderUsername: originalLoggedUser.username,
        newUsername: "UpdatedUser",
        newEmail: "email@test.com",
        newPictureBase64: newImgBase64,
      })
      .set("Authentication", `Bearer ${token}`);
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
    const { originalLoggedUser, originalImage, token } = await setupLogged();

    const res1 = await request(app)
      .put("/users/update")
      .send({
        senderUsername: originalLoggedUser.username,
        newUsername: "UpdatedUsername1",
      })
      .set("Authentication", `Bearer ${token}`);
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

    const res2 = await request(app)
      .put("/users/update")
      .send({
        senderUsername: "UpdatedUsername1",
        newEmail: "updated@email.com",
      })
      .set("Authentication", `Bearer ${token}`);
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
    const newImgBase64 = getRealBase64(await newImg.getBase64("image/jpeg"));

    const res3 = await request(app)
      .put("/users/update")
      .send({
        senderUsername: "UpdatedUsername1",
        newPictureBase64: newImgBase64,
      })
      .set("Authentication", `Bearer ${token}`);
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

  it("updates updatable values concurrently", async () => {
    const { originalImage, originalLoggedUser, token } = await setupLogged();
    let currUser = { ...originalLoggedUser };
    let currProfile = originalImage;

    const conResUsernameEmail = await request(app)
      .put("/users/update")
      .send({
        senderUsername: originalLoggedUser.username,
        newUsername: "UpdatedUsername",
        newEmail: "updated@email.com",
      })
      .set("Authentication", `Bearer ${token}`);

    expect(conResUsernameEmail.status).toBe(200);
    expect(conResUsernameEmail.body).toEqual({
      username: "UpdatedUsername",
      email: "updated@email.com",
    });
    currUser = { ...currUser, ...conResUsernameEmail.body };
    expect(
      await prisma.user.findFirst({
        where: { username: originalLoggedUser.username },
      })
    ).toBeNull();
    expect(
      await prisma.user.findFirst({
        where: { email: originalLoggedUser.email },
      })
    ).toBeNull();
    expect(
      await prisma.user.findFirst({ where: { username: "UpdatedUsername" } })
    ).not.toBeNull();
    expect(
      await prisma.user.findFirst({ where: { username: "UpdatedUsername" } })
    ).toEqual(
      await prisma.user.findFirst({ where: { email: "updated@email.com" } })
    );
    const imgResponse1 = await request(app).get(
      "/profile-picture/UpdatedUsername"
    );
    expect(imgResponse1.body).toEqual(
      await originalImage.getBuffer("image/jpeg")
    );
  });
});
