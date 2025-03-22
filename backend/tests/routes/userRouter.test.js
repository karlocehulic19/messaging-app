const userRouter = require("../../routes/userRouter");
const { faker } = require("@faker-js/faker");
const { app, request, prisma } = require("../setupApp")((app) => {
  app.use("/users", userRouter);
});

const setup = async () => {
  faker.seed(123);

  // Ensures stable test(five usernames with "Jo" must be created)
  const usernames = [
    "John",
    "Josh",
    "Joanne",
    "Jodie",
    "Jon",
    "Alice",
    "Alan",
    "Ash",
    "Ana",
    "Amanda",
  ];

  for (let firstName of usernames) {
    await prisma.user.create({
      data: {
        username: faker.internet.username({ firstName }),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
      },
    });
  }

  return { usernames };
};

describe("/users", () => {
  it("returns first five users with searched username", async () => {
    await setup();

    const USERS_COUNT = 100;

    for (let i = 0; i < USERS_COUNT; i++) {
      await prisma.user.create({
        data: {
          username: faker.internet.username(),
          email: faker.internet.email(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          password: faker.internet.password(),
        },
      });
    }

    const response1 = await request(app).get("/users?s=A");
    expect(response1.status).toBe(200);
    expect(response1.body.length).toBe(5);
    for (let res of response1.body) {
      expect(res.username).toMatch(/A/);
    }

    const response2 = await request(app).get("/users?s=Jo");
    expect(response2.status).toBe(200);
    expect(response2.body.length).toBe(5);
    for (let res of response2.body) {
      expect(res.username).toMatch(/Jo/);
    }
  });

  it("response of user includes only the right data", async () => {
    await setup();

    const expectedData = ["username"];

    return request(app)
      .get("/users?s=Jo")
      .expect(200)
      .then((response) => {
        for (let user of response.body) {
          expect(Object.keys(user).sort()).toEqual(expectedData.sort());
          expect(user).toHaveProperty("username", expect.any(String));
        }
      });
  });

  it("returns only limited amount of users if more aren't present", async () => {
    for (const username of ["Brian", "Beyonce", "BritishGuy", "BrooklynBoy"]) {
      await prisma.user.create({
        data: {
          username,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          password: faker.internet.password(),
          email: faker.internet.email(),
        },
      });
    }

    const response1 = await request(app).get("/users?s=B");
    expect(response1.body.length).toBe(4);

    const response2 = await request(app).get("/users?s=Br");
    expect(response2.body.length).toBe(3);

    const response3 = await request(app).get("/users?s=Bri");
    expect(response3.body.length).toBe(2);

    const response4 = await request(app).get("/users?s=Bria");
    expect(response4.body.length).toBe(1);
  });

  it("returns empty array if user with username isn't found", () => {
    return request(app)
      .get("/users?s=t0t4lly4psurdN1ckn4m3")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([]);
      });
  });

  it("sends bad request if s query isn't present", () => {
    return request(app)
      .get("/users")
      .expect(400)
      .then((response) => {
        expect(response.body.error).toBe(
          "At least s or exists query is needed to send users get request."
        );
      });
  });

  describe("exists query", () => {
    it("sends 200 if user exists in db", async () => {
      await prisma.user.create({
        data: {
          username: "inDatabase",
          firstName: "In",
          lastName: "Database",
          password: "Password@1",
          email: "some@email.com",
        },
      });

      return request(app).get("/users?exists=inDatabase").expect(200);
    });

    it("sends 404 if user doesn't exist in db", () => {
      return request(app).get("/users?exists=notInDb").expect(404);
    });
  });
});
