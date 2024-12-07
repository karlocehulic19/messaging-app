import { http, HttpResponse } from "msw";
import { config } from "../Constants";

export const handlers = [
  http.post(`${config.url.BACKEND_URL}/login`, ({ request }) => {
    if (!request.body.username || !request.body.password) {
      return HttpResponse({ status: 401 });
    }
    return HttpResponse.json({ token: "randomJWTtoken" });
  }),
];
