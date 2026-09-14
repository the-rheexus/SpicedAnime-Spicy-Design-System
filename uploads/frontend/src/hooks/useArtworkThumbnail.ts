import { useEffect, useState } from "react";

import { getArtworkThumbnailBlob } from "@/lib/api";

interface ArtworkThumbnailState {
  failed: boolean;
  imageUrl: string | null;
  loading: boolean;
}

/**
 * Loads an artwork thumbnail through the session-authenticated backend proxy.
 * The returned object URL is owned by this hook and revoked when its asset is
 * replaced or its consumer unmounts.
 */
export function useArtworkThumbnail(assetId: number | string, enabled = true): ArtworkThumbnailState {
  const [state, setState] = useState<ArtworkThumbnailState>(() => ({
    failed: false,
    imageUrl: null,
    loading: enabled,
  }));

  useEffect(() => {
    if (!enabled) {
      setState({ failed: false, imageUrl: null, loading: false });
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;
    setState({ failed: false, imageUrl: null, loading: true });

    getArtworkThumbnailBlob(assetId)
      .then((blob) => {
        if (cancelled) return;
        if (blob.size === 0) {
          setState({ failed: true, imageUrl: null, loading: false });
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setState({ failed: false, imageUrl: objectUrl, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ failed: true, imageUrl: null, loading: false });
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [assetId, enabled]);

  return state;
}
