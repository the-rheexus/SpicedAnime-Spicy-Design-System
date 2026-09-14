import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ArtworkScreen } from "@/components/artwork/ArtworkScreen";
import {
  getAllConfigurationComponents,
  getAllDesigns,
  getArtwork,
  uploadArtwork,
} from "@/lib/api";

const push = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(currentSearchParams.toString()),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getAllConfigurationComponents: vi.fn(),
    getAllDesigns: vi.fn(),
    getArtwork: vi.fn(),
    uploadArtwork: vi.fn(),
  };
});

const mockedGetArtwork = vi.mocked(getArtwork);
const mockedGetAllDesigns = vi.mocked(getAllDesigns);
const mockedGetAllConfigurationComponents = vi.mocked(getAllConfigurationComponents);
const mockedUploadArtwork = vi.mocked(uploadArtwork);

function resetMocks() {
  mockedGetArtwork.mockReset();
  mockedGetAllDesigns.mockReset();
  mockedGetAllConfigurationComponents.mockReset();
  mockedUploadArtwork.mockReset();
  push.mockReset();
  currentSearchParams = new URLSearchParams();

  mockedGetArtwork.mockResolvedValue({
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 1,
        design: 1,
        design_code: "KIDNARUTO",
        design_name: "Kid Naruto",
        component_code: "ASH",
        source_file_path: "SpicedAnime/artwork/Ashtray/KIDNARUTO.png",
        drive_share_url: null,
        status: "Available",
        created_at: "2026-07-26T00:00:00Z",
        updated_at: "2026-07-26T00:00:00Z",
      },
    ],
  });
  mockedGetAllDesigns.mockResolvedValue([
    {
      id: 1,
      internal_design_id: "D000001",
      design_code: "KIDNARUTO",
      design_name: "Kid Naruto",
      is_active: true,
      created_at: "2026-07-26T00:00:00Z",
      updated_at: "2026-07-26T00:00:00Z",
    },
  ]);
  mockedGetAllConfigurationComponents.mockResolvedValue([
    {
      id: 1,
      family_code: "ASH",
      config_code: "SOLO",
      component_code: "ASH",
      quantity: 1,
      batch_group: "Ashtray",
      created_at: "2026-07-26T00:00:00Z",
      updated_at: "2026-07-26T00:00:00Z",
    },
  ]);
  mockedUploadArtwork.mockResolvedValue({
    id: 1,
    design: 1,
    design_code: "KIDNARUTO",
    design_name: "Kid Naruto",
    component_code: "ASH",
    source_file_path: "SpicedAnime/artwork/Ashtray/KIDNARUTO.png",
    drive_file_id: "test-drive-file",
    drive_share_url: null,
    status: "Available",
    created_at: "2026-07-26T00:00:00Z",
    updated_at: "2026-07-26T00:00:00Z",
  });
}

describe("ArtworkScreen upload contract", () => {
  beforeEach(resetMocks);

  it("shows all four required fields and submits the explicit originating family", async () => {
    render(<ArtworkScreen />);

    fireEvent.click(await screen.findByRole("button", { name: "Upload Artwork" }));

    const fileInput = screen.getByLabelText("Artwork File");
    expect(fileInput).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Design" })).toBeVisible();
    expect(screen.getByRole("combobox", { name: "Component" })).toBeVisible();
    const familySelect = screen.getByRole("combobox", { name: "Originating Family" });
    expect(familySelect).toBeVisible();

    fireEvent.change(fileInput, {
      target: { files: [new File(["png"], "artwork.png", { type: "image/png" })] },
    });
    fireEvent.change(familySelect, { target: { value: "ASH" } });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    await waitFor(() => expect(mockedUploadArtwork).toHaveBeenCalledTimes(1));
    const formData = mockedUploadArtwork.mock.calls[0][0];
    expect(formData.get("file")).toBeInstanceOf(File);
    expect(formData.get("design_code")).toBe("KIDNARUTO");
    expect(formData.get("component_code")).toBe("ASH");
    expect(formData.get("family_code")).toBe("ASH");
  });
});

describe("ArtworkScreen sorting", () => {
  beforeEach(resetMocks);

  it("exposes only Design and Updated sort controls while retaining artwork actions", async () => {
    render(<ArtworkScreen />);

    expect(await screen.findByRole("button", { name: /Sort Design: A to Z/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /Sort Updated: newest first/ })).toBeVisible();
    expect(screen.getByRole("button", { name: "Upload Artwork" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Revalidate Artwork" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /Sort Component/ })).not.toBeInTheDocument();
  });

  it("cycles Design and Updated ordering through the required URL state and resets pagination", async () => {
    currentSearchParams = new URLSearchParams("page=3");
    const { rerender } = render(<ArtworkScreen />);

    fireEvent.click(await screen.findByRole("button", { name: /Sort Design: A to Z/ }));
    expect(push).toHaveBeenLastCalledWith("/artwork?ordering=design_code");

    currentSearchParams = new URLSearchParams("ordering=design_code");
    rerender(<ArtworkScreen />);
    expect(screen.getByRole("button", { name: /Sort Design: A to Z.*Z to A/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Sort Design: A to Z.*Z to A/ }));
    expect(push).toHaveBeenLastCalledWith("/artwork?ordering=-design_code");

    currentSearchParams = new URLSearchParams("ordering=-updated_at&page=2");
    rerender(<ArtworkScreen />);
    expect(screen.getByRole("button", { name: /Sort Updated: newest first.*oldest first/ })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /Sort Updated: newest first.*oldest first/ }));
    expect(push).toHaveBeenLastCalledWith("/artwork?ordering=updated_at");
  });
});
