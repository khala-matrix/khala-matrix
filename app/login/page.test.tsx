import { render, screen } from "@testing-library/react";
import LoginPage from "./page";

describe("Login page", () => {
  it("renders analyst sign in actions", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /access daily ai domain intelligence/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue to dashboard/i }),
    ).toBeInTheDocument();
  });
});
