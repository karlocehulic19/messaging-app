import { describe, expect, vi } from "vitest";
import { screen, render, waitFor, cleanup } from "@testing-library/react";
import SearchCard from "../SearchCard";
import { server } from "../../mocks/node";
import { profPic1Buffer } from "../../mocks/handlers";
import userEvent from "@testing-library/user-event";
import * as customFetch from "../../utils/customFetch";
import { config } from "../../Constants";
import { http, HttpResponse } from "msw";

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

describe("<SearchCard />", () => {
  it("renders correctly", async () => {
    render(<SearchCard username="Test" />);

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
    render(<SearchCard username="NoPictureTest" />);

    await waitFor(() => expect(screen.getByRole("img").src).toBeDefined());

    expect(screen.getByLabelText("NoPictureTest user")).toMatchSnapshot();
  });

  it("redirects to messaging the user after click", async () => {
    render(<SearchCard username="Test" />);
    const user = userEvent.setup();

    await user.click(screen.getByLabelText("Test user"));

    expect(mockedNavigate).toBeCalledWith("/Test");
    cleanup();
    vi.clearAllMocks();

    render(<SearchCard username="Test2" />);

    await user.click(screen.getByLabelText("Test2 user"));

    expect(mockedNavigate).toBeCalledWith("/Test2");
  });

  it("renders default profile picture before fetch is resolved", async () => {
    render(<SearchCard username="Test" />);
    const customFetchSpy = vi.spyOn(customFetch, "default");

    expect(screen.getByLabelText("Test user")).toMatchSnapshot();
    expect(customFetchSpy).not.toBeCalled();
  });

  it("renders default profile picture if request failed", async () => {
    const customFetchSpy = vi.spyOn(customFetch, "default");
    server.use(
      http.get(
        `${config.url.BACKEND_URL}/users/profile-picture/:username`,
        () => {
          return HttpResponse.error();
        }
      )
    );

    render(<SearchCard username="Test" />);

    expect(customFetchSpy).toHaveBeenCalledWith(`/users/profile-picture/Test`);
    await expect(
      customFetchSpy.mock.results[0].value
    ).rejects.toMatchSnapshot();
    expect(screen.getByLabelText("Test user")).toMatchSnapshot();
  });
});
