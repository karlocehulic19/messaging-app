import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { render, screen } from "@testing-library/react";
import "../../mocks/URL";
import { vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import * as customFetch from "../../utils/customFetch";
import { defaultTestUser, secondTestUser } from "../../mocks/handlers";
import { server } from "../../mocks/node";
import { http, HttpResponse } from "msw";
import { config } from "../../Constants";
import { Test2InstantMessage } from "../../mocks/handlers";

const setup = (initialEntries = ["/"]) => {
  localStorage.setItem("site", "randomJWTtoken");
  render(
    <App
      routerRender={(children) => (
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      )}
    />
  );
};

const setupMessage = async (initialEntries = ["/Test"]) => {
  setup(initialEntries);

  const user = userEvent.setup();
  const messageInput = await screen.findByRole("textbox");
  const firstMessageText = "Hello World";

  await user.click(messageInput);
  await user.keyboard("Hello World");
  vi.resetAllMocks();

  async function sendMessage() {
    await user.click(screen.getByRole("button", { name: "Send button" }));
  }

  return { user, messageInput, sendMessage, firstMessageText };
};

describe("<Main />", () => {
  it("displays selection text when no username is specified in url", () => {
    setup();
    expect(
      screen.getByRole("heading", {
        name: "Select user to message in the search bar",
      })
    ).toBeInTheDocument();
  });

  it("displays messaging interface when correct username is displayed", async () => {
    setup(["/Test"]);

    expect(
      await screen.findByRole("heading", { name: "Test" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Select user to message in the search bar",
      })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Message input" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send button" })
    ).toBeInTheDocument();

    const receiverProfilePic = await screen.findByRole("img", {
      name: "Test's profile picture",
    });
    expect(receiverProfilePic.src).toMatchSnapshot();
  });

  it("displays default profile picture on users without one", async () => {
    setup(["/Test2"]);
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    const receiverProfilePic = await screen.findByRole("img", {
      name: "Test2's profile picture",
    });

    expect(receiverProfilePic.src).toMatchSnapshot();
  });

  it("displays selection text when receiver isn't real user", async () => {
    setup(["/notInDb"]);

    expect(
      screen.getByRole("heading", {
        name: "Select user to message in the search bar",
      })
    ).toBeInTheDocument();
  });

  it("sends a message using send button", async () => {
    vi.setSystemTime("2025-04-04T20:33:37.997Z");
    const { firstMessageText, messageInput, sendMessage } =
      await setupMessage();

    const customFetchSpy = vi.spyOn(customFetch, "default");

    await sendMessage();

    expect(customFetchSpy.mock.calls[0][0]).toBe("/messages");
    expect(customFetchSpy.mock.calls[0][1]).toEqual({
      method: "POST",
      headers: { Authorization: "Bearer randomJWTtoken" },
      body: JSON.stringify({
        sender: defaultTestUser.username,
        receiver: secondTestUser.username,
        message: firstMessageText,
        clientTimestamp: new Date(),
      }),
    });
    const message = screen.getByText(firstMessageText);
    const timeStamp = screen.getByText("22:33");
    expect(message).toBeInTheDocument();
    expect(timeStamp).toBeInTheDocument();
    expect(messageInput).toHaveValue("");
  });

  it("sends a message using enter button", async () => {
    vi.setSystemTime("2025-04-04T20:33:37.997Z");

    const { user, firstMessageText } = await setupMessage();

    const customFetchSpy = vi.spyOn(customFetch, "default");

    await user.keyboard("{Enter}");

    expect(customFetchSpy.mock.calls[0][0]).toBe("/messages");
    expect(customFetchSpy.mock.calls[0][1]).toEqual({
      method: "POST",
      headers: { Authorization: "Bearer randomJWTtoken" },
      body: JSON.stringify({
        sender: defaultTestUser.username,
        receiver: secondTestUser.username,
        message: firstMessageText,
        clientTimestamp: new Date(),
      }),
    });
  });

  it("displays message time correctly", async () => {
    vi.setSystemTime("2025-04-04T20:03:37.997Z");
    const { user } = await setupMessage();

    await user.keyboard("{Enter}");

    expect(screen.getByText("22:03")).toBeInTheDocument();
  });

  it("displays new messages fetched when sent", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    const { sendMessage, firstMessageText } = await setupMessage(["/Test2"]);

    await sendMessage();

    const newMessage = await screen.findByText(Test2InstantMessage);
    const oldMessage = screen.getByText(firstMessageText);

    expect(newMessage).toBeInTheDocument();

    const messages = screen.getAllByLabelText(/message/);
    expect(messages[0]).toBe(newMessage);
    expect(messages[1]).toBe(oldMessage);
  });

  it("displays error popup on invalid message send", async () => {
    server.use(
      http.post(`${config.url.BACKEND_URL}/messages`, () =>
        HttpResponse.error()
      )
    );
    const { sendMessage, firstMessageText } = await setupMessage();

    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    await sendMessage();

    const errorPopup = screen.getByRole("alert");
    expect(errorPopup).toBeInTheDocument();

    expect(screen.getByRole("textbox")).toHaveValue(firstMessageText);
  });

  it("distinguishes messages from client and partner", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    const { sendMessage } = await setupMessage(["/Test2"]);

    await sendMessage();

    await screen.findByLabelText("Partner's message");
    expect(screen.queryByLabelText("Your message")).toBeInTheDocument();
  });
});
