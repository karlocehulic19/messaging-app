import { http, HttpResponse } from "msw";
import { config } from "../Constants";
import { Jimp } from "jimp";

const BACKEND_URL = config.url.BACKEND_URL;

export const defaultTestUser = {
  firstName: "Some",
  lastName: "Random",
  username: "someUsername",
  password: "somePassword",
  email: "someemail@some.com",
  photoPublicId: null,
  id: "someUUID",
};
export const defaultTestUserToken = "randomJWTtoken";
export const defaultTestUserBearer = `Bearer ${defaultTestUserToken}`;

export const secondTestUser = {
  firstName: "Test",
  lastName: "One",
  username: "Test",
  password: "TestOne@1",
  email: "TestOne@some.com",
  id: "someUUIDforTest",
};

export const profPic1 = new Jimp({ height: 200, width: 200 }, "#FFFFFF");
export const profPic1Buffer = profPic1.getBuffer("image/jpeg");
export const defaultProfPic = new Jimp({ height: 200, width: 200 }, "#AAAAAA");
export const defaultPicBuffer = defaultProfPic.getBuffer("image/jpeg");

const db = {
  Test: {
    username: "Test",
    profilePicture: profPic1Buffer,
  },
  Test2: {
    username: "Test2",
  },
  Tim: {
    username: "Tim",
  },
  [defaultTestUser.username]: {
    username: defaultTestUser.username,
    profilePicture: defaultPicBuffer,
  },
};

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
        user: defaultTestUser,
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
          user: defaultTestUser,
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
        return user.profilePicture
          ? HttpResponse.arrayBuffer(await user.profilePicture)
          : new HttpResponse(null, { status: 204 });
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

  http.post(`${BACKEND_URL}/messages`, () => {
    return HttpResponse.json([]);
  }),
];
