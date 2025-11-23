import { prisma } from "@repo/db/client";
import { NextRequest, NextResponse } from "next/server";

// Get website by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const { websiteId } = params;

    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        ticks: {
          orderBy: { timestamp: "desc" },
          take: 50,
          include: {
            validator: {
              select: {
                id: true,
                publicKey: true,
                location: true,
                ipAddress: true,
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
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    return NextResponse.json({ website });
  } catch (error) {
    console.error("Get website error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update website by ID
export async function PATCH(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const { websiteId } = params;
    const body = await request.json();
    const { url } = body;

    // Check if website exists
    const existingWebsite = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!existingWebsite) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Validate URL if provided
    if (url) {
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { error: "Invalid URL format" },
          { status: 400 }
        );
      }
    }

    // Update website
    const website = await prisma.website.update({
      where: {  id: websiteId },
      data: {
        ...(url && { url }),
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

    return NextResponse.json({
      message: "Website updated successfully",
      website,
    });
  } catch (error) {
    console.error("Update website error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete website by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const { websiteId } = params;

    // Check if website exists
    const existingWebsite = await prisma.website.findUnique({
      where: { id: websiteId },
    });

    if (!existingWebsite) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Delete website (will cascade delete ticks)
    await prisma.website.delete({
      where: { id: websiteId },
    });

    return NextResponse.json({
      message: "Website deleted successfully",
    });
  } catch (error) {
    console.error("Delete website error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
