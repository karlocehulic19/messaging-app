import { render, screen } from "@testing-library/react";
import AuthProvider from "../AuthProvider";
import { describe, test, expect } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { MemoryRouter } from "react-router-dom";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { server } from "../../mocks/node";
import { http, HttpResponse } from "msw";
import { config } from "../../Constants";

const ChildComponent = ({ username, password }) => {
  const { user, token, loginAction, logout } = useAuth();
  const [loginReturn, setLoginReturn] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  async function handleLoginAction() {
    // In login should be states but for easier testing are props here username and password
    try {
      setLoginReturn(await loginAction(username, password));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }
  return (
    <>
      <p data-testid={"user"}>{JSON.stringify(user)}</p>
      <p data-testid={"token"}>{JSON.stringify(token)}</p>
      <p data-testid={"login-return"}>{JSON.stringify(loginReturn)}</p>
      <p data-testid={"login-error"}>{errorMessage}</p>
      <button data-testid={"loginAction"} onClick={handleLoginAction}></button>
    </>
  );
};

// eslint-disable-next-line react/prop-types
const TestingComponent = ({ username = "", password = "" }) => {
  return (
    <MemoryRouter>
      <AuthProvider>
        <ChildComponent username={username} password={password} />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("<AuthProvider></AuthProvider>", () => {
  test("initial values", () => {
    render(<TestingComponent />);

    expect(JSON.parse(screen.getByTestId("user").textContent)).toBe(null);
    expect(JSON.parse(screen.getByTestId("token").textContent)).toBe("");
  });

  test("login returns token on 200", async () => {
    render(
      <TestingComponent username="someUsername" password="somePassword" />
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));

    expect(JSON.parse(screen.getByTestId("token").textContent)).toBe(
      "randomJWTtoken"
    );
  });

  test("login returns messages on 401", async () => {
    render(
      <TestingComponent username="notInDbUsername" password="notInDbPassword" />
    );

    const user = userEvent.setup();

    await user.click(screen.getByRole("button"));

    expect(JSON.parse(screen.getByTestId("login-return").textContent)).toEqual([
      "Username or password is incorrect",
    ]);
  });

  test("login throws on anything other than 401 and 400", async () => {
    render(
      <TestingComponent username="notInDbUsername" password="notInDbPassword" />
    );

    const user = userEvent.setup();

    server.use(
      http.post(
        `${config.url.BACKEND_URL}/login`,
        () => new HttpResponse("Some error!", { status: 422 })
      )
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByTestId("login-error").textContent).toBe(
      `Error while fetching: ${config.url.BACKEND_URL}/login - 422: Some error!`
    );
  });

  test("login throws on internet error", async () => {
    render(
      <TestingComponent username="notInDbUsername" password="notInDbPassword" />
    );

    const user = userEvent.setup();

    server.use(
      http.post(`${config.url.BACKEND_URL}/login`, () => HttpResponse.error())
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByTestId("login-error").textContent).toBe(
      "Failed to fetch"
    );
  });
});
