import { describe, expect, it, vi } from "vitest";
import {
  render,
  screen,
  waitFor,
  getByTestId,
  queryByText,
  cleanup,
} from "@testing-library/react";
import Settings from "../Settings.jsx";
import { MemoryRouter, useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AuthProvider from "../../contexts/AuthProvider.jsx";
import * as customFetch from "../../utils/customFetch.js";
import { server } from "../../mocks/node.js";
import { delay, http, HttpResponse } from "msw";
import { config } from "../../Constants.jsx";
import {
  defaultTestUser,
  defaultPicBuffer,
  secondTestUserBearer,
  defaultTestUserToken,
  secondTestUserToken,
} from "../../mocks/handlers.js";
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

const setupNonFetched = (defaultToken = defaultTestUserToken) => {
  const user = userEvent.setup();
  localStorage.setItem("site", defaultToken);
  render(<Settings />, { wrapper: HistoryWrapper });

  const customFetchSpy = vi.spyOn(customFetch, "default");

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
    customFetchSpy,
    usernameInput,
    emailInput,
    defaultFetchArguments,
  };
};

const setup = async () => {
  const utils = setupNonFetched();

  const updateButton = await screen.findByRole("button", { name: "Update" });

  return {
    ...utils,
    updateButton,
  };
};

const setupImg = async () => {
  const utils = await setup();

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

  return { ...utils, newProfPic, profPicFile, dropboxInput };
};

const setupChanged = async () => {
  const { user, usernameInput, emailInput, ...utils } = await setup();
  await user.click(usernameInput);
  await user.keyboard("changed");

  await user.click(emailInput);
  await user.keyboard("changed");

  return { user, usernameInput, emailInput, ...utils };
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

    await waitFor(() => expect(emailInput.value).toBe("someemail@some.com"));
    await user.click(emailInput);
    await user.keyboard("{Backspace}{Backspace}{Backspace}net");
    expect(updateButton).toBeEnabled();
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
    const validationPromise = new Promise((resolve) => {
      promiseResolver = resolve;
    });
    server.use(
      http.post(`${config.url.BACKEND_URL}/validate`, () => validationPromise)
    );

    const { usernameInput, emailInput } = setupNonFetched();

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

  it("updates user profile picture", async () => {
    const {
      user,
      customFetchSpy,
      updateButton,
      defaultFetchArguments,
      newProfPic,
      profPicFile,
      dropboxInput,
    } = await setupImg();
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

  it("should disable update button if none of the values change", async () => {
    const { updateButton } = await setup();
    expect(updateButton).toBeDisabled();
  });

  it("removes newly inserted picture", async () => {
    const { user, profPicFile, dropboxInput } = await setupImg();
    await user.upload(dropboxInput, profPicFile);

    await user.click(screen.getByRole("button", { name: "Remove Picture" }));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("disables and shows loading text on update button while fetching update", async () => {
    let promiseResolver;
    server.use(
      http.put(
        `${config.url.BACKEND_URL}/users/update`,
        () =>
          new Promise((resolve) => {
            promiseResolver = resolve;
          })
      )
    );
    const { user, updateButton } = await setupChanged();

    await user.click(updateButton);

    expect(updateButton).toHaveTextContent("Loading...");
    expect(updateButton).toBeDisabled();

    promiseResolver();

    await waitFor(() => expect(updateButton).toHaveTextContent("Update"));
  });

  it("displays error popup after failed update", async () => {
    const { user, updateButton } = await setupChanged();

    await user.click(updateButton);

    await waitFor(() =>
      expect(updateButton).not.toHaveTextContent("Loading...")
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    cleanup();

    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    const { user: user2, updateButton: updateButton2 } = await setupChanged();

    server.use(
      http.put(`${config.url.BACKEND_URL}/users/update`, () =>
        HttpResponse.error()
      )
    );

    await user2.click(updateButton2);

    await waitFor(() =>
      expect(updateButton2).not.toHaveTextContent("Loading...")
    );
    expect(screen.queryByRole("alert")).toBeInTheDocument();
  });

  it("disables update button after successful update", async () => {
    const { user, updateButton, customFetchSpy, defaultFetchArguments } =
      await setupChanged();

    await user.click(updateButton);

    await waitFor(() =>
      expect(customFetchSpy).toBeCalledWith(
        ...defaultFetchArguments({
          senderUsername: "someUsername",
          newUsername: defaultTestUser.username + "changed",
          newEmail: defaultTestUser.email + "changed",
        })
      )
    );

    expect(updateButton).toBeDisabled();
  });

  describe("validation", () => {
    it("validates username", async () => {
      const { user, usernameInput } = await setup();

      expect(
        screen.queryByLabelText("Username input error")
      ).not.toBeInTheDocument();

      await user.click(usernameInput);
      await user.keyboard(
        "{Backspace}".repeat(defaultTestUser.username.length)
      );

      const usernameValidation = screen.getByLabelText("Username input error");
      expect(usernameValidation).toHaveTextContent(
        "Username field is required"
      );

      // representing non ascii character
      await user.keyboard("ć");
      expect(usernameValidation).toHaveTextContent(
        "Invalid characters are provided"
      );
    });

    it("validates email", async () => {
      const { user, emailInput } = await setup();

      expect(
        screen.queryByLabelText("Email input error")
      ).not.toBeInTheDocument();

      await user.click(emailInput);
      await user.keyboard("{Backspace}".repeat(defaultTestUser.email.length));

      const emailValidationError = screen.getByLabelText("Email input error");

      expect(emailValidationError).toHaveTextContent("Email field is required");
      await user.keyboard("invalidEmail");

      expect(emailValidationError).toHaveTextContent(
        "Value provided must be valid email address"
      );
    });

    it("displays server side validation inside error popup", async () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      server.use(
        http.put(`${config.url.BACKEND_URL}/users/update`, () => {
          return HttpResponse.json(
            {
              error: {
                validation: [
                  {
                    field: "username",
                    message: "User with that username already exists",
                  },
                  {
                    field: "email",
                    message: "User with that email already exists",
                  },
                ],
              },
            },
            { status: 422 }
          );
        })
      );

      const { user, updateButton } = await setupChanged();

      await user.click(updateButton);
      const alertPopup = screen.getByRole("alert");

      expect(
        queryByText(alertPopup, "User with that username already exists")
      ).toBeInTheDocument();

      expect(
        queryByText(alertPopup, "User with that email already exists")
      ).toBeInTheDocument();
    });

    it("disables update button on when validation errors are present", async () => {
      const { updateButton, user, usernameInput, emailInput } = await setup();

      await user.click(usernameInput);
      await user.keyboard(
        "{Backspace}".repeat(defaultTestUser.username.length)
      );

      expect(updateButton).toBeDisabled();
      await user.keyboard("smth");

      await user.click(emailInput);
      await user.keyboard("{Backspace}".repeat(defaultTestUser.email.length));

      expect(updateButton).toBeDisabled();

      await user.keyboard("invalid");

      expect(updateButton).toBeDisabled();
    });

    it("doesn't show validation error on validation fetching", async () => {
      server.use(
        http.post(`${config.url.BACKEND_URL}/validate`, async () => {
          await delay("infinite");
        })
      );

      setupNonFetched();

      await expect(
        screen.findByLabelText("Email input error", {})
      ).rejects.toThrow(
        /Unable to find a label with the text of: Email input error/
      );
    });

    it("doesn't halt on loading button if user has no profile picture", async () => {
      localStorage.setItem("site", secondTestUserBearer);
      await setupNonFetched(secondTestUserToken);

      expect(await screen.findByText("Update")).toBeInTheDocument();
    });
  });
});
