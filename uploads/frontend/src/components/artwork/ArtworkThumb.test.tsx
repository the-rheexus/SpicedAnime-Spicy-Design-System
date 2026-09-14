import { render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ArtworkScreen } from "@/components/artwork/ArtworkScreen";
import {
  getAllConfigurationComponents,
  getAllDesigns,
  getArtwork,
  getArtworkThumbnailBlob,
} from "@/lib/api";
import type { ArtworkAsset } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    getAllConfigurationComponents: vi.fn(),
    getAllDesigns: vi.fn(),
    getArtwork: vi.fn(),
    getArtworkThumbnailBlob: vi.fn(),
  };
});

const mockedGetArtwork = vi.mocked(getArtwork);
const mockedGetAllDesigns = vi.mocked(getAllDesigns);
const mockedGetAllConfigurationComponents = vi.mocked(getAllConfigurationComponents);
const mockedGetArtworkThumbnailBlob = vi.mocked(getArtworkThumbnailBlob);

function _asset(overrides: Partial<ArtworkAsset> = {}): ArtworkAsset {
  return {
    id: 1,
    design: 1,
    design_code: "KIDNARUTO",
    design_name: "Kid Naruto",
    component_code: "ASH",
    source_file_path: "SpicedAnime/artwork/Ashtray/KIDNARUTO.png",
    drive_file_id: "drive-file-1",
    drive_share_url: "https://drive.google.com/file/d/drive-file-1/view",
    status: "Available",
    created_at: "2026-08-13T00:00:00Z",
    updated_at: "2026-08-13T00:00:00Z",
    ...overrides,
  };
}

describe("Artwork Library thumbnail column", () => {
  beforeEach(() => {
    mockedGetArtwork.mockReset();
    mockedGetAllDesigns.mockReset();
    mockedGetAllConfigurationComponents.mockReset();
    mockedGetArtworkThumbnailBlob.mockReset();

    mockedGetAllDesigns.mockResolvedValue([]);
    mockedGetAllConfigurationComponents.mockResolvedValue([]);

    // jsdom does not implement the Blob object URL APIs.
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:mock-thumbnail-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("fetches the thumbnail through the authenticated proxy and renders it as an image", async () => {
    const asset = _asset();
    mockedGetArtwork.mockResolvedValue({ count: 1, next: null, previous: null, results: [asset] });
    mockedGetArtworkThumbnailBlob.mockResolvedValue(new Blob(["png-bytes"], { type: "image/png" }));

    render(<ArtworkScreen />);

    await waitFor(() => expect(mockedGetArtworkThumbnailBlob).toHaveBeenCalledWith(asset.id));

    const thumb = await screen.findByLabelText("KIDNARUTO ASH artwork thumbnail");
    await waitFor(() =>
      expect(thumb.style.backgroundImage).toBe('url("blob:mock-thumbnail-url")')
    );
    // The component-code fallback label only renders when there is no image.
    expect(within(thumb).queryByText("ASH")).not.toBeInTheDocument();
  });

  it("does not fetch a thumbnail for an asset with no Drive file", async () => {
    const asset = _asset({ drive_share_url: null, status: "Missing" });
    mockedGetArtwork.mockResolvedValue({ count: 1, next: null, previous: null, results: [asset] });

    render(<ArtworkScreen />);

    const thumb = await screen.findByLabelText("KIDNARUTO ASH artwork thumbnail");
    expect(mockedGetArtworkThumbnailBlob).not.toHaveBeenCalled();
    expect(within(thumb).getByText("ASH")).toBeInTheDocument();
  });

  it("falls back to the component-code label when the thumbnail fetch fails", async () => {
    const asset = _asset();
    mockedGetArtwork.mockResolvedValue({ count: 1, next: null, previous: null, results: [asset] });
    mockedGetArtworkThumbnailBlob.mockRejectedValue(new Error("network error"));

    render(<ArtworkScreen />);

    const thumb = await screen.findByLabelText("KIDNARUTO ASH artwork thumbnail");
    await waitFor(() => expect(mockedGetArtworkThumbnailBlob).toHaveBeenCalledWith(asset.id));
    await waitFor(() => expect(within(thumb).getByText("ASH")).toBeInTheDocument());
  });
});
