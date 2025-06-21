const userRouter = require("../../routes/userRouter");
const { faker } = require("@faker-js/faker");
const { SEARCHED_USER_NUMBER } = require("../../utils/constants");
const { app, request, prisma } = require("../setupApp")((app) => {
  app.use("/users", userRouter);
});

const setup = async () => {
  faker.seed(123);

  // Ensures stable test(five firstNames with "Jo" must be created)
  const firstNames = [
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

  const usernames = [];

  for (let firstName of firstNames) {
    usernames.push(
      (
        await prisma.user.create({
          data: {
            username: faker.internet.username({ firstName }),
            email: faker.internet.email(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            password: faker.internet.password(),
          },
        })
      ).username,
    );
  }

  return { firstNames, usernames };
};

describe("/users", () => {
  it(`returns first ${SEARCHED_USER_NUMBER} users with searched username`, async () => {
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
    expect(response1.body.length).toBe(SEARCHED_USER_NUMBER);
    for (let res of response1.body) {
      expect(res.username).toMatch(/A/);
    }

    const response2 = await request(app).get("/users?s=Jo");
    expect(response2.status).toBe(200);
    expect(response2.body.length).toBe(SEARCHED_USER_NUMBER);
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

  it("respondes with five users with most messages user on empty s parameter", async () => {
    const { usernames } = await setup();

    for (let i = 0; i < SEARCHED_USER_NUMBER + 2; i++) {
      for (let j = 0; j < SEARCHED_USER_NUMBER + 2 - i; j++) {
        await prisma.message.create({
          data: {
            sender: usernames[i],
            receiver: usernames[i + 1],
            date: new Date(),
            message: `This is the ${j}. message!`,
          },
        });
      }
    }

    const resExplicit = await request(app).get("/users");

    const arrayOfReceivedUsernamesExplicit = resExplicit.body.map(
      (user) => user.username,
    );
    expect(arrayOfReceivedUsernamesExplicit).toEqual(
      usernames.slice(0, SEARCHED_USER_NUMBER),
    );

    const resImplicit = await request(app).get("/users?s=");

    const arrayOfReceivedUsernamesImplicit = resImplicit.body.map(
      (user) => user.username,
    );
    expect(arrayOfReceivedUsernamesImplicit).toEqual(
      usernames.slice(0, SEARCHED_USER_NUMBER),
    );
  });

  it("returns empty array if user with username isn't found", () => {
    return request(app)
      .get("/users?s=t0t4lly4psurdN1ckn4m3")
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual([]);
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
