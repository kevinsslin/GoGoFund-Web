import { sendMail } from "../../service/sendEmail";
import {eq} from "drizzle-orm";
import * as z from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import path from "path";
import fs from "fs";
import {
  usersTable,
  nftsTable,
  eventsTable,
} from "@/db/schema";
type items = {
    nftName: string;
    quantity: number;
    payment: number;
};
const transactionItemSchema = z.object({
    nftId: z.number(), // nftId is a UUID string
    quantity: z.number().min(1), // Quantity should be at least 1
  });
  
  // Define the main schema for a transaction request
  const SendEmailSchema = z.object({
    storeName: z.string(),
    address: z.string(), // User's wallet address
    items: z.array(transactionItemSchema), // Array of transaction items
  });
function generateEmailContentHTML(storeName:string, items: items[]) {
    // 讀取email-template.html文件的內容
    console.log("generateEmailContentHTML");
    const templatePath = path.join(process.cwd(),'public', 'stuff', 'mail_template.html');
    console.log(templatePath);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    console.log(storeName);
    console.log(items);
    const replacedContent = templateContent
      .replace('{{storeName}}', storeName)
      .replace('{{items}}', generateItemsList(items));
    return replacedContent;
  }
  
  function generateItemsList(items: items[]) {
    let itemsList = '<ul>';
  
    items.forEach((item, index) => {
      const { nftName, quantity, payment } = item;
      itemsList += `<li>${index + 1}. 商品：${nftName}，數量：${quantity}，金額：${payment}元</li>`;
    });
  
    itemsList += '</ul>';
    return itemsList;
  }

type SendEmailRequest = z.infer<typeof SendEmailSchema>;
// POST /api/email
/// send Email
export async function POST(
  req: NextRequest,
) {
  console.log("subject");
  const data = await req.json();
  try {
    // parse will throw an error if the data doesn't match the schema
    SendEmailSchema.parse(data);
  } catch (error) {
    // in case of an error, we return a 400 response
    if (error instanceof z.ZodError) {
      console.error(error.errors);
    } else {
      console.error(error);
    }
    return NextResponse.json({ error: "Invalid Zod request" }, { status: 400 });
  }
  try {
    //Send Email
    const { storeName,address, items } = data as SendEmailRequest;
    const dbUser = await db.query.usersTable.findFirst({
        where: eq(usersTable.walletAddress, address),
    });
    
    if (!dbUser) {
        return NextResponse.json({ error: "User Not Found" }, { status: 404 });
    }
    const dbStore = await db.query.eventsTable.findFirst({
        where: eq(eventsTable.displayId, storeName),
    });
    if (!dbStore) {
        return NextResponse.json({ error: "Store Not Found" }, { status: 404 });
    }
    //get nft name
    const nftData: items[] = [];

    for (let i = 0; i < items.length; i++) {
        const dbNft = await db.query.nftsTable.findFirst({
            where: eq(nftsTable.id, items[i].nftId),
        });
        if (!dbNft) {
            return NextResponse.json({ error: "Nft Not Found" }, { status: 404 });
        }
        nftData.push({
            nftName: dbNft.name,
            quantity: items[i].quantity,
            payment: items[i].quantity * dbNft.price,
        });
    }

    const subject = "Thank you for your donation";
    const to = dbUser.email;
    const text = generateEmailContentHTML(dbStore.title, nftData);
    console.log(text);

    if (to) {
        await sendMail(subject, to, text);
    }
    return NextResponse.json(
      {
        message: "Email Sent",
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "send filed",
      },
      {
        status: 500,
      },
    );
  }
}
