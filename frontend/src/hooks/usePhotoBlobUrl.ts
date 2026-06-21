import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiClient } from "../services/apiClient";

export function photoFileApiPath(photoId: string): string {
  return `/photos/${photoId}/file`;
}

export function usePhotoBlobUrl(photoId: string | undefined, enabled = true) {
  const query = useQuery({
    queryKey: ["photo-blob", photoId],
    queryFn: async () => {
      const { data } = await apiClient.get<Blob>(photoFileApiPath(photoId!), {
        responseType: "blob",
      });
      return URL.createObjectURL(data);
    },
    enabled: Boolean(photoId) && enabled,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const url = query.data;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [query.data]);

  return query;
}
