const messageRouter = require("../../routes/messageRouter");
const authRouter = require("../../routes/authRouter");

const { app, request } = require("../setupApp")((app) => {
  require("../../config/passport").config();
  app.use("/message", messageRouter);
  app.use("/", authRouter);
});

const setupUsers = async () => {
  await request(app).post("/register").send({
    username: "TestUser1",
    firstName: "Test",
    lastName: "One",
    password: "Password@1",
    email: "test1@email.com",
  });

  const { user: user1, token: token1 } = (
    await request(app).post("/login").send({
      username: "TestUser1",
      password: "Password@1",
    })
  ).body;

  await request(app).post("/register").send({
    username: "TestUser2",
    firstName: "Test",
    lastName: "One",
    password: "Password@1",
    email: "test2@email.com",
  });

  const { user: user2, token: token2 } = (
    await request(app).post("/login").send({
      username: "TestUser2",
      password: "Password@1",
    })
  ).body;

  return {
    user1,
    user2,
    bearerToken1: `Bearer ${token1}`,
    bearerToken2: `Bearer ${token2}`,
  };
};

describe("/message router", () => {
  it("send an message to an user", async () => {
    const { user1, user2, bearerToken1, bearerToken2 } = await setupUsers();
    // eslint-disable-next-line no-undef
    vitest.setSystemTime("2025-03-18T13:08:43.024Z");
    const sendReq = await request(app)
      .post("/message")
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some random message",
      })
      .set("Authorization", bearerToken1);
    expect(sendReq.status).toBe(200);

    const receiverReq = await request(app)
      .get(`/message?user=${user2.username}`)
      .set("Authorization", bearerToken2);
    expect(receiverReq.status).toBe(200);
    expect(receiverReq.body).toMatchSnapshot();
  });

  it("doesn't send opened messages", async () => {
    const { user1, user2, bearerToken1, bearerToken2 } = await setupUsers();

    const sendReq = await request(app)
      .post("/message")
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some random message",
      })
      .set("Authorization", bearerToken1);
    expect(sendReq.status).toBe(200);
    await request(app)
      .get(`/message?user=${user2.username}`)
      .set("Authorization", bearerToken2);

    const receiverReq = await request(app)
      .get(`/message?user=${user2.username}`)
      .set("Authorization", bearerToken2);

    expect(receiverReq.statusCode).toBe(204);
    expect(receiverReq.body).toEqual({});
  });
});
