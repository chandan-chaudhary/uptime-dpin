import { prisma } from "@repo/db";
import { WebsiteTick, WebsiteStatus } from "@repo/db";

import { NextRequest, NextResponse } from "next/server";

// Get website status by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  try {
    const { websiteId } = await params;

    // Check if website exists
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      select: {
        id: true,
        url: true,
      },
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Get all ticks for this website
    const ticks = await prisma.websiteTick.findMany({
      where: { websiteId },
      orderBy: { timestamp: "desc" },
      include: {
        validator: {
          select: {
            id: true,
            location: true,
            publicKey: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalTicks = ticks.length;
    const goodTicks = ticks.filter(
      (t: WebsiteTick) => t.status === WebsiteStatus.Good,
    ).length;
    const badTicks = ticks.filter(
      (t: WebsiteTick) => t.status === WebsiteStatus.Bad,
    ).length;
    const uptime =
      totalTicks > 0 ? ((goodTicks / totalTicks) * 100).toFixed(2) : "0.00";

    const avgLatency =
      totalTicks > 0
        ? Math.round(
            ticks.reduce((sum: number, t: WebsiteTick) => sum + t.latency, 0) /
              totalTicks,
          )
        : 0;

    // Get latest tick
    const latestTick = ticks[0] || null;

    // Get last 24 hours ticks
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentTicks = ticks.filter(
      (t: WebsiteTick) => t.timestamp >= last24Hours,
    );
    const recentGood = recentTicks.filter(
      (t: WebsiteTick) => t.status === WebsiteStatus.Good,
    ).length;
    const recentUptime =
      recentTicks.length > 0
        ? ((recentGood / recentTicks.length) * 100).toFixed(2)
        : "0.00";

    // // Calculate status by validator location
    // const statusByLocation = ticks.reduce(
    //   (acc: any, tick: WebsiteTick) => {
    //     const location = tick.validator.location || "Unknown";
    //     if (!acc[location]) {
    //       acc[location] = { good: 0, bad: 0, avgLatency: 0, count: 0 };
    //     }
    //     acc[location].count++;
    //     acc[location][tick.status === WebsiteStatus.Good ? "good" : "bad"]++;
    //     acc[location].avgLatency += tick.latency;
    //     return acc;
    //   },
    //   {} as Record<
    //     string,
    //     { good: number; bad: number; avgLatency: number; count: number }
    //   >
    // );

    // Calculate average latency per location
    // Object.keys(statusByLocation).forEach((location) => {
    //   const data = statusByLocation[location];
    //   data.avgLatency = Math.round(data.avgLatency / data.count);
    // });

    return NextResponse.json({
      website: {
        id: website.id,
        url: website.url,
      },
      status: {
        currentStatus: latestTick?.status || "UNKNOWN",
        uptime: `${uptime}%`,
        last24hUptime: `${recentUptime}%`,
        totalChecks: totalTicks,
        goodChecks: goodTicks,
        badChecks: badTicks,
        avgLatency: `${avgLatency}ms`,
        lastCheck: latestTick?.timestamp || null,
        lastCheckLatency: latestTick?.latency || null,
      },
      // byLocation: statusByLocation,
      recentTicks: ticks.slice(0, 20).map((tick: WebsiteTick) => ({
        id: tick.id,
        status: tick.status,
        latency: tick.latency,
        timestamp: tick.timestamp,
        validator: tick.validatorId,
      })),
    });
  } catch (error) {
    console.error("Get website status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
