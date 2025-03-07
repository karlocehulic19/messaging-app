import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, getByTestId } from "@testing-library/react";
import Settings from "../Settings.jsx";
import { MemoryRouter, useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AuthProvider from "../../contexts/AuthProvider.jsx";
import * as customFetch from "../../utils/customFetch.js";
import { server } from "../../mocks/node.js";
import { http, HttpResponse } from "msw";
import { config } from "../../Constants.jsx";
import { defaultTestUser, defaultPicBuffer } from "../../mocks/handlers.js";
import { Jimp } from "jimp";
import { objectURL, createObjectURlSpy } from "../../mocks/URL.js";
import { Blob } from "node:buffer";

function TestingComponent() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      <div data-testid={"path"}>{path}</div>
    </>
  );
}

// eslint-disable-next-line react/prop-types
function HistoryWrapper({ children }) {
  return (
    <MemoryRouter initialEntries={["/settings"]}>
      <AuthProvider>
        <TestingComponent />
        {children}
      </AuthProvider>
    </MemoryRouter>
  );
}

const setup = async () => {
  const user = userEvent.setup();
  localStorage.setItem("site", "randomJWTtoken");
  render(<Settings />, { wrapper: HistoryWrapper });

  const customFetchSpy = vi.spyOn(customFetch, "default");

  const updateButton = screen.getByRole("button", { name: "Update" });
  const usernameInput = screen.getByRole("textbox", { name: "Username input" });
  const emailInput = screen.getByRole("textbox", { name: "Email input" });
  const defaultFetchArguments = (body) => [
    "/users/update",
    {
      method: "PUT",
      headers: {
        Authorization: "Bearer randomJWTtoken",
      },
      body: JSON.stringify(body),
    },
  ];

  return {
    user,
    updateButton,
    usernameInput,
    emailInput,
    customFetchSpy,
    defaultFetchArguments,
  };
};

describe("<Settings>", () => {
  it("redirect to dashboard when back button is pressed", async () => {
    const { user } = await setup();
    await user.click(screen.getByRole("link"));
    expect(screen.getByTestId("path").textContent).toBe("/");
  });

  it("changes users username on right username", async () => {
    const {
      user,
      updateButton,
      usernameInput,
      customFetchSpy,
      defaultFetchArguments,
    } = await setup();

    await user.click(usernameInput);

    expect(usernameInput.value).toBe("someUsername");
    await user.keyboard(
      "{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}Other"
    );
    await user.click(updateButton);
    await waitFor(() => {
      expect(customFetchSpy).toBeCalledWith(
        ...defaultFetchArguments({
          senderUsername: "someUsername",
          newUsername: "someOtherUsername",
        })
      );
    });
  });

  it("changes users email on valid email", async () => {
    const { user, updateButton, emailInput, defaultFetchArguments } =
      await setup();
    const customFetchSpy = vi.spyOn(customFetch, "default");

    waitFor(() => expect(emailInput.value).toBe("someemail@some.com"));
    await user.click(emailInput);
    await user.keyboard("{Backspace}{Backspace}{Backspace}net");
    await user.click(updateButton);

    await waitFor(() =>
      expect(customFetchSpy).toBeCalledWith(
        ...defaultFetchArguments({
          senderUsername: "someUsername",
          newEmail: "someemail@some.net",
        })
      )
    );
  });

  it("updates user values after validation fetches user info", async () => {
    let promiseResolver;
    server.use(
      http.post(
        `${config.url.BACKEND_URL}/validate`,
        () =>
          new Promise((resolve) => {
            promiseResolver = resolve;
          })
      )
    );

    const { usernameInput, emailInput } = await setup();

    expect(usernameInput.value).toBe("Loading...");
    expect(emailInput.value).toBe("Loading...");

    promiseResolver(HttpResponse.json({ user: { ...defaultTestUser } }));

    await waitFor(() =>
      expect(usernameInput).toHaveValue(defaultTestUser.username)
    );
    expect(emailInput).toHaveValue(defaultTestUser.email);
    expect(screen.getByText(defaultTestUser.firstName)).toBeInTheDocument();
    expect(screen.getByText(defaultTestUser.lastName)).toBeInTheDocument();
  });

  it("updates user profile picture correctly", async () => {
    const { user, customFetchSpy, updateButton, defaultFetchArguments } =
      await setup();
    const newProfPic = new Jimp({ width: 400, height: 400 }, "#FFFFFF");

    const profPicFile = new File(
      [await newProfPic.getBuffer("image/jpeg")],
      "newProfPic.jpg",
      { type: "image/jpeg" }
    );

    const dropboxInput = getByTestId(
      screen.getByRole("presentation"),
      "picture-input"
    );
    await user.upload(dropboxInput, profPicFile);
    await user.click(updateButton);

    await waitFor(async () =>
      expect(customFetchSpy).toBeCalledWith(
        ...defaultFetchArguments({
          senderUsername: "someUsername",
          newPictureBase64: await newProfPic
            .resize({ w: 200, h: 200 })
            .getBase64("image/jpeg"),
        })
      )
    );
  });

  it("displays current default profile picture", async () => {
    await setup();
    const defaultImgBlob = new Blob([await defaultPicBuffer]);
    expect(await screen.findByRole("img")).toHaveAttribute("src", objectURL);
    expect(createObjectURlSpy).toBeCalledWith(defaultImgBlob);
  });

  it("renders logout button", async () => {
    await setup();
    expect(
      screen.queryByRole("button", { name: "Log Out" })
    ).toBeInTheDocument();
  });
});
