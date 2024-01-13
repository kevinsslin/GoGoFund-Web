import { NextResponse, type NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { eventsTable, nftsTable } from "@/db/schema";

// GET /api/events/:eventId
/// Get EventDetail and NFTs
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      eventId: string;
    };
  },
) {
  const { eventId } = params;
  try {
    // Get the Event
    const dbEvent = await db.query.eventsTable.findFirst({
      where: eq(eventsTable.displayId, eventId),
    });
    if (!dbEvent) {
      return NextResponse.json({ error: "Event Not Found" }, { status: 404 });
    }

    const nfts = await db.query.nftsTable.findMany({
      where: eq(nftsTable.eventId, dbEvent.displayId),
    });

    return NextResponse.json(
      {
        id: dbEvent.id,
        displayId: dbEvent.displayId,
        eventAddress: dbEvent.eventAddress,
        title: dbEvent.title,
        description: dbEvent.description,
        startDate: dbEvent.startDate,
        endDate: dbEvent.endDate,
        targetValue: dbEvent.targetValue,
        currentValue: dbEvent.currentValue,
        currency: dbEvent.currency,
        imageSrc: dbEvent.imageSrc,
        status: dbEvent.status,
        nfts: nfts,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
