import { MemoryRouter } from "react-router-dom";
import App from "../../App";
import { render, screen } from "@testing-library/react";
import "../../mocks/URL";
import { vi } from "vitest";

describe("<Main />", () => {
  it("displays selection text when no username is specified in url", () => {
    localStorage.setItem("site", "randomJWTtoken");
    render(
      <App
        routerRender={(children) => <MemoryRouter>{children}</MemoryRouter>}
      />
    );
    expect(
      screen.getByRole("heading", {
        name: "Select user to message in the search bar",
      })
    ).toBeInTheDocument();
  });

  it("displays messaging interface when correct username is displayed", async () => {
    localStorage.setItem("site", "randomJWTtoken");
    render(
      <App
        routerRender={(children) => (
          <MemoryRouter initialEntries={["/Test"]}>{children}</MemoryRouter>
        )}
      />
    );

    expect(
      await screen.findByRole("heading", { name: "Test" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: "Select user to message in the search bar",
      })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Message input" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send button" })
    ).toBeInTheDocument();

    const receiverProfilePic = await screen.findByRole("img", {
      name: "Test's profile picture",
    });
    expect(receiverProfilePic.src).toMatchSnapshot();
  });

  it("displays default profile picture on users without one", async () => {
    localStorage.setItem("site", "randomJWTtoken");
    vi.spyOn(console, "error").mockImplementationOnce(() => undefined);
    render(
      <App
        routerRender={(children) => (
          <MemoryRouter initialEntries={["/Test2"]}>{children}</MemoryRouter>
        )}
      />
    );
    const receiverProfilePic = await screen.findByRole("img", {
      name: "Test2's profile picture",
    });

    expect(receiverProfilePic.src).toMatchSnapshot();
  });

  it("displays selection text when receiver isn't real user", async () => {
    localStorage.setItem("site", "randomJWTtoken");
    render(
      <App
        routerRender={(children) => (
          <MemoryRouter initialEntries={["/notInDb"]}>{children}</MemoryRouter>
        )}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Select user to message in the search bar",
      })
    ).toBeInTheDocument();
  });
});
