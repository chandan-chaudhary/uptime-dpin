import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";

// Get all websites
export async function GET(request: NextRequest) {
  try {
    // Get userId from header (set by middleware)
    const userId = getUserId(request);
    const websites = await prisma.website.findMany({
      where: userId ? { userId } : { disabled: false },
      include: {
        ticks: {
          orderBy: { timestamp: "desc" },
          take: 30, // Last 30 ticks
          include: {
            validator: {
              select: {
                location: true,
              },
            },
          },
        },
        _count: {
          select: {
            ticks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      websites,
      count: websites.length,
    });
  } catch (error) {
    console.error("Get websites error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// Create a new website
export async function POST(request: NextRequest) {
  try {
    // Get userId from header (set by middleware)
    const userId = getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { url } = body;

    // Validate input
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Check if website already exists for this user
    const existingWebsite = await prisma.website.findFirst({
      where: {
        url,
        userId,
      },
    });

    if (existingWebsite) {
      return NextResponse.json(
        { error: "Website already exists for this user" },
        { status: 409 },
      );
    }

    // Create website
    const website = await prisma.website.create({
      data: {
        url,
        userId, // Now this is our internal UUID from the database
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Website created successfully",
        website,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create website error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
