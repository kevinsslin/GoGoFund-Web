import { NextResponse, type NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable, eventsTable, transactionTable } from "@/db/schema";

// GET /api/events/myevents/:address
/// Get My Events and associated NFTs
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      address: string;
    };
  },
) {
  const { address } = params;
  try {
    // Get the User
    const dbUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.walletAddress, address),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }
    // Get the Events
    const dbEvents = await db.query.eventsTable.findMany({
      where: eq(eventsTable.userId, dbUser.displayId),
    });
    if (!dbEvents) {
      return NextResponse.json({ error: "Events Not Found" }, { status: 404 });
    }

    const eventsWithTransactionCount = await Promise.all(
      dbEvents.map(async (dbEvent) => {
        // Fetch the transactions for each event
        const transactions = await db.query.transactionTable.findMany({
          where: eq(transactionTable.eventId, dbEvent.displayId),
        });

        // Return the event data along with the transaction count
        return {
          displayId: dbEvent.displayId,
          title: dbEvent.title,
          startDate: dbEvent.startDate,
          endDate: dbEvent.endDate,
          targetValue: dbEvent.targetValue,
          currentValue: dbEvent.currentValue,
          currency: dbEvent.currency,
          imageSrc: dbEvent.imageSrc,
          status: dbEvent.status,
          transactionCount: transactions.length, // Include the transaction count
        };
      }),
    );

    return NextResponse.json(eventsWithTransactionCount, { status: 200 });
  } catch (error) {
    console.error("Error getting events:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
