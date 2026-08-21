import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchData } from "@/lib/api";
import type { Guest } from "@/types";

export function useGuest() {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("to");

  const query = useQuery({
    queryKey: ["guest", slug],
    queryFn: () => fetchData<Guest>(`/guests/${slug}`),
    enabled: Boolean(slug),
    retry: false,
  });

  return {
    slug,
    guest: query.data ?? null,
    // Kalau slug tidak ada / tamu tidak ditemukan, pakai fallback
    guestName: query.data?.name ?? "Tamu Undangan",
    isLoading: Boolean(slug) && query.isLoading,
  };
}
