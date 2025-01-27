const { request, app, prisma } = require("../setupApp")();
const userController = require("../../controllers/userController");
const { faker } = require("@faker-js/faker");
const { Buffer } = require("node:buffer");

const setup = () => {
  const mockedBufferImages = {
    validId1: [Buffer.from("test buffer 1"), "image/jpeg"],
    validId2: [Buffer.from("test buffer 2"), "image/png"],
    validId3: [Buffer.from("test buffer 3"), "image/png"],
  };

  const MockedImageManager = {
    getProfilePicture: async (username) => {
      return mockedBufferImages[username];
    },
  };

  return { MockedImageManager, mockedBufferImages };
};

app.get(
  "/profile-picture/:username",
  userController.getProfilePictureByUsername(setup().MockedImageManager)
);

describe("/profile-picture", () => {
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
        setup().mockedBufferImages[tesPhotoPublicId][1]
      );
      expect(response.body).toEqual(
        setup().mockedBufferImages[tesPhotoPublicId][0]
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
});
