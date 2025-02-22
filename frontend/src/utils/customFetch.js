import { config } from "../Constants";
import { merge } from "lodash";

export class ResponseError extends Error {
  constructor(message, response) {
    super(message);
    this.response = response;
  }
}

function getDefaultOptions() {
  const defaultOptions = { headers: { "Content-Type": "application/json" } };
  const token = localStorage.getItem("site");

  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  return defaultOptions;
}

export default async function customFetch(url, options) {
  const response = await fetch(
    `${config.url.BACKEND_URL}${url}`,
    merge(getDefaultOptions(), options)
  );
  if (!response.ok) {
    throw new ResponseError("Bad request error", response);
  }

  return response;
}
