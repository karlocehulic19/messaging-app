import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { act, render, screen, waitFor } from "@testing-library/react";
import "../../mocks/URL";
import { expect, vi } from "vitest";
import { userEvent } from "@testing-library/user-event";
import * as customFetch from "../../utils/customFetch";
import {
  defaultTestUser,
  firstTestUser,
  poolingTestUser,
  secondTestUser,
  TestPoolingMessage,
  oldMessagesUser,
  oldMessage,
  userWithoutPicture,
  dateMessagesUser,
  firstDateMessage,
  yesterdaysMessagesUser,
  todaysMessagesUser,
  firstYesterdaysDateMessage,
  firstTodaysDateMessage,
} from "../../mocks/handlers";
import { server } from "../../mocks/node";
import { http, HttpResponse } from "msw";
import { config, POOLING_INTERVAL_TIME_SECONDS } from "../../Constants";
import { Test2InstantMessage } from "../../mocks/handlers";

// Overrides react testing libraries tendency to use jest, needed for userEvents with fake timers
this.jest = vi;
const mockedSystemTime = "2025-04-04T20:33:37.997Z";

vi.mock("../../utils/apiErrorLogger", async (importOriginal) => ({
  default: vi.fn(async (error) => {
    if (
      ["No new messages found", "No profile picture found"].includes(
        error.message
      )
    )
      return;
    (await importOriginal()).default(error);
  }),
}));

const setup = (initialEntries = ["/"], initialIndex = 0) => {
  const user = userEvent.setup();
  localStorage.setItem("site", "randomJWTtoken");
  render(
    <App
      routerRender={(children) => (
        <MemoryRouter
          initialEntries={initialEntries}
          initialIndex={initialIndex}
        >
          {children}
        </MemoryRouter>
      )}
    />
  );

  return { user };
};

