import { describe, expect, vi } from "vitest";
import { screen, render, waitFor, act, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "../SearchBar";
import { server } from "../../mocks/node";
import * as customFetch from "../../utils/customFetch";
import { MemoryRouter, useLocation } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { config } from "../../Constants";
import { oldMessagesUser, userGetHandler } from "../../mocks/handlers";

function getConsoleErrorSpy() {
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});

  return { consoleErrorSpy };
}

server.listen();
const searchHandler = (handler) =>
  http.get(`${config.url.BACKEND_URL}/users`, handler);

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
    <MemoryRouter>
      <TestingComponent />
      {children}
    </MemoryRouter>
  );
}

const setup = async () => {
  // wrapper is needed bcs im not mocking SearchCard child component
  render(<SearchBar />, { wrapper: HistoryWrapper });
  const user = userEvent.setup();
  const customFetchSpy = vi.spyOn(customFetch, "default");

  await user.click(screen.getByRole("searchbox"));

  return { user, customFetchSpy };
};

describe("<SearchBar />", () => {
  it("renders correctly", () => {
    render(<SearchBar />);
    expect(screen.getByRole("search")).toMatchSnapshot();
  });

  it("display possible search candidates", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { user, customFetchSpy } = await setup();
    await user.keyboard("T");

    await waitFor(() => expect(customFetchSpy).toBeCalledWith("/users?s=T"));

    const usersFetch = customFetchSpy.mock.calls.filter((call) =>
      call[0].includes("?s=")
    );

    expect(usersFetch.length).toBe(1);
    expect(screen.getByLabelText("Found users")).toMatchSnapshot();
    expect(screen.getByRole("search").className).toMatchSnapshot();
  });

  it("displays searching text before users are loaded", async () => {
    getConsoleErrorSpy();
    const { user, customFetchSpy } = await setup();

    let promiseResolver;

    const responseHandler = ({ request }) => {
      return new Promise((resolve) => {
        promiseResolver = (func) => resolve(func({ request }));
      });
    };

    server.use(searchHandler(responseHandler));

    await user.keyboard("T");

    await waitFor(() => expect(customFetchSpy).toBeCalledWith("/users?s=T"));

    expect(screen.getByLabelText("Found users")).toMatchSnapshot();
    expect(screen.getByRole("search").className).toMatchSnapshot();
    await act(async () => {
      promiseResolver(userGetHandler);
    });

    expect(screen.getByLabelText("Found users")).toMatchSnapshot();
    server.resetHandlers();
  });

  it("displays not found when no users are found", async () => {
    getConsoleErrorSpy();
    const { user, customFetchSpy } = await setup();
    await user.keyboard("not in database");

    await waitFor(() =>
      expect(customFetchSpy).toBeCalledWith("/users?s=not in database")
    );

    const foundUsersContainer = screen.getByLabelText("Found users");
    await waitFor(() => {
      expect(screen.getByText("No users found").parentElement).toBe(
        foundUsersContainer
      );
    });
    expect(screen.getByRole("search").className).toMatchSnapshot();
    expect(screen.queryByText("Searching")).not.toBeInTheDocument();
  });

  it("displays error message on wrong failed requests", async () => {
    getConsoleErrorSpy();
    server.use(
      http.get(`${config.url.BACKEND_URL}/users`, () => {
        return HttpResponse.error();
      })
    );

    const { user, customFetchSpy } = await setup();

    await user.keyboard("T");

    await waitFor(() => expect(customFetchSpy).toBeCalled());
    await expect(customFetchSpy.mock.results[0].value).rejects.toThrow(
      expect.anything()
    );
    expect(screen.getByLabelText("Found users")).toMatchSnapshot();
    expect(screen.getByRole("search").className).toMatchSnapshot();
  });

  it("removes SearchBar listings when searchbar isn't focused", async () => {
    getConsoleErrorSpy();
    const { user: user1 } = await setup();

    expect(screen.getByLabelText("Found users")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveFocus();
    await user1.tab();

    expect(screen.getByRole("searchbox")).not.toHaveFocus();
    expect(screen.queryByLabelText("Found users")).not.toBeInTheDocument();
    expect(screen.getByRole("search").className).toBeFalsy();

    cleanup();
    vi.clearAllMocks();

    // Needed since tests focus of only input element and is flaky when SearchCard is clicked
    const { user: user2, customFetchSpy: customFetchSpy2 } = await setup();

    expect(screen.getByLabelText("Found users")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveFocus();

    await user2.keyboard("T");

    await waitFor(() => expect(customFetchSpy2).toBeCalledWith("/users?s=T"));

    await user2.click(screen.getByLabelText("Test user"));

    expect(screen.getByTestId("path").textContent).toBe("/Test");
    expect(screen.queryByLabelText("Found users")).not.toBeInTheDocument();

    cleanup();
    vi.clearAllMocks();

    const { user: user3, customFetchSpy: customFetchSpy3 } = await setup();

    expect(screen.getByLabelText("Found users")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toHaveFocus();

    await user3.keyboard("T");

    await waitFor(() => expect(customFetchSpy3).toBeCalledWith("/users?s=T"));

    await user3.click(screen.getByRole("search"));

    expect(screen.getByLabelText("Found users")).toBeInTheDocument();
  });

  it("opens with defualt users on empty search", async () => {
    getConsoleErrorSpy();
    const { user } = await setup();

    user.click(screen.getByRole("searchbox"));

    expect(screen.getByText(oldMessagesUser.username)).toBeInTheDocument();
  });
});
