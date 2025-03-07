const authController = require("../../controllers/authController");

const MockedImageManager = {
  // eslint-disable-next-line no-undef
  uploadCropped: vi.fn(async (file) => {
    return file === "data:text/plain;base64,dataURLbase64"
      ? "somePublicId"
      : null;
  }),
};

const { app, request, prisma } = require("../setupApp")((app) => {
  require("../../config/passport").config();
  app.post("/register", authController.userPost(MockedImageManager));
});

beforeEach(() => {
  // eslint-disable-next-line no-undef
  vi.clearAllMocks();
});

describe("/register", () => {
  it("adds user with photoPublicId when ImageManager returns image publicId", async () => {
    const response = await request(app).post("/register").send({
      username: "Karlo",
      firstName: "Karlo",
      lastName: "Čehulić",
      email: "karlocehlic@gmail.com",
      password: "V4l1dP4ssw@rd",
      pictureBase64: "data:text/plain;base64,dataURLbase64",
    });

    const user = await prisma.user.findFirst({
      where: {
        username: "Karlo",
      },
    });

    expect(response.status).toBe(200);
    expect(user.photoPublicId).toBe("somePublicId");
  });

  it("doesn't add user when null is returned for publicId", async () => {
    const response = await request(app).post("/register").send({
      username: "Karlo",
      firstName: "Karlo",
      lastName: "Čehulić",
      email: "karlocehlic@gmail.com",
      password: "V4l1dP4ssw@rd",
      pictureBase64: "data:someGibberish,base64",
    });

    const user = await prisma.user.findFirst({
      where: {
        username: "Karlo",
      },
    });

    expect(response.status).toBe(200);
    expect(user.photoPublicId).toBeNull();
  });

  it("doesn't call ImageManager if pictureBase64 isn't provided", async () => {
    await request(app).post("/register").send({
      username: "Karlo",
      firstName: "Karlo",
      lastName: "Čehulić",
      email: "karlocehlic@gmail.com",
      password: "V4l1dP4ssw@rd",
    });

    const user = await prisma.user.findFirst({
      where: {
        username: "Karlo",
      },
    });

    expect(MockedImageManager.uploadCropped).not.toBeCalled();
    expect(user.photoPublicId).toBeNull();
  });

  it("responds with 422 when pictureBase64 isn't base64", () => {
    return request(app)
      .post("/register")
      .send({
        username: "Karlo",
        firstName: "Karlo",
        lastName: "Čehulić",
        email: "karlocehlic@gmail.com",
        password: "V4l1dP4ssw@rd",
        pictureBase64: "someOtherFalseString",
      })
      .expect(422, {
        error: "Provided picture string isn't in data URI base64 format",
      });
  });
});
