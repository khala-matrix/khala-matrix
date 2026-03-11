import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders AI domain hot topics content", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", { name: /ai domain hot topics/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/multi-agent orchestration/i)).toBeInTheDocument();
    expect(screen.getByText(/data source:/i)).toBeInTheDocument();
  });
});
