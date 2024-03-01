// app/api/pinata.ts
import { NextResponse, type NextRequest } from "next/server";
import pinataSDK from '@pinata/sdk';
const pinata = new pinataSDK(process.env.PINATA_API_KEY || '', process.env.PINATA_SECRET_API_KEY || '');


export async function GET() {
    try {
      const testResult = await pinata.testAuthentication();
      return NextResponse.json({ message: 'Authentication successful', testResult }, { status: 200 });
    } catch (error) {
      console.error('Pinata authentication failed:', error);
      return NextResponse.json({ error: "Failed to authenticate with Pinata" }, { status: 500 });
    }
}

export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  export async function POST(request: NextRequest) {
    try {
      const data = await request.formData();
      const file: File | null = data.get("file") as unknown as File;
      data.append("file", file);
      data.append("pinataMetadata", JSON.stringify({ name: "File to upload" }));
      const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
        },
        body: data,
      });
      const { IpfsHash } = await res.json();
      console.log(IpfsHash);
  
      return NextResponse.json({ IpfsHash }, { status: 200 });
    } catch (e) {
      console.log(e);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }