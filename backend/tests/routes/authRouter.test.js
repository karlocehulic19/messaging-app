/* eslint-disable no-undef */
const prisma = require("../../prisma");
const request = require("supertest");
const express = require("express");
const authRouter = require("../../routes/authRouter");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRouter);

app.use((err, req, res, next) => {
  console.log(err);

  res.send(err.statusCode || 500).send("Internal Server Error");
});

const mockUser = {
  firstName: "Test",
  lastName: "User",
  username: "TestUser",
  password: "TestPassword",
};

describe("/register", () => {
  it("sends bad request on empty body", async () => {
    const response = await request(app).post("/register");

    expect(response.status).toBe(400);
    expect(response.text).toBe(
      "Missing body property/ies: firstName, lastName, password"
    );
  });

  it("sends bad request on missing first name", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, firstName: undefined });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Missing body property/ies: firstName");
  });

  it("sends bad request on missing last name", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, lastName: undefined });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Missing body property/ies: lastName");
  });

  it("sends bad request on missing first and last name", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, firstName: undefined, lastName: undefined });

    expect(response.status).toBe(400);
    expect(response.text).toBe(
      "Missing body property/ies: firstName, lastName"
    );
  });

  it("sends bad request on missing password", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, password: undefined });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Missing body property/ies: password");
  });

  it("sends bad request on missing firstName and password", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, password: undefined, firstName: undefined });

    expect(response.status).toBe(400);
    expect(response.text).toBe(
      "Missing body property/ies: firstName, password"
    );
  });

  it("sends bad request with message when invalid characters are used in username", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, username: "Čoki" });

    await expect(
      async () =>
        await prisma.user.findFirstOrThrow({
          where: {
            username: "Čoki",
          },
        })
    ).rejects.toThrow();

    expect(response.status).toBe(422);
    expect(response.text).toBe("username contains invalid characters");
  });

  it("sends ok request with message when invalid characters are used in firstName", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, firstName: "Čoki" });

    expect(response.status).toBe(200);

    await expect(
      prisma.user.findFirstOrThrow({
        where: {
          firstName: "Čoki",
        },
      })
    ).resolves.toBeTypeOf("object");
  });

  it("enables only alphabetical values in first and last name", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, firstName: "Test1", lastName: "User1" });

    expect(response.status).toBe(422);
    expect(response.text).toBe(
      "firstName contains non alphabetical values, lastName contains non alphabetical values"
    );
  });

  it("enables only alphabetical values in first name", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, firstName: "Test@" });

    expect(response.status).toBe(422);
    expect(response.text).toBe("firstName contains non alphabetical values");
  });

  it("enables only alphabetical values in last name", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...mockUser, firstName: "last." });

    expect(response.status).toBe(422);
    expect(response.text).toBe("firstName contains non alphabetical values");
  });
});
