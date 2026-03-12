import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "./page";
import { MOCK_HOT_TOPICS_PAGE_DATA } from "@/lib/hot-topics/mock-data";

const FILTERS_STORAGE_KEY = "hot-topics-filters";

function mockPageDataFetch() {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({
      ...MOCK_HOT_TOPICS_PAGE_DATA,
      generatedAt: "2026-03-12T00:00:00.000Z",
    }),
  } as Response);
}

async function renderHomePage() {
  const fetchMock = mockPageDataFetch();
  render(<Home />);

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
}

describe("Home page", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders AI domain hot topics content", async () => {
    await renderHomePage();

    expect(
      screen.getByRole("heading", { name: /ai domain hot topics/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/multi-agent orchestration/i)).toBeInTheDocument();
    expect(screen.getByText(/data source:/i)).toBeInTheDocument();
  });

  it("filters topics by category and search, then clears filters", async () => {
    await renderHomePage();

    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: "Policy & Compliance" },
    });
    expect(screen.getByText(/ai governance automation/i)).toBeInTheDocument();
    expect(screen.queryByText(/multi-agent orchestration/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: "governance" },
    });
    expect(screen.getByText(/ai governance automation/i)).toBeInTheDocument();
    expect(screen.queryByText(/on-device inference stacks/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(screen.getByText(/multi-agent orchestration/i)).toBeInTheDocument();
    expect(screen.getByText(/on-device inference stacks/i)).toBeInTheDocument();
  });

  it("restores filters from localStorage and persists updates", async () => {
    window.localStorage.setItem(
      FILTERS_STORAGE_KEY,
      JSON.stringify({
        category: "AI Infrastructure",
        search: "edge",
      }),
    );

    await renderHomePage();

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toHaveValue("AI Infrastructure");
      expect(screen.getByLabelText(/search/i)).toHaveValue("edge");
    });
    expect(screen.getByText(/on-device inference stacks/i)).toBeInTheDocument();
    expect(screen.queryByText(/multi-agent orchestration/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem(FILTERS_STORAGE_KEY)).toBe(
        JSON.stringify({
          category: "",
          search: "",
        }),
      );
    });
  });
});
