const express = require("express");
const app = express();
const authController = require("../../controllers/authController");
const prisma = require("../../prisma");
const { vi } = require("vitest");
const request = require("supertest");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MockedImageManager = {
  uploadCropped: vi.fn(async (file) => {
    return file === "validDataURL" ? "somePublicId" : null;
  }),
};

app.post("/register", authController.userPost(MockedImageManager));

require("../../config/passport").config();

describe("/register", () => {
  it("adds user with photoPublicId when ImageManager returns image publicId", async () => {
    await request("/register").send({
      username: "Karlo",
      firstName: "Karlo",
      lastName: "Čehulić",
      email: "karlocehlic@gmail.com",
      password: "V4l1dP4ssw@rd",
      pictureBase64: "validDataURL",
    });

    expect(
      (
        await prisma.user.findFirst({
          where: {
            username: "Karlo",
          },
        })
      ).photoPublicId
    ).toBe("somePublicId");
  });
});
