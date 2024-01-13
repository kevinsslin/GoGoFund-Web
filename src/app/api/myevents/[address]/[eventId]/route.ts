import { NextResponse, type NextRequest } from "next/server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { eventsTable, usersTable, nftsTable } from "@/db/schema";

const updateEventRequestSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  imageSrc: z.string().optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
  targetValue: z.number().optional(),
  currency: z.enum(["USD", "BTC", "NTD"]).optional(),
});
type updateEventRequest = z.infer<typeof updateEventRequestSchema>;

// PUT /api/myevents/:address/:eventId
/// Update Event
export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      address: string;
      eventId: string;
    };
  },
) {
  const { eventId, address } = params;
  const data = await req.json();
  try {
    const {
      title,
      description,
      imageSrc,
      startDate,
      endDate,
      targetValue,
      currency,
    } = data as updateEventRequest;
    // Get the User
    const dbUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.walletAddress, address),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }
    // Get the Event
    const dbEvent = await db.query.eventsTable.findFirst({
      where: and(
        eq(eventsTable.displayId, eventId),
        eq(eventsTable.userId, dbUser.displayId),
        eq(eventsTable.status, "pending"),
      ),
    });
    if (!dbEvent) {
      return NextResponse.json({ error: "Event Not Found" }, { status: 404 });
    }

    // Update the Event
    const [updateEvent] = await db
      .update(eventsTable)
      .set({
        title,
        description,
        imageSrc,
        startDate: startDate?.toString(),
        endDate: endDate?.toString(),
        targetValue,
        currency,
      })
      .where(eq(eventsTable.displayId, eventId))
      .returning();

    return NextResponse.json(
      {
        id: updateEvent.id,
        title: updateEvent.title,
        description: updateEvent.description,
        imageSrc: updateEvent.imageSrc,
        startDate: updateEvent.startDate,
        endDate: updateEvent.endDate,
        targetValue: updateEvent.targetValue,
        currency: updateEvent.currency,
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

// Delete /api/myevents/:address/:eventId
/// Delete Event
export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      address: string;
      eventId: string;
    };
  },
) {
  const { eventId, address } = params;
  const { nftId } = await req.json();
  try {
    // Get the User
    const dbUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.walletAddress, address),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }
    // Get the Event
    const dbEvent = await db.query.eventsTable.findFirst({
      where: and(
        eq(eventsTable.displayId, eventId),
        eq(eventsTable.userId, dbUser.displayId),
        eq(eventsTable.status, "pending"),
      ),
    });
    if (!dbEvent) {
      return NextResponse.json({ error: "Event Not Found" }, { status: 404 });
    }

    // Delete the NFTs
    await db.delete(nftsTable).where(eq(nftsTable.displayId, nftId));

    return NextResponse.json({ status: 200 });
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
