const messageRouter = require("../../routes/messageRouter");
const authRouter = require("../../routes/authRouter");
const {
  MESSAGES_PER_REQUEST,
  MESSAGES_TIMESTAMP_THRESHOLD_SECONDS,
} = require("../../utils/constants");

const { app, request } = require("../setupApp")((app) => {
  require("../../config/passport").config();
  app.use("/messages", messageRouter);
  app.use("/", authRouter);
});

const MOCK_SYSTEM_TIME = "2025-03-18T13:08:43.024Z";
const mockedSystemDate = new Date(MOCK_SYSTEM_TIME);

const setup = () => {
  const messagesPost = () => request(app).post("/messages");
  const messagesGet = (sender, receiver, bearerToken) => {
    return request(app)
      .get(`/messages?sender=${sender}&receiver=${receiver}`)
      .set("Authorization", bearerToken);
  };
  const messagesOldGet = (user, partner, bearerToken) => {
    return request(app)
      .get(`/messages/old?user=${user}&partner=${partner}`)
      .set("Authorization", bearerToken);
  };

  return { messagesPost, messagesGet, messagesOldGet };
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
  it("GET sends an message to an user", async () => {
    const { user1, user2, bearerToken1, messagesPost, user2MessagesGet } =
      await setupUsers();
    // eslint-disable-next-line no-undef
    vitest.setSystemTime(MOCK_SYSTEM_TIME);
    const sendReq = await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some random message",
        clientTimestamp: mockedSystemDate,
      })
      .set("Authorization", bearerToken1);
    expect(sendReq.status).toBe(200);

    const receiverReq = await user2MessagesGet();
    expect(receiverReq.status).toBe(200);
    expect(receiverReq.body).toMatchSnapshot();
  });

  it("GET doesn't send opened messages", async () => {
    const { user1, user2, bearerToken1, messagesPost, user2MessagesGet } =
      await setupUsers();

    const sendReq = await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some random message",
        clientTimestamp: mockedSystemDate,
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
        clientTimestamp: mockedSystemDate,
      })
      .set("Authorization", bearerToken2);

    const afterMeantimeReq = await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some message",
        clientTimestamp: mockedSystemDate,
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
        clientTimestamp: mockedSystemDate,
      })
      .set("Authorization", bearerToken1);

    const response = await messagesGet(
      "nonExistentUser",
      user2.username,
      bearerToken2
    );
    expect(response.body).toEqual({});
  });

  it("POST returns 401 for sending messages with wrong authorization", async () => {
    const { user1, user2, messagesPost } = await setupUsers();
    return messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Some message",
        clientTimestamp: mockedSystemDate,
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
        clientTimestamp: mockedSystemDate,
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
        clientTimestamp: mockedSystemDate,
      })
      .set("Authorization", bearerToken1);

    expect(req1.statusCode).toBe(400);
    expect(req1.body).toMatchSnapshot();

    const req2 = await messagesPost()
      .send({
        sender: user1.username,
        message: "Some message",
        clientTimestamp: mockedSystemDate,
      })
      .set("Authorization", bearerToken1);

    expect(req2.statusCode).toBe(400);
  });

  it("GET sends 400 if any of necessary query params are missing", async () => {
    const { user1, bearerToken1 } = await setupUsers();
    const missingSenderResponse = await request(app)
      .get("/messages?receiver=SomeReceiver")
      .set("Authorization", bearerToken1);

    expect(missingSenderResponse.statusCode).toBe(400);
    expect(missingSenderResponse.body).toMatchSnapshot();

    const missingReceiverResponse = await request(app)
      .get(`/messages?sender=${user1.username}`)
      .set("Authorization", bearerToken1);

    expect(missingReceiverResponse.body).toMatchSnapshot();

    const missingBothResponse = await request(app)
      .get(`/messages`)
      .set("Authorization", bearerToken1);
    expect(missingBothResponse.body).toMatchSnapshot();
  });

  it("POST message date to one the time user sent request not the time server heard request", async () => {
    const { user1, user2, bearerToken1, messagesPost } = await setupUsers();

    const clientMs =
      mockedSystemDate - 1000 * (MESSAGES_TIMESTAMP_THRESHOLD_SECONDS + 1);
    const clientTime = new Date(clientMs);

    const response = await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message: "Delayed message",
        clientTimestamp: clientTime,
      })
      .set("Authorization", bearerToken1);

    expect(response.body).toEqual({
      error: "Client timestamp delay is too big",
    });
    expect(response.status).toBe(400);
  });

  it("GET sends messages based on clients timestamp not request timestamp", async () => {
    const { user1, user2, bearerToken1, messagesPost, user2MessagesGet } =
      await setupUsers();

    await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        message:
          "Second message that arrived to server first (delayed 5 seconds)",
        clientTimestamp: new Date(mockedSystemDate - 1000 * 5),
      })
      .set("Authorization", bearerToken1);

    await messagesPost()
      .send({
        sender: user1.username,
        receiver: user2.username,
        // Technically they arrived at the same time in our test suite but that should't affect actual validity of test
        message:
          "First message that arrived later to the server (delayed 10 seconds)",
        clientTimestamp: new Date(mockedSystemDate - 1000 * 10),
      })
      .set("Authorization", bearerToken1);

    const response = await user2MessagesGet();
    expect(response.body).toMatchSnapshot();
  });

  describe("/messages/old", () => {
    it("GET sends old messages", async () => {
      const {
        user1,
        user2,
        messagesPost,
        user2MessagesGet,
        bearerToken1,
        bearerToken2,
        messagesOldGet,
      } = await setupUsers();

      await messagesPost()
        .send({
          sender: user1.username,
          receiver: user2.username,
          message: "Some message",
          clientTimestamp: mockedSystemDate,
        })
        .set("Authorization", bearerToken1);

      // needed for making sure messages aren't considered new
      await user2MessagesGet();

      const response1 = await messagesOldGet(
        user1.username,
        user2.username,
        bearerToken1
      );
      expect(response1.body).toEqual([
        {
          date: MOCK_SYSTEM_TIME,
          message: "Some message",
          sender: user1.username,
          receiver: user2.username,
        },
      ]);

      const response2 = await messagesOldGet(
        user2.username,
        user1.username,
        bearerToken2
      );
      expect(response2.body).toEqual([
        {
          date: MOCK_SYSTEM_TIME,
          message: "Some message",
          sender: user1.username,
          receiver: user2.username,
        },
      ]);
    });

    it("GET doesn't send messages from other users that aren't receiver", async () => {
      const {
        user1,
        user2,
        bearerToken2,
        bearerToken1,
        messagesPost,
        messagesGet,
        messagesOldGet,
      } = await setupUsers();

      await messagesPost()
        .send({
          sender: user2.username,
          receiver: user1.username,
          message: "Some message",
          clientTimestamp: mockedSystemDate,
        })
        .set("Authorization", bearerToken2);

      await request(app).post("/register").send({
        username: "TestUser3",
        firstName: "Test",
        lastName: "One",
        password: "Password@1",
        email: "test3@email.com",
      });

      const { user: user3 } = (
        await request(app).post("/login").send({
          username: "TestUser3",
          password: "Password@1",
        })
      ).body;

      await messagesPost()
        .send({
          receiver: user3.username,
          sender: user1.username,
          message: "From user1 to user3",
          clientTimestamp: mockedSystemDate,
        })
        .set("Authorization", bearerToken1);

      await messagesPost()
        .send({
          receiver: user3.username,
          sender: user2.username,
          message: "From user2 to user3",
          clientTimestamp: mockedSystemDate,
        })
        .set("Authorization", bearerToken2);

      await messagesGet(user2.username, user1.username, bearerToken1);

      const response1 = await messagesOldGet(
        user1.username,
        user2.username,
        bearerToken1
      );
      expect(response1.body).toEqual([
        {
          date: MOCK_SYSTEM_TIME,
          message: "Some message",
          sender: user2.username,
          receiver: user1.username,
        },
      ]);
    });

    it("GET send partners opened messages", async () => {
      const {
        user1,
        user2,
        bearerToken1,
        bearerToken2,
        messagesPost,
        messagesOldGet,
      } = await setupUsers();
      await messagesPost()
        .send({
          sender: user2.username,
          receiver: user1.username,
          message: "Some message that shouldn't be fetched",
          clientTimestamp: mockedSystemDate,
        })
        .set("Authorization", bearerToken2);

      const response = await messagesOldGet(
        user1.username,
        user2.username,
        bearerToken1
      );

      expect(response.body).toEqual([]);
    });

    it("GET sends 400 when missing necessary props", async () => {
      const { bearerToken1 } = await setupUsers();

      const response = await request(app)
        .get("/messages/old")
        .set("Authorization", bearerToken1);
      expect(response.status).toBe(400);
      expect(response.body).toMatchSnapshot();
    });

    it("GET sends 401 if bearer token doesn't match user", async () => {
      const { bearerToken1, user2, messagesOldGet } = await setupUsers();

      const response = await messagesOldGet(
        user2.username,
        "SomeRandomName",
        bearerToken1
      );

      expect(response.status).toBe(401);
    });

    it(`GET only first ${MESSAGES_PER_REQUEST} messages if page not specified`, async () => {
      const { user1, bearerToken1, user2, messagesPost, messagesOldGet } =
        await setupUsers();
      const requests = [];

      for (let n = 0; n < 29; n++) {
        requests.push(
          messagesPost()
            .send({
              sender: user1.username,
              receiver: user2.username,
              message: `${n}. message`,
              clientTimestamp: mockedSystemDate,
            })
            .set("Authorization", bearerToken1)
        );
      }

      await Promise.all(requests);

      const response = await messagesOldGet(
        user1.username,
        user2.username,
        bearerToken1
      );
      const body = response.body;
      expect(body).toHaveLength(MESSAGES_PER_REQUEST);
    });

    it("GET page specific number of messages", async () => {
      const { user1, bearerToken1, user2, messagesPost } = await setupUsers();
      const requests = [];

      for (let n = 0; n < 29; n++) {
        requests.push(
          messagesPost()
            .send({
              sender: user1.username,
              receiver: user2.username,
              message: `${n}. message`,
              clientTimestamp: mockedSystemDate,
            })
            .set("Authorization", bearerToken1)
        );
      }

      await Promise.all(requests);

      const response = await request(app)
        .get(
          `/messages/old?page=2&user=${user1.username}&partner=${user2.username}`
        )
        .set("Authorization", bearerToken1);

      const body = response.body;
      expect(body).toHaveLength(4);
    });

    it("GET sends opened messages in order", async () => {
      const {
        user1,
        bearerToken1,
        bearerToken2,
        user2,
        messagesPost,
        messagesOldGet,
        user2MessagesGet,
      } = await setupUsers();
      const requests = [];

      for (let n = 0; n < 5; n++) {
        requests.push(
          messagesPost()
            .send({
              sender: user1.username,
              receiver: user2.username,
              message: `${n}. message`,
              clientTimestamp: new Date(mockedSystemDate - (5 - n) * 1000),
            })
            .set("Authorization", bearerToken1)
        );
      }

      await Promise.all(requests);
      await user2MessagesGet();

      const response = await messagesOldGet(
        user2.username,
        user1.username,
        bearerToken2
      );

      expect(response.body).toMatchSnapshot();
    });
  });
});
