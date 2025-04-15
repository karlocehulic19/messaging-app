import { http, HttpResponse } from "msw";
import { config } from "../Constants";
import { Jimp } from "jimp";

const BACKEND_URL = config.url.BACKEND_URL;

class User {
  static allUsers = {};

  constructor(
    firstName,
    lastName,
    username,
    email,
    password,
    id,
    optional = {}
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.username = username;
    this.email = email;
    this.password = password;
    this.id = id;
    this.token = optional.token;
    this.profilePicture = optional.profilePicture;
    this.photoPublicId = optional.photoPublicId;

    User.allUsers[this.username] = this;
  }

  getBasicObject() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      username: this.username,
      password: this.password,
      email: this.email,
      photoPublicId: this.photoPublicId,
      id: this.id,
    };
  }

  get bearerToken() {
    if (!this.token)
      throw new Error(`${this.username} doesn't have defined token`);
    return `Bearer ${this.token}`;
  }

  async getPictureBuffer() {
    if (!this.profilePicture)
      throw new Error(`${this.username} doesn't have profile picture`);
    return this.profilePicture.getBuffer("image/jpeg");
  }
}

export const defaultTestUser = new User(
  "Some",
  "Random",
  "someUsername",
  "someemail@some.com",
  "somePassword",
  "someUUId",
  {
    token: "randomJWTtoken",
    profilePicture: new Jimp({ height: 200, width: 200 }, "#FFFFFF"),
  }
);

export const firstTestUser = new User(
  "Test",
  "One",
  "Test",
  "testone@some.com",
  "TestOne@1",
  "someUUIDforTest",
  { profilePicture: new Jimp({ height: 200, width: 200 }, "#AAAAAA") }
);

export const secondTestUser = new User(
  "Test2",
  "Two",
  "Test2",
  "testtwo@some.com",
  "TestTwo@1",
  "someUUIDforTest2",
  { token: "secondJWTtoken" }
);

export const TimUser = new User(
  "Tim",
  "Timothy",
  "Tim",
  "tim@some.com",
  "TimIsCool@1",
  "someUUIDforTim"
);

export const poolingTestUser = new User(
  "Pooling",
  "Test",
  "Pooling",
  "pooling@some.com",
  "Pooling@1",
  "someUUIDforPooling"
);

export const oldMessagesUser = new User(
  "Old",
  "Messages",
  "OldUser",
  "oldmsgs@some.com",
  "OldMessages@1",
  "someUUIDforOldMEssages"
);

export const profPic1 = firstTestUser.profilePicture;
export const profPic1Buffer = firstTestUser.getPictureBuffer();
export const defaultProfPic = defaultTestUser.profilePicture;
export const defaultPicBuffer = defaultTestUser.getPictureBuffer();

export const defaultTestUserToken = defaultTestUser.token;
export const defaultTestUserBearer = defaultTestUser.bearerToken;
export const secondTestUserToken = secondTestUser.token;
export const secondTestUserBearer = secondTestUser.bearerToken;

export const Test2InstantMessage = "Hello from Test2";
export const TestPoolingMessage = "Hello this is message from pooling!";
export const oldMessage = `Hello, this is an old message from ${oldMessagesUser.username}`;

const db = User.allUsers;

export const userGetHandler = ({ request }) => {
  const url = new URL(request.url);
  const queries = url.searchParams;

  if (!queries.has("s") && !queries.has("exists")) {
    return HttpResponse.json(
      {
        error:
          "At least s or exists query is needed to send users get request.",
      },
      { status: 400 }
    );
  }

  if (queries.has("s")) {
    return HttpResponse.json(
      Object.values(db).filter((usr) => usr.username.includes(queries.get("s")))
    );
  }

  return new HttpResponse(null, {
    status: queries.get("exists") in db ? 200 : 400,
  });
};

export const handlers = [
  http.post(`${BACKEND_URL}/login`, async ({ request }) => {
    const body = await request.json();
    if (!body.username || !body.password) {
      return HttpResponse.json(
        { error: "Missing credentials" },
        { status: 401 }
      );
    }

    if (body.username != "someUsername" || body.password != "somePassword") {
      return HttpResponse.json(
        { messages: ["Username or password is incorrect"] },
        { status: 401 }
      );
    }
    return HttpResponse.json(
      {
        token: defaultTestUserToken,
        user: defaultTestUser.getBasicObject(),
      },
      { status: 200 }
    );
  }),

  http.post(`${BACKEND_URL}/register`, async ({ request }) => {
    const body = await request.json();
    const message = [];

    if (body.username == "inDatabase") {
      message.push("User with that username already exists");
    }

    if (body.email == "indatabase@example.com") {
      message.push("User with that email already exists");
    }

    if (message.length) {
      return HttpResponse.json({ message }, { status: 422 });
    }
    return new HttpResponse(null);
  }),

  http.all(`${BACKEND_URL}/test`, async ({ request }) => {
    return HttpResponse.json({
      passedHeaders: [...request.headers],
      isValid: true,
    });
  }),

  http.post(`${BACKEND_URL}/validate`, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    if (authHeader === defaultTestUserBearer) {
      return HttpResponse.json(
        {
          user: defaultTestUser.getBasicObject(),
        },
        { status: 200 }
      );
    } else if (authHeader === secondTestUserBearer) {
      return HttpResponse.json(
        {
          user: secondTestUser.getBasicObject(),
        },
        { status: 200 }
      );
    }
    return HttpResponse.json({}, { status: 401 });
  }),

  http.get(
    `${BACKEND_URL}/users/profile-picture/:username`,
    async ({ params }) => {
      if (Object.keys(db).includes(params.username)) {
        const user = db[params.username];
        try {
          return HttpResponse.arrayBuffer(await user.getPictureBuffer());
        } catch {
          return new HttpResponse(null, { status: 204 });
        }
      }

      switch (params.username) {
        case "NoPictureTest":
          return new HttpResponse(null, { status: 204 });
      }
    }
  ),

  http.get(`${BACKEND_URL}/users`, userGetHandler),
  http.put(`${BACKEND_URL}/users/update`, async ({ request }) => {
    const reqBody = await request.json();
    return HttpResponse.json({
      newUsername: reqBody.newUsername,
      newEmail: reqBody.newEmail,
    });
  }),

  http.post(`${BACKEND_URL}/messages`, async ({ request }) => {
    const body = await request.json();
    if (body.receiver == secondTestUser.username) {
      return HttpResponse.json([
        {
          date: new Date(new Date() - 1000 * 60),
          message: Test2InstantMessage,
        },
      ]);
    }
    return HttpResponse.json([]);
  }),

  http.get(`${BACKEND_URL}/messages`, ({ request }) => {
    const url = new URL(request.url);
    const sender = url.searchParams.get("sender");

    return sender == poolingTestUser.username
      ? HttpResponse.json([
          {
            date: new Date(new Date() - 60 * 1000),
            message: TestPoolingMessage,
          },
        ])
      : new HttpResponse(null, { status: 204 });
  }),

  http.get(`${BACKEND_URL}/messages/old`, ({ request }) => {
    const url = new URL(request.url);
    const partner = url.searchParams.get("partner");
    if (partner == oldMessagesUser.username) {
      return HttpResponse.json([
        {
          message: oldMessage,
          date: new Date(),
          receiver: defaultTestUser.username,
          sender: oldMessagesUser.username,
        },
      ]);
    }

    return HttpResponse.json([]);
  }),
];
