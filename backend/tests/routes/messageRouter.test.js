const messageRouter = require("../../routes/messageRouter");
const authRouter = require("../../routes/authRouter");

const { app, request } = require("../setupApp")((app) => {
  require("../../config/passport").config();
  app.use("/messages", messageRouter);
  app.use("/", authRouter);
});

const setup = () => {
  const messagesPost = () => request(app).post("/messages");
  const messagesGet = (sender, receiver, bearerToken) => {
    return request(app)
      .get(`/messages`)
      .send({
        sender,
        receiver,
      })
      .set("Authorization", bearerToken);
  };

  return { messagesPost, messagesGet };
};

const setupUsers = async () => {
  const utils = setup();

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

  const bearerToken1 = `Bearer ${token1}`;
  const bearerToken2 = `Bearer ${token2}`;
  const user2MessagesGet = () =>
    utils.messagesGet(user1.username, user2.username, bearerToken2);

  return {
    ...utils,
    user1,
    user2,
    bearerToken1,
    bearerToken2,
    user2MessagesGet,
  };
};

describe("messages router", () => {
  it("send an message to an user", async () => {
    const { user1, user2, bearerToken1, messagesPost, user2MessagesGet } =
      await setupUsers();
    // eslint-disable-next-line no-undef
    vitest.setSystemTime("2025-03-18T13:08:43.024Z");
    const sendReq = await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some random message",
      })
      .set("Authorization", bearerToken1);
    expect(sendReq.status).toBe(200);

    const receiverReq = await user2MessagesGet();
    expect(receiverReq.status).toBe(200);
    expect(receiverReq.body).toMatchSnapshot();
  });

  it("doesn't send opened messages", async () => {
    const { user1, user2, bearerToken1, messagesPost, user2MessagesGet } =
      await setupUsers();

    const sendReq = await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some random message",
      })
      .set("Authorization", bearerToken1);
    expect(sendReq.status).toBe(200);

    await user2MessagesGet();
    const receiverReq = await user2MessagesGet();

    expect(receiverReq.statusCode).toBe(204);
    expect(receiverReq.body).toEqual({});
  });

  it("POST checks for new messages from receiver between requests", async () => {
    const { user1, user2, bearerToken1, bearerToken2, messagesPost } =
      await setupUsers();

    await messagesPost()
      .send({
        sender: user2.username,
        receiver: user1.username,
        message: "Meantime message",
      })
      .set("Authorization", bearerToken2);

    const afterMeantimeReq = await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some message",
      })
      .set("Authorization", bearerToken1);
    expect(afterMeantimeReq.body).toMatchSnapshot();
  });

  it("GET responses with specific sender messages", async () => {
    const {
      user1,
      bearerToken1,
      user2,
      bearerToken2,
      messagesGet,
      messagesPost,
    } = await setupUsers();

    await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some message that shouldn't be fetched",
      })
      .set("Authorization", bearerToken1);

    const response = await messagesGet(
      "nonExistentUser",
      user2.username,
      bearerToken2
    );
    expect(response.body).toEqual({});
  });

  it("returns 401 for sending messages with wrong authorization", async () => {
    const { user1, user2, messagesPost } = await setupUsers();
    return messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some message",
      })
      .expect(401);
  });

  it("POST sends 401 for sending messages as wrong sender", async () => {
    const { user1, user2, bearerToken2, messagesPost } = await setupUsers();
    return messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some message",
      })
      .set("Authorization", bearerToken2)
      .expect(401);
  });

  it("GET sends 401 for wanting to receive messages as wrong user", async () => {
    const { user1, bearerToken2, messagesGet } = await setupUsers();
    return messagesGet("someRandomUser", user1.username, bearerToken2).expect(
      401
    );
  });

  it("POST sends 400 if any of necessary body props are missing", async () => {
    const { user1, user2, bearerToken1, messagesPost } = await setupUsers();
    const req1 = await messagesPost()
      .send({
        receiver: user2.username,
        message: "Some message",
      })
      .set("Authorization", bearerToken1);

    expect(req1.statusCode).toBe(400);
    expect(req1.body).toMatchSnapshot();

    const req2 = await messagesPost()
      .send({
        sender: user1.username,
        message: "Some message",
      })
      .set("Authorization", bearerToken1);

    expect(req2.statusCode).toBe(400);
  });

  it("GET sends 400 if any of necessary body props are missing", async () => {
    const { user1, bearerToken1, messagesGet } = await setupUsers();
    const response = await messagesGet(undefined, user1.username, bearerToken1);

    expect(response.statusCode).toBe(400);
  });
});