const setupMessage = async (
  initialEntries = ["/" + firstTestUser.username]
) => {
  const utils = setup(initialEntries);
  const user = utils.user;

  const messageInput = await screen.findByRole("textbox");
  const firstMessageText = "Hello World";

  await user.click(messageInput);
  await user.keyboard("Hello World");
  vi.resetAllMocks();

  async function sendMessage() {
    await user.click(screen.getByRole("button", { name: "Send button" }));
  }

  return { ...utils, user, messageInput, sendMessage, firstMessageText };
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
    setup(["/" + firstTestUser.username]);

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
      name: `${firstTestUser.username}'s profile picture`,
    });
    expect(receiverProfilePic.src).toMatchSnapshot();
  });

  it("displays default profile picture on users without one", async () => {
    setup(["/" + secondTestUser.username]);
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    const receiverProfilePic = await screen.findByRole("img", {
      name: `${secondTestUser.username}'s profile picture`,
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
    vi.setSystemTime(mockedSystemTime);
    const { firstMessageText, messageInput, sendMessage } =
      await setupMessage();

    const customFetchSpy = vi.spyOn(customFetch, "default");

    await sendMessage();

    expect(customFetchSpy.mock.calls[0][0]).toBe("/messages");
    expect(customFetchSpy.mock.calls[0][1]).toEqual({
      method: "POST",
      body: JSON.stringify({
        sender: defaultTestUser.username,
        receiver: firstTestUser.username,
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
    vi.setSystemTime(mockedSystemTime);

    const { user, firstMessageText } = await setupMessage();

    const customFetchSpy = vi.spyOn(customFetch, "default");

    await user.keyboard("{Enter}");

    expect(customFetchSpy.mock.calls[0][0]).toBe("/messages");
    expect(customFetchSpy.mock.calls[0][1]).toEqual({
      method: "POST",
      body: JSON.stringify({
        sender: defaultTestUser.username,
        receiver: firstTestUser.username,
        message: firstMessageText,
        clientTimestamp: new Date(),
      }),
    });
  });

  it("doesn't send empty messages", async () => {
    setup(["/" + firstTestUser.username]);
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "Send button" })
    );

    expect(screen.queryByText("22:33")).not.toBeInTheDocument();
  });

  it("displays message time correctly", async () => {
    // checking for for leading zeroes in 03
    vi.setSystemTime("2025-04-04T20:03:37.997Z");
    const { user } = await setupMessage();

    await user.keyboard("{Enter}");

    expect(screen.getByText("22:03")).toBeInTheDocument();
  });

  it("displays new messages fetched when sent", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    const { sendMessage, firstMessageText } = await setupMessage([
      "/" + secondTestUser.username,
    ]);

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
    const { sendMessage } = await setupMessage(["/" + secondTestUser.username]);

    await sendMessage();

    await screen.findByLabelText("Partner's message");
    expect(screen.queryByLabelText("Your message")).toBeInTheDocument();
  });

  it(`pools for new messages every ${POOLING_INTERVAL_TIME_SECONDS} seconds`, async () => {
    const customFetchSpy = vi.spyOn(customFetch, "default");
    const pooledMessagesUrl = `/messages?receiver=${defaultTestUser.username}&sender=${poolingTestUser.username}`;

    vi.useRealTimers();
    vi.useFakeTimers();
    setup(["/" + poolingTestUser.username]);

    await act(() => undefined);
    expect(customFetchSpy).toHaveBeenCalledWith(pooledMessagesUrl);

    expect(screen.getByText(TestPoolingMessage)).toBeInTheDocument();

    customFetchSpy.mockClear();
    await act(() => vi.advanceTimersByTime(3000));
    expect(customFetchSpy).toHaveBeenCalledWith(pooledMessagesUrl);

    expect(screen.getAllByText(TestPoolingMessage)).toHaveLength(2);

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("doesn't pool if not in messaging gui", async () => {
    vi.useFakeTimers();
    setup(["/" + poolingTestUser.username]);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const customFetchSpy = vi.spyOn(customFetch, "default");

    await act(() => vi.runOnlyPendingTimers());
    customFetchSpy.mockClear();
    await user.click(screen.getByLabelText("Options button"));

    await user.click(screen.getByRole("link", { name: "Settings" }));
    await act(() => vi.advanceTimersByTime(3000));

    expect(customFetchSpy).not.toHaveBeenCalledWith(
      `/messages?receiver=${defaultTestUser.username}&sender=${poolingTestUser.username}`
    );

    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("shows older messages", async () => {
    const customFetchSpy = vi.spyOn(customFetch, "default");
    const oldMessagesUrl = `/messages/old?user=${defaultTestUser.username}&partner=${oldMessagesUser.username}`;
    setup(["/" + oldMessagesUser.username]);

    await waitFor(() => {
      expect(customFetchSpy).toHaveBeenCalledWith(
        oldMessagesUrl,
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      );
    });
    expect(
      customFetchSpy.mock.calls.filter(([url]) => url == oldMessagesUrl)
    ).toHaveLength(1);

    expect(screen.getByLabelText("Partner's message")).toBeInTheDocument();
  });

  it("removes messages when switching partners", async () => {
    const { user } = setup(["/" + oldMessagesUser.username]);

    await screen.findByText(oldMessage);
    await user.click(screen.getByRole("searchbox"));
    await user.keyboard(secondTestUser.username);
    await user.click(
      await screen.findByLabelText(`${secondTestUser.username} user`)
    );

    expect(screen.queryByText(oldMessage)).not.toBeInTheDocument();
  });

  it("shows default profile picture after switching from partner with profile picture", async () => {
    const { user } = setup(["/" + firstTestUser.username]);
    const defaultPictureSrc =
      "http://localhost:3000/src/assets/default-profile-picture.jpeg";

    await user.click(screen.getByRole("searchbox"));
    await user.keyboard(userWithoutPicture.username);
    await user.click(
      await screen.findByLabelText(`${userWithoutPicture.username} user`)
    );

    expect(screen.getByRole("img").src).toBe(defaultPictureSrc);
  });

  it("displays dates for older messages", async () => {
    vi.setSystemTime(mockedSystemTime);
    setup(["/" + dateMessagesUser.username]);

    await screen.findByText(firstDateMessage);
    expect(screen.getByRole("main").children).toMatchSnapshot();
  });

  it("displays yesterday tags for yesterdays messages", async () => {
    vi.setSystemTime(mockedSystemTime);
    setup(["/" + yesterdaysMessagesUser.username]);

    await screen.findByText(firstYesterdaysDateMessage);
    expect(screen.getByRole("main").children).toMatchSnapshot();
  });

  it("displays today tags for todays messages", async () => {
    vi.setSystemTime(mockedSystemTime);
    setup(["/" + todaysMessagesUser.username]);

    await screen.findByText(firstTodaysDateMessage);
    expect(screen.getByRole("main").children).toMatchSnapshot();
  });

  it("back button goes to last url not dashboard", async () => {
    vi.spyOn(window.history, "length", "get").mockReturnValueOnce(2);
    const { user } = setup(["/" + firstTestUser.username, "/settings"], 1);

    await user.click(
      await screen.findByRole("button", { name: "Back button" })
    );

    expect(
      await screen.findByRole("heading", { name: firstTestUser.username })
    ).toBeInTheDocument();
  });
});
