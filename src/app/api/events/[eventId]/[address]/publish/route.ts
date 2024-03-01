import { NextResponse, type NextRequest } from "next/server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { eventsTable, nftsTable } from "@/db/schema";
import { USD_ADDRESS, NTD_ADDRESS, TAREA_ADDRESS } from "@/utils/addresses";

function metadata(description: string, image: string, name: string, price: number, totalAmount: number) {
  return {
    description: description,
    external_url: "",
    image: image,
    name: name,
    attributes: [
      { trait_type: "price", value: price },
      { trait_type: "totalAmount", value: totalAmount },
    ],
  };
}

// GET /api/events/:eventId/:address/publish
/// get the event info for the construct conract
export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      eventId: string;
      address: string;
    };
  },
) {
  const { eventId, address } = params;
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

    let currencyAddress = "";
    switch (dbEvent.currency) {
      case "USD":
        currencyAddress = USD_ADDRESS;
        break;
      case "NTD":
        currencyAddress = NTD_ADDRESS;
        break;
      case "TAREA":
        currencyAddress = TAREA_ADDRESS;
        break;
      default:
        currencyAddress = USD_ADDRESS;
        break;
    }
    const uploadJson = [];
    for (let i = 0; i < nfts.length; i++) {
      uploadJson.push(
        new File(
          [JSON.stringify(metadata(nfts[i].description, nfts[i].imageSrc, nfts[i].name, nfts[i].price, nfts[i].totalAmount))],
          `nftCollection/${i}.json`,
          { type: "application/json" },
        ),
      );
    }
    // Assuming uploadJson is an array of Files created from JSON blobs
    const formData = new FormData();

    uploadJson.forEach((file, index) => {
      // Simulate a folder structure by naming the file with a path
      formData.append('file', file, `nftCollection/${index}.json`);
    });

    // Add metadata for the upload, including the name or other properties
    formData.append("pinataMetadata", JSON.stringify({
      name: "NFT Collection",
      keyvalues: {
        collection: "My NFT Collection"
      }
    }));

    // Perform the upload to Pinata
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: formData,
    });
    const { IpfsHash } = await response.json();

    return NextResponse.json(
      {
        fundAsset: currencyAddress, // Replace with actual data
        issuer: address, // Replace with actual data
        baseURI: `ipfs://${IpfsHash}`, // Replace with actual data, if available
        startTimestamp: Math.floor(Number(dbEvent.startDate) / 1000), // Convert Date to timestamp
        votingEndTimestamp:
          Math.floor(Number(dbEvent.endDate) / 1000) + 3 * 24 * 60 * 60, // Replace with actual data
        endTimestamp: Math.floor(Number(dbEvent.endDate) / 1000), // Convert Date to timestamp
        targetAmount: Number(dbEvent.targetValue),
        names: nfts.map((nft) => nft.name),
        ids: nfts.map((nft) => nft.id),
        mintPrices: nfts.map((nft) => nft.price), // Assuming mintPrice exists
        maxSupplys: nfts.map((nft) => nft.totalAmount), // Assuming maxSupply exists
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
