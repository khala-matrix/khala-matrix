import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

describe("Dashboard page", () => {
  it("renders topic table using shared payload", async () => {
    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { name: /topic intelligence dashboard/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /heat score/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/multimodal foundation models/i)).toBeInTheDocument();
    expect(screen.getByText(/model context protocol standardization progress/i)).toBeInTheDocument();
  });
});
