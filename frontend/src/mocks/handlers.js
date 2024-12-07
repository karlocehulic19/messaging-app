import { http, HttpResponse } from "msw";
import { config } from "../Constants";

export const handlers = [
  http.post(`${config.url.BACKEND_URL}/login`, async ({ request }) => {
    const body = await request.json();
    if (!body.username || !body.password) {
      return new HttpResponse("Missing credentials", { status: 401 });
    }

    if (body.username != "someUsername" || body.password != "somePassword") {
      return HttpResponse.json(
        { messages: ["Username or password is incorrect"] },
        { status: 401 }
      );
    }
    return HttpResponse.json({ token: "randomJWTtoken" }, { status: 200 });
  }),
];
