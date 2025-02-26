import { expect, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import OptionsButton from "../OptionsButton";
import { userEvent } from "@testing-library/user-event";
import { useLocation, MemoryRouter } from "react-router-dom";

function TestingComponent() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <>
      <div data-testid={"path"}>{path}</div>
      <div data-testid={"outside"}>Outside Element</div>
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

const setup = () => {
  render(<OptionsButton />, { wrapper: HistoryWrapper });
  const user = userEvent.setup();

  return { user };
};

const setupOpen = async () => {
  const { user } = setup();
  await user.click(screen.getByRole("link", { name: "Options button" }));

  return { user };
};

describe("<OptionsButton />", () => {
  setup();
  it("renders", () => {
    expect(
      screen.getByRole("link", { name: "Options button" })
    ).toMatchSnapshot();
  });

  it("renders actions on button click", async () => {
    await setupOpen();

    expect(screen.getByLabelText("Option actions")).toMatchSnapshot();
  });

  it("navigates to settings after clicking on Settings option", async () => {
    const { user } = await setupOpen();
    await user.click(screen.getByRole("link", { name: "Settings" }));

    expect(screen.getByTestId("path").textContent).toBe("/settings");
  });

  it("navigates to logout after clicking on Log Out option", async () => {
    const { user } = await setupOpen();
    await user.click(screen.getByRole("link", { name: "Log Out" }));

    expect(screen.getByTestId("path").textContent).toBe("/logout");
  });

  it("closes on click outside dropdown div", async () => {
    const { user } = await setupOpen();
    await user.click(screen.getByText("Outside Element"));

    expect(screen.queryByLabelText("Option actions")).not.toBeInTheDocument();
  });

  it("closes options menu on lost focus", async () => {
    const { user } = await setupOpen();
    await user.tab();
    await user.tab();
    await user.tab();

    expect(screen.queryByLabelText("Option actions")).not.toBeInTheDocument();
  });
});
