import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePictureSelector from "../ProfilePictureSelector";
import "../../mocks/URL";
import { expect } from "vitest";

const mockedPNGFile = new File(["test"], "test.png", { type: "image/png" });
const mockedJPEGFile = new File(["test"], "test.jpeg", { type: "image/jpeg" });
const mockedInvalidFile = new File(["test"], "test.txt", {
  type: "application/json",
});

const setup = (userEventOptions = { applyAccept: false }) => {
  const mockedFormatter = vi.fn(() => "mockBase64");
  render(<ProfilePictureSelector imageFormatter={mockedFormatter} />);

  return { user: userEvent.setup(userEventOptions), mockedFormatter };
};

const setupInvalidFile = async () => {
  const { user } = setup();

  await user.upload(screen.getByTestId("picture-input"), mockedInvalidFile);

  return { user };
};

const setupValidFile = async () => {
  const { user } = setup();

  await user.upload(screen.getByTestId("picture-input"), mockedPNGFile);

  return { user };
};

describe("<ProfilePictureSelector />", () => {
  it("displays error message on invalid file type", async () => {
    const { user } = setup();

    await user.upload(screen.getByTestId("picture-input"), mockedInvalidFile);

    expect(
      screen.getByText("Please select image that is in PNG or JPEG format")
    ).toBeInTheDocument();
  });

  it("doesn't displays error message on PNG file type", async () => {
    const { user } = setup();

    await user.upload(screen.getByTestId("picture-input"), mockedPNGFile);

    expect(
      screen.queryByText("Please select image that is in PNG or JPEG format")
    ).toBeNull();
  });

  it("doesn't displays error message on JPEG file type", async () => {
    const { user } = setup();

    await user.upload(screen.getByTestId("picture-input"), mockedJPEGFile);

    expect(
      screen.queryByText("Please select image that is in PNG or JPEG format")
    ).toBeNull();
  });

  it("displays profile picture with right file type", async () => {
    await setupValidFile();

    expect(
      screen.getByLabelText("Profile picture demonstration")
    ).toMatchSnapshot();
  });

  it("doesn't display profile picture if non are selected", () => {
    setup();

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("uses demonstration styling when image is imported", async () => {
    await setupValidFile();

    expect(screen.getByTestId("profile-picture-container")).toMatchSnapshot();
  });

  it("doesn't use demonstration styling when image isn't imported", async () => {
    await setupInvalidFile();

    expect(screen.getByTestId("profile-picture-container")).toMatchSnapshot();

    cleanup();

    setup();

    expect(screen.getByTestId("profile-picture-container")).toMatchSnapshot();
  });

  it("doesn't remove profile image after invalid picture selection", async () => {
    const { user } = await setupValidFile();

    await user.upload(screen.getByTestId("picture-input"), mockedInvalidFile);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("removes profile image after clicking on remove button", async () => {
    const { user } = await setupValidFile();

    await user.click(screen.getByText("Remove Picture"));

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
