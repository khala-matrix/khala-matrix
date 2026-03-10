import { fireEvent, render, screen, within } from "@testing-library/react";
import DashboardPage from "./page";

describe("Dashboard page", () => {
  it("expands a node to show details", () => {
    render(<DashboardPage />);

    expect(screen.queryAllByText(/10\.10\.1\.4:51820/)).toHaveLength(0);

    fireEvent.click(screen.getByRole("button", { name: /alpha gateway/i }));

    expect(screen.getAllByText(/10\.10\.1\.4:51820/)).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /edit tag critical/i }),
    ).toBeInTheDocument();
  });

  it("registers a node and supports rename + tag CRUD", () => {
    render(<DashboardPage />);

    const registerForm = screen.getByRole("form", { name: /register node form/i });
    const scopedRegister = within(registerForm);

    fireEvent.change(scopedRegister.getByLabelText(/node name/i), {
      target: { value: "Delta Relay" },
    });
    fireEvent.change(scopedRegister.getByLabelText(/endpoint/i), {
      target: { value: "10.10.33.19:51820" },
    });
    fireEvent.change(scopedRegister.getByLabelText(/region/i), {
      target: { value: "Sydney" },
    });
    fireEvent.click(scopedRegister.getByRole("button", { name: /register node/i }));

    const deltaButton = screen.getByRole("button", { name: /delta relay/i });
    expect(deltaButton).toBeInTheDocument();

    const renameForm = screen.getByRole("form", { name: /rename node form/i });
    fireEvent.change(within(renameForm).getByLabelText(/edit node name/i), {
      target: { value: "Delta Core" },
    });
    fireEvent.click(within(renameForm).getByRole("button", { name: /save name/i }));

    expect(screen.getByRole("button", { name: /delta core/i })).toBeInTheDocument();

    const addTagForm = screen.getByRole("form", { name: /add tag form/i });
    fireEvent.change(within(addTagForm).getByLabelText(/new tag/i), {
      target: { value: "kha8-temp" },
    });
    fireEvent.click(within(addTagForm).getByRole("button", { name: /add tag/i }));
    expect(screen.getAllByText("kha8-temp")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /edit tag kha8-temp/i }));
    fireEvent.change(screen.getByLabelText(/edit tag value/i), {
      target: { value: "kha8-prod" },
    });
    fireEvent.click(screen.getByRole("button", { name: /save tag/i }));

    expect(screen.getAllByText("kha8-prod")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: /delete tag kha8-prod/i }));
    expect(screen.queryAllByText("kha8-prod")).toHaveLength(0);
  });
});
