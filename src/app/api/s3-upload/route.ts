
import { NextResponse } from "next/server";
import AWS from "aws-sdk";
import mammoth from "mammoth";

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

export async function POST(req: Request) {
  try {
    const { key } = await req.json();
    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    };

    const fileData = await s3.getObject(params).promise();
    const buffer = fileData.Body as Buffer;

    // Parse .docx file content
    const result = await mammoth.extractRawText({ buffer });
    const textContent = result.value; // Extracted text from the .docx file

    return NextResponse.json({ content: textContent });
  } catch (error) {
    console.error("Error parsing .docx file:", error);
    return NextResponse.json({ error: "Failed to parse .docx file" }, { status: 500 });
  }
}
