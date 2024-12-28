import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePictureSelector from "../ProfilePictureSelector";

const mockedPNGFile = new File(["test"], "test.png", { type: "image/png" });
const mockedJPEGFile = new File(["test"], "test.jpeg", { type: "image/jpeg" });
const mockedInvalidFile = new File(["test"], "test.txt", {
  type: "application/json",
});

const setup = () => {
  render(<ProfilePictureSelector />);

  return { user: userEvent.setup() };
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
    render(<ProfilePictureSelector />);
    const user = userEvent.setup({ applyAccept: false });

    await user.upload(screen.getByTestId("picture-input"), mockedInvalidFile);

    expect(
      screen.getByText("Please select image that is in PNG or JPEG format")
    ).toBeInTheDocument();
  });

  it("doesn't displays error message on PNG file type", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProfilePictureSelector />);

    await user.upload(screen.getByTestId("picture-input"), mockedPNGFile);

    expect(
      screen.queryByText("Please select image that is in PNG or JPEG format")
    ).toBeNull();
  });

  it("doesn't displays error message on JPEG file type", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<ProfilePictureSelector />);

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
});
