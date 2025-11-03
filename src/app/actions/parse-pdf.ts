"use server";

import pdfParse from "pdf-parse";

export async function parsePdf(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file uploaded");
  }

  // Read the file data from the uploaded file
  const arrayBuffer = await file.arrayBuffer();
  const dataBuffer = Buffer.from(arrayBuffer);

  // Parse PDF content
  const data = await pdfParse(dataBuffer);
  console.log("Extracted text:", data.text);

  return data.text;
}
