import { describe, expect, vi } from "vitest";
import { screen, render, waitFor, cleanup } from "@testing-library/react";
import SearchCard from "../SearchCard";
import { server } from "../../mocks/node";
import { profPic1Buffer } from "../../mocks/handlers";
import userEvent from "@testing-library/user-event";
import * as customFetch from "../../utils/customFetch";
import { config } from "../../Constants";
import { http, HttpResponse } from "msw";
import { useRef } from "react";

server.listen();

const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    useNavigate: () => mockedNavigate,
  };
});

global.URL.createObjectURL = vi.fn(() => {
  return "mockedDataURL";
});

// eslint-disable-next-line react/prop-types
const MockedSearchBar = ({ username }) => {
  const searchBarRef = useRef();

  return (
    <>
      <input ref={searchBarRef} type="text" name="searchbar" id="searchbar" />
      <SearchCard username={username} searchBarRef={searchBarRef} />
    </>
  );
};

const setup = (username) => {
  render(<MockedSearchBar username={username} />);
};

describe("<SearchCard />", () => {
  it("renders correctly", async () => {
    setup("Test");

    await waitFor(() => {
      expect(global.URL.createObjectURL).toBeCalledTimes(1);
    });

    const callBuffer =
      await global.URL.createObjectURL.mock.calls[0][0].arrayBuffer();
    const expectedUnit8 = new Uint8Array(await profPic1Buffer);
    const receivedUnit8 = new Uint8Array(callBuffer);
    expect(receivedUnit8).toEqual(expectedUnit8);

    expect(screen.getByLabelText("Test user")).toMatchSnapshot();
  });

  it("renders default profile page on no profile picture", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    setup("NoPictureTest");

    await waitFor(() => expect(screen.getByRole("img").src).toBeDefined());

    expect(screen.getByLabelText("NoPictureTest user")).toMatchSnapshot();
  });

  it("eedirects to messaging the user after click", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    setup("Test");
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Test user"));

    expect(mockedNavigate).toBeCalledWith("/Test");
    cleanup();
    vi.clearAllMocks();

    setup("Test2");

    await user.click(screen.getByLabelText("Test2 user"));

    expect(mockedNavigate).toBeCalledWith("/Test2");
  });

  it("renders default profile picture before fetch is resolved", async () => {
    setup("Test");
    const customFetchSpy = vi.spyOn(customFetch, "default");

    expect(screen.getByLabelText("Test user")).toMatchSnapshot();
    expect(customFetchSpy).not.toBeCalled();
  });

  it("renders default profile picture if request failed", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    const customFetchSpy = vi.spyOn(customFetch, "default");
    server.use(
      http.get(
        `${config.url.BACKEND_URL}/users/profile-picture/:username`,
        () => {
          return HttpResponse.error();
        }
      )
    );

    setup("Test");

    expect(customFetchSpy).toHaveBeenCalledWith(`/users/profile-picture/Test`);
    await expect(
      customFetchSpy.mock.results[0].value
    ).rejects.toMatchSnapshot();
    expect(screen.getByLabelText("Test user")).toMatchSnapshot();
  });
});
