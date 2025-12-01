"use client";

import { useState, useEffect } from "react";
import type { SubscriptionStatus } from "@/app/api/subscription/status/route";

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch("/api/subscription/status");
        if (!response.ok) {
          throw new Error("Failed to fetch subscription status");
        }
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  return { subscription, loading, error };
}
