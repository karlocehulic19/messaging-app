import { render, screen } from "@testing-library/react";
import AuthProvider from "../AuthProvider";
import { describe, test, expect, vitest, afterEach } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import { MemoryRouter } from "react-router-dom";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { server } from "../../mocks/node";
import { http, HttpResponse } from "msw";
import { config } from "../../Constants";

const mockedNavigate = vitest.fn();

vitest.mock("react-router-dom", async (originalImport) => {
  return {
    ...(await originalImport()),
    useNavigate: () => mockedNavigate,
  };
});

afterEach(() => {
  vitest.clearAllMocks();
});

// eslint-disable-next-line react/prop-types
const ChildComponent = ({ username, password }) => {
  // In login should (username and password) be states but for easier testing are props here
  const { user, token, loginAction, logout } = useAuth();
  const [loginReturn, setLoginReturn] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  async function handleLoginAction() {
    try {
      setLoginReturn(await loginAction(username, password));
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  function handleLogout() {
    logout();
  }

  return (
    <>
      <p data-testid={"user"}>{JSON.stringify(user)}</p>
      <p data-testid={"token"}>{JSON.stringify(token)}</p>
      <p data-testid={"login-return"}>{JSON.stringify(loginReturn)}</p>
      <p data-testid={"login-error"}>{errorMessage}</p>
      <button data-testid={"login-button"} onClick={handleLoginAction}></button>
      <button data-testid={"logout-button"} onClick={handleLogout}></button>
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

  test("login creates token on 200", async () => {
    render(
      <TestingComponent username="someUsername" password="somePassword" />
    );

    const user = userEvent.setup();

    await user.click(screen.getByTestId("login-button"));

    expect(JSON.parse(screen.getByTestId("token").textContent)).toBe(
      "randomJWTtoken"
    );
  });

  test("login creates user on 200", async () => {
    render(
      <TestingComponent username="someUsername" password="somePassword" />
    );

    const user = userEvent.setup();

    await user.click(screen.getByTestId("login-button"));

    expect(JSON.parse(screen.getByTestId("user").textContent)).toEqual({
      firsName: "Some",
      lastName: "Random",
      username: "someUsername",
      password: "somePassword",
      email: "someemail@some.com",
      photoPublicId: null,
      id: "someUUID",
    });
  });

  test("login returns messages on 401", async () => {
    render(
      <TestingComponent username="notInDbUsername" password="notInDbPassword" />
    );

    const user = userEvent.setup();

    await user.click(screen.getByTestId("login-button"));

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

    await user.click(screen.getByTestId("login-button"));

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

    await user.click(screen.getByTestId("login-button"));

    expect(screen.getByTestId("login-error").textContent).toBe(
      "Failed to fetch"
    );
  });

  test("login stores token in localStorage", async () => {
    const spy = vitest.spyOn(Storage.prototype, "setItem");

    render(
      <TestingComponent username="someUsername" password="somePassword" />
    );

    const user = userEvent.setup();

    await user.click(screen.getByTestId("login-button"));

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith("site", "Bearer randomJWTtoken");
  });

  test("logout sets states to initial values if logged", async () => {
    const spyStorage = vitest.spyOn(Storage.prototype, "removeItem");

    render(
      <TestingComponent username="someUsername" password="somePassword" />
    );

    const user = userEvent.setup();

    await user.click(screen.getByTestId("login-button"));

    await user.click(screen.getByTestId("logout-button"));

    expect(JSON.parse(screen.getByTestId("token").textContent)).toBe("");
    expect(JSON.parse(screen.getByTestId("user").textContent)).toBe(null);
    expect(spyStorage).toBeCalledTimes(1);
    expect(spyStorage).toBeCalledWith("site");
    expect(mockedNavigate).toBeCalledTimes(1);
    expect(mockedNavigate).toBeCalledWith("/login");
  });

  test("logout if user us not logged", async () => {
    const spyStorage = vitest.spyOn(Storage.prototype, "removeItem");

    render(<TestingComponent />);

    const user = userEvent.setup();

    await user.click(screen.getByTestId("logout-button"));

    expect(JSON.parse(screen.getByTestId("token").textContent)).toBe("");
    expect(JSON.parse(screen.getByTestId("user").textContent)).toBe(null);
    expect(spyStorage).toBeCalledTimes(1);
    expect(spyStorage).toBeCalledWith("site");
    expect(mockedNavigate).toBeCalledTimes(1);
    expect(mockedNavigate).toBeCalledWith("/login");
  });

  test("token being inserted from local storage if not provided (user logs in different session)", () => {
    global.localStorage = {
      getItem: (item) => {
        if (item == "site") return "mockedToken";
        throw new Error("Item not stored(probably typo)");
      },
    };

    render(<TestingComponent />);
    expect(JSON.parse(screen.getByTestId("token").textContent)).toBe(
      "mockedToken"
    );
  });
});
