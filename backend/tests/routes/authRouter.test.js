const prisma = require("../../prisma");
const request = require("supertest");
const express = require("express");
const authRouter = require("../../routes/authRouter");
const errorMiddleware = require("../../middleware/errorMiddleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRouter);

app.use(errorMiddleware);

const mockUser = {
  firstName: "Test",
  lastName: "User",
  username: "TestUser",
  email: "testuser1@example.com",
  password: "TestPassword1!",
};

describe("/register", () => {
  describe("validates request", () => {
    it("sends bad request on empty body", async () => {
      const response = await request(app).post("/register");

      expect(response.status).toBe(400);
      expect(response.text).toBe(
        "Missing body property/ies: username, firstName, lastName, password, email"
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

    it("sends bad request on missing email", async () => {
      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, email: undefined });

      expect(response.status).toBe(400);
      expect(response.text).toBe("Missing body property/ies: email");
    });

    it("sends bad request when too many body properties are present (all necessary remain)", () => {
      return request(app)
        .post("/register")
        .send({ ...mockUser, foo: "random", bar: "random" })
        .expect(400)
        .then((response) => {
          expect(response.text).toBe(
            "Request sent invalid properties: foo, bar"
          );
        });
    });

    it("sends bad request when too many body properties are present (missing username)", () => {
      return request(app)
        .post("/register")
        .send({
          ...mockUser,
          username: undefined,
          foo: "random",
          bar: "random",
        })
        .expect(400)
        .then((response) => {
          expect(response.text).toBe("Missing body property/ies: username");
        });
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
      expect(response.body).toEqual({
        message: ["Username contains invalid characters"],
      });
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
      expect(response.body).toEqual({
        message: [
          "First Name contains non alphabetical values",
          "Last Name contains non alphabetical values",
        ],
      });
    });

    it("enables only alphabetical values in first name", async () => {
      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, firstName: "Test@" });

      expect(response.status).toBe(422);
      expect(response.body.message).toEqual([
        "First Name contains non alphabetical values",
      ]);
    });

    it("enables only alphabetical values in last name", async () => {
      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, lastName: "last." });

      expect(response.status).toBe(422);
      expect(response.body.message).toEqual([
        "Last Name contains non alphabetical values",
      ]);
    });

    it("enables only unique usernames", async () => {
      await prisma.user.create({
        data: {
          username: "TestUser1",
          firstName: "Test",
          lastName: "User",
          password: "willBeEncrypted",
          email: "random@example.com",
        },
      });

      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, username: "TestUser1" });

      expect(response.status).toBe(422);
      expect(response.body.message).toEqual([
        "User with that username already exists",
      ]);
    });

    it("sends bad req when password is longer than 8 chars", async () => {
      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, password: "lL1@" });

      expect(response.status).toBe(422);
      expect(
        response.body.message.includes(
          "Password must contain at least 8 characters"
        )
      ).toBe(true);
    });

    it("sends bad req when password is not containing uppercase", async () => {
      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, password: "l11111@11" });

      expect(response.status).toBe(422);
      expect(response.body.message).toEqual([
        "Password must contain at least one uppercase letter",
      ]);
    });

    it("sends bad req when password is not containing lowercase", async () => {
      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, password: "L11111@11" });

      expect(response.status).toBe(422);
      expect(response.body.message).toEqual([
        "Password must contain at least one lowercase letter",
      ]);
    });

    it("sends bad req when password is not containing a number", async () => {
      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, password: "Ll@@@@@@" });

      expect(response.status).toBe(422);
      expect(response.body.message).toEqual([
        "Password must contain at least one number",
      ]);
    });

    it("sends bad req when password is not containing a symbol", async () => {
      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, password: "Ll111111" });

      expect(response.status).toBe(422);
      expect(response.body.message).toEqual([
        "Password must contain at least one symbol",
      ]);
    });

    it("sends bad req when email is not in right formal", () => {
      return request(app)
        .post("/register")
        .send({ ...mockUser, email: "wrongemail.com" })
        .expect(422)
        .then((response) => {
          expect(response.body).toEqual({
            message: ["Email must be have form username@example.com"],
          });
        });
    });

    it("sends bad req when email is db", async () => {
      await prisma.user.create({
        data: {
          firstName: "Test",
          lastName: "User",
          email: "email@email.com",
          password: "8Length!",
          username: "SomeRandomName",
        },
      });

      const response = await request(app)
        .post("/register")
        .send({ ...mockUser, email: "email@email.com" });
      expect(response.status).toBe(422);
      expect(response.body).toEqual({
        message: ["User with that email already exists"],
      });
    });
  });
});
