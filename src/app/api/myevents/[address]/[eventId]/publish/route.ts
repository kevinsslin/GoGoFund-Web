import { NextResponse, type NextRequest } from "next/server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { eventsTable, usersTable } from "@/db/schema";

const publishEventRequestSchema = z.object({
  eventId: z.string(),
  eventAddress: z.string(),
});
type publishEventRequest = z.infer<typeof publishEventRequestSchema>;

// PUT /api/myevents/:address/publish
/// Set Event Status to Ready and eventAddress
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
  const { address, eventId } = params;
  const data = await req.json();
  try {
    const { eventAddress } = data as publishEventRequest;
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
    if (!eventAddress || eventAddress === "") {
      return NextResponse.json(
        { error: "Event Address Not Found" },
        { status: 404 },
      );
    }

    console.log("dbEvent", dbEvent);
    const updatedEvent = await db
      .update(eventsTable)
      .set({
        status: "ready",
        eventAddress: eventAddress,
      })
      .where(eq(eventsTable.id, dbEvent.id));

    // Update the Event
    return NextResponse.json(
      {
        updatedEvent,
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
