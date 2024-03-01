import { NextResponse, type NextRequest } from "next/server";

import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { nftsTable, eventsTable, usersTable } from "@/db/schema";

const postNFTRequestSchema = z.object({
  address: z.string(),
  totalAmount: z.number(),
  name: z.string(),
  price: z.number(),
  imageSrc: z.string(),
  description: z.string(),
});

// you can use z.infer to get the typescript type from a zod schema
type PostNFTRequest = z.infer<typeof postNFTRequestSchema>;

// POST /api/nfts/:eventId
/// Create NFT
export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      eventId: string;
    };
  },
) {
  const data = await req.json();

  try {
    console.log(data);
    // parse will throw an error if the data doesn't match the schema
    postNFTRequestSchema.parse(data);
  } catch (error) {
    // in case of an error, we return a 400 response
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { eventId } = params;

  const { address, name, price, imageSrc, description, totalAmount } =
    data as PostNFTRequest;
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
      .insert(nftsTable)
      .values({
        eventId: dbEvent.displayId,
        description,
        name,
        price,
        imageSrc:`ipfs://${imageSrc}`,
        nowAmount: 0,
        totalAmount,
      })
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

// GET /api/nfts/:eventId
/// Get All NFTs of Event
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
    const dbNFTs = await db.query.nftsTable.findMany({
      where: eq(nftsTable.eventId, eventId),
    });

    return NextResponse.json(
      dbNFTs.map((dbNFT) => ({
        id: dbNFT.id,
        displayId: dbNFT.displayId,
        eventId: dbNFT.eventId,
        description: dbNFT.description,
        name: dbNFT.name,
        price: dbNFT.price,
        imageSrc: dbNFT.imageSrc,
        nowAmount: dbNFT.nowAmount,
        totalAmount: dbNFT.totalAmount,
      })),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting NFTs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
