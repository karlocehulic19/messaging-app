const express = require("express");
const app = express();
const authController = require("../../controllers/authController");
const prisma = require("../../prisma");
const request = require("supertest");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MockedImageManager = {
  // eslint-disable-next-line no-undef
  uploadCropped: vi.fn(async (file) => {
    return file === "validDataURL" ? "somePublicId" : null;
  }),
};

app.post("/register", authController.userPost(MockedImageManager));

require("../../config/passport").config();

describe("/register", () => {
  it("adds user with photoPublicId when ImageManager returns image publicId", async () => {
    const response = await request(app).post("/register").send({
      username: "Karlo",
      firstName: "Karlo",
      lastName: "Čehulić",
      email: "karlocehlic@gmail.com",
      password: "V4l1dP4ssw@rd",
      pictureBase64: "validDataURL",
    });

    const user = await prisma.user.findFirst({
      where: {
        username: "Karlo",
      },
    });

    expect(response.status).toBe(200);
    expect(user.photoPublicId).toBe("somePublicId");
  });
});
