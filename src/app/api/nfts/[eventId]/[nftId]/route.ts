import { NextResponse, type NextRequest } from "next/server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { nftsTable, eventsTable, usersTable } from "@/db/schema";

const putNFTRequestSchema = z.object({
  address: z.string(),
  name: z.string(),
  price: z.number(),
  imageSrc: z.string(),
  nowAmount: z.number(),
  description: z.string(),
});
type PutNFTRequest = z.infer<typeof putNFTRequestSchema>;

export async function PUT(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      eventId: string;
      nftId: string;
    };
  },
) {
  const data = await req.json();

  try {
    // parse will throw an error if the data doesn't match the schema
    putNFTRequestSchema.parse(data);
  } catch (error) {
    // in case of an error, we return a 400 response
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { eventId, nftId } = params;

  const { address, name, price, imageSrc, nowAmount, description } =
    data as PutNFTRequest;
  try {
    //get User
    const dbUser = await db.query.usersTable.findFirst({
      where: eq(usersTable.walletAddress, address),
    });
    if (!dbUser) {
      return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }
    //get Event
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
    // Saving the new user to the database
    const userId = await db
      .update(nftsTable)
      .set({
        description,
        name,
        price,
        imageSrc,
        nowAmount,
      })
      .where(
        and(
          eq(nftsTable.displayId, nftId),
          eq(nftsTable.eventId, dbEvent.displayId),
        ),
      )
      .execute();

    return NextResponse.json({ id: userId }, { status: 200 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}