import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { render, screen } from "@testing-library/react";
import "../../mocks/URL";
import { vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import * as customFetch from "../../utils/customFetch";
import { defaultTestUser, secondTestUser } from "../../mocks/handlers";

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
  await user.click(messageInput);
  await user.keyboard("Hello world");
  vi.resetAllMocks();

  return { user, messageInput };
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
    const { user, messageInput } = await setupMessage();

    const customFetchSpy = vi.spyOn(customFetch, "default");

    await user.click(screen.getByRole("button", { name: "Send button" }));

    expect(customFetchSpy.mock.calls[0][0]).toBe("/messages");
    expect(customFetchSpy.mock.calls[0][1]).toEqual({
      method: "POST",
      headers: { Authorization: "Bearer randomJWTtoken" },
      body: JSON.stringify({
        sender: defaultTestUser.username,
        receiver: secondTestUser.username,
        message: "Hello world",
        clientTimestamp: new Date(),
      }),
    });
    const message = screen.getByText("Hello world");
    const timeStamp = screen.getByText("22:33");
    expect(message).toBeInTheDocument();
    expect(timeStamp).toBeInTheDocument();
    expect(messageInput).toHaveValue("");
  });

  it("sends a message using enter button", async () => {
    vi.setSystemTime("2025-04-04T20:33:37.997Z");

    const { user } = await setupMessage();

    const customFetchSpy = vi.spyOn(customFetch, "default");

    await user.keyboard("{Enter}");

    expect(customFetchSpy.mock.calls[0][0]).toBe("/messages");
    expect(customFetchSpy.mock.calls[0][1]).toEqual({
      method: "POST",
      headers: { Authorization: "Bearer randomJWTtoken" },
      body: JSON.stringify({
        sender: defaultTestUser.username,
        receiver: secondTestUser.username,
        message: "Hello world",
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
    const { user } = await setupMessage(["/Test2"]);

    await user.click(screen.getByRole("button", { name: "Send button" }));

    expect(
      await screen.findByText("Hello world from partner")
    ).toBeInTheDocument();
  });
});
