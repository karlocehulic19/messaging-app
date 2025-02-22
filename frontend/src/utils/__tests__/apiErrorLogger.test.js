import apiErrorLogger from "../apiErrorLogger";
import { describe, vi, expect, beforeEach } from "vitest";
import { ResponseError } from "../customFetch";

const consoleErrorSpy = vi
  .spyOn(console, "error")
  .mockImplementation(() => undefined);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("apiErrorLogger()", () => {
  it("Logs request.json() if request.json() is present", async () => {
    const testingResponse = new Response(JSON.stringify({ error: "message" }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resErr = new ResponseError("Bad request", testingResponse);

    await apiErrorLogger(resErr);

    expect(consoleErrorSpy.mock.calls[0][0]).toMatchSnapshot();
    expect(consoleErrorSpy.mock.calls[1][0]).toMatchSnapshot();
  });

  it("Logs only error when type of error isn't response error", async () => {
    const testingError = new Error("Ups! Something went wrong.");

    await apiErrorLogger(testingError);

    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith(testingError);
  });

  it("Logs only error message when response isn't containing json", async () => {
    const testingResponse = new Response(
      "Error text that shouldn't be standard"
    );

    console.log(testingResponse);

    const resErr = new ResponseError("Bad request", testingResponse);

    await apiErrorLogger(resErr);

    expect(consoleErrorSpy).toBeCalledTimes(1);
    expect(consoleErrorSpy).toBeCalledWith(resErr);
  });
});
