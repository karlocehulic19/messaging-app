import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Settings from "../Settings.jsx";
import { MemoryRouter, useLocation } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AuthProvider from "../../contexts/AuthProvider.jsx";
import * as customFetch from "../../utils/customFetch.js";
import { server } from "../../mocks/node.js";
import { http, HttpResponse } from "msw";
import { config } from "../../Constants.jsx";
import { defaultTestUser } from "../../mocks/handlers.js";

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

  const updateButton = screen.getByRole("button");
  const usernameInput = screen.getByRole("textbox", { name: "Username input" });
  const emailInput = screen.getByRole("textbox", { name: "Email input" });

  return { user, updateButton, usernameInput, emailInput, customFetchSpy };
};

describe("<Settings>", () => {
  it("redirect to dashboard when back button is pressed", async () => {
    const { user } = await setup();
    await user.click(screen.getByRole("link"));
    expect(screen.getByTestId("path").textContent).toBe("/");
  });

  it("changes users username on right username", async () => {
    const { user, updateButton, usernameInput, customFetchSpy } = await setup();

    await user.click(usernameInput);

    expect(usernameInput.value).toBe("someUsername");
    await user.keyboard(
      "{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}Other"
    );
    await user.click(updateButton);
    await waitFor(() => {
      expect(customFetchSpy).toBeCalledWith("/users/update", {
        method: "PUT",
        headers: {
          Authorization: "Bearer randomJWTtoken",
        },
        body: {
          senderUsername: "someUsername",
          newUsername: "someOtherUsername",
        },
      });
    });
  });

  it("changes users email on valid email", async () => {
    const { user, updateButton, emailInput } = await setup();
    const customFetchSpy = vi.spyOn(customFetch, "default");

    waitFor(() => expect(emailInput.value).toBe("someemail@some.com"));
    await user.click(emailInput);
    await user.keyboard("{Backspace}{Backspace}{Backspace}net");
    await user.click(updateButton);

    await waitFor(() =>
      expect(customFetchSpy).toBeCalledWith("/users/update", {
        method: "PUT",
        headers: {
          Authorization: "Bearer randomJWTtoken",
        },
        body: {
          senderUsername: "someUsername",
          newEmail: "someemail@some.net",
        },
      })
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
});
