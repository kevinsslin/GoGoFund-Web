import { NextResponse, type NextRequest } from "next/server";

// TODO: recover it after publish feature
// import { eq, not } from "drizzle-orm";
import { eq, not } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { usersTable, eventsTable, transactionTable } from "@/db/schema";

const postEventRequestSchema = z.object({
  address: z.string(),
  title: z.string(),
  description: z.string(),
  startDate: z.number(),
  endDate: z.number(),
  targetValue: z.number().min(0),
  currency: z.enum(["USD", "TAREA", "NTD"]),
  //   image: z.instanceof(File),
});
// you can use z.infer to get the typescript type from a zod schema
type PostEventRequest = z.infer<typeof postEventRequestSchema>;

// POST /api/events
/// Create Event
export async function POST(req: NextRequest) {
  console.log("POST /api/events");
  const data = await req.json();
  try {
    // parse will throw an error if the data doesn't match the schema
    postEventRequestSchema.parse(data);
  } catch (error) {
    // in case of an error, we return a 400 response
    if (error instanceof z.ZodError) {
      console.error(error.errors);
    } else {
      console.error(error);
    }
    return NextResponse.json({ error: "Invalid Zod request" }, { status: 400 });
  }
  const {
    address,
    title,
    description,
    startDate,
    endDate,
    targetValue,
    currency,
  } = data as PostEventRequest;
  try {
    console.log("try to upload image to pinata");

    // Get the User
    const dbUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.walletAddress, address),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }

    // create event
    const [newEventId] = await db
      .insert(eventsTable)
      .values({
        userId: dbUser.displayId,
        title,
        description,
        startDate: startDate?.toString(),
        endDate: endDate?.toString(),
        targetValue,
        currentValue: 0,
        currency,
        imageSrc: "",
        status: "pending",
      })
      .returning();

    return NextResponse.json({ event: newEventId }, { status: 200 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// GET /api/events
/// Get All Events
export async function GET() {
  try {
    const dbEvents = await db.query.eventsTable.findMany({
      where: not(eq(eventsTable.status, "pending")),
    });

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
