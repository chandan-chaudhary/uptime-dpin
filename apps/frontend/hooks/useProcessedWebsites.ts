import { useMemo } from "react";
import type { WebsiteTick } from "@repo/db";

type UpTimeStatus = "Good" | "Bad" | "Degraded";

export interface ProcessedWebsite {
  id: string;
  url: string;
  totalChecks: number;
  status: UpTimeStatus;
  uptime: number;
  avgResponseTime: number;
  recentTicks: (WebsiteTick & { validator: { location: string } })[];
  tickWindows: UpTimeStatus[];
  lastChecked: string;
}

interface Website {
  id: string;
  url: string;
  _count: {
    ticks: number;
  };
  ticks: (WebsiteTick & { validator: { location: string } })[];
}

export function useProcessedWebsites(websites: Website[]): ProcessedWebsite[] {
  return useMemo(() => {
    return websites.map((website): ProcessedWebsite => {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

      // Sort all ticks by createdAt (newest first)
      const sortedTicks = [...website.ticks].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Filter ticks from last 30 minutes based on createdAt
      const recentTicks = sortedTicks.filter((tick) => {
        const tickDate = new Date(tick.createdAt);
        return tickDate > thirtyMinutesAgo;
      });

      // Calculate 10 time windows of 3 minutes each
      const windows: UpTimeStatus[] = [];

      for (let i = 0; i < 10; i++) {
        const windowStart = new Date(now.getTime() - (i + 1) * 3 * 60 * 1000);
        const windowEnd = new Date(now.getTime() - i * 3 * 60 * 1000);

        const windowTicks = recentTicks.filter((tick) => {
          const tickDate = new Date(tick.createdAt);
          return tickDate >= windowStart && tickDate < windowEnd;
        });

        const upTicks = windowTicks.filter((t) => t.status === "Good").length;

        windows[9 - i] =
          windowTicks.length === 0
            ? "Degraded"
            : upTicks / windowTicks.length >= 0.5
              ? "Good"
              : "Bad";
      }

      // Calculate overall uptime percentage
      const totalTicks = sortedTicks.length;
      const upTicks = sortedTicks.filter((t) => t.status === "Good").length;
      const uptimePercentage =
        totalTicks === 0 ? 100 : (upTicks / totalTicks) * 100;

      // Calculate average response time from recent ticks
      const avgResponseTime =
        recentTicks.length > 0
          ? recentTicks.reduce((acc, tick) => acc + tick.latency, 0) /
            recentTicks.length
          : 0;

      // Get current status from the most recent window
      const currentStatus = windows[windows.length - 1];

      // Get last checked date
      const lastChecked =
        sortedTicks.length > 0
          ? new Date(sortedTicks[0].createdAt).toLocaleDateString()
          : "Never";

      return {
        id: website.id,
        url: website.url,
        totalChecks: website._count.ticks,
        status: currentStatus,
        uptime: uptimePercentage,
        avgResponseTime,
        recentTicks,
        tickWindows: windows,
        lastChecked,
      };
    });
  }, [websites]);
}
