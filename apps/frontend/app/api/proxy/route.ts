/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (error) {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "UptimeValidator/1.0",
      },
      // Don't follow redirects automatically to get accurate status codes
      redirect: "manual",
      // Set timeout
      signal: AbortSignal.timeout(10000), // 10 seconds
    });

    const latency = Date.now() - startTime;

    // Return minimal response - we only need status code
    return NextResponse.json(
      {
        status: response.status,
        latency,
        ok: response.ok,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      }
    );
  } catch (error: any) {
    const latency = Date.now() - startTime;

    // Return error but with 200 status so we can handle it on client
    return NextResponse.json(
      {
        status: 0,
        latency,
        ok: false,
        error: error.message,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
