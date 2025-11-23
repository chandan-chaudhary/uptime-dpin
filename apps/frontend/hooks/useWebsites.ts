import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { WebsiteTick } from "@repo/db";

export interface WebsiteData {
  id: string;
  url: string;
  userId: string;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  ticks: (WebsiteTick & {
    validator: {
      location: string;
    };
  })[];
  _count: {
    ticks: number;
  };
}

export interface CreateWebsiteInput {
  url: string;
}

export function useWebsites() {
  const [websites, setWebsites] = useState<WebsiteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchWebsites = useCallback(async () => {
    try {
      setLoading(true);

      const websitesRes = await axios.get("/api/websites");

      if (
        websitesRes.status === 200 &&
        websitesRes.data &&
        websitesRes.data.websites.length > 0
      ) {
        setWebsites(websitesRes.data.websites);
        setError(null);
      } else {
        setWebsites([]);
        setError(null);
      }
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : err instanceof Error
            ? err.message
            : "Failed to load websites";
      setError(errorMessage);
      console.error("Error fetching websites:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createWebsite = async (data: CreateWebsiteInput) => {
    setCreateLoading(true);
    setCreateError(null);

    try {
      const response = await axios.post("/api/websites", data);
      // Refetch websites after successful creation
      await fetchWebsites();
      return response.data;
    } catch (err) {
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Failed to add website";
      setCreateError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();

    // Refresh every 1 minute
    const interval = setInterval(() => {
      fetchWebsites();
    }, 60 * 1000); // 60 seconds

    return () => clearInterval(interval);
  }, [fetchWebsites]);

  return {
    websites,
    loading,
    error,
    refetch: fetchWebsites,
    createWebsite,
    createLoading,
    createError,
  };
}
