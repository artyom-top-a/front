import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

// // Function to extract text from PDF file
// async function extractTextFromPDF(file: File) {
//   console.log("Extracting text from PDF...");
//   const dataBuffer = await file.arrayBuffer();
//   const data = await pdfParse(Buffer.from(dataBuffer));
//   console.log("Extracted text:", data.text);
//   return data.text;
// }

// // API Route to handle PDF upload and generate response
// export async function POST(req: NextRequest) {
//   console.log("Received POST request");
//   const formData = await req.formData();
//   const uploadedFile = formData.get('file') as File;

//   if (!uploadedFile) {
//     console.log("No file uploaded");
//     return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//   }

//   // Extract text from PDF
//   const pdfText = await extractTextFromPDF(uploadedFile);

//   // Generate response from GPT-4 using extracted text
//   console.log("Sending extracted text to GPT-4:", pdfText.slice(0, 100)); // Show first 100 chars for reference
//   const response = await generateText({
//     model: openai('gpt-4'),
//     messages: [
//       {
//         role: 'user',
//         content: `Analyze this document and provide a summary: ${pdfText}`,
//       },
//     ],
//   });

//   // Log the response structure for debugging
//   console.log('GPT Response:', response);

//   // Attempt to access the response content
//   const resultContent = response?.text || 'No content generated';
//   console.log("Generated content:", resultContent);

//   return NextResponse.json({ result: resultContent });
// }


export async function POST(request: Request) {
  const formData = await request.formData();
  const uploadedFile = formData.get('file') as File;

  if (!uploadedFile) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const pdfText = await pdfParse(Buffer.from(arrayBuffer));
    
    console.log("Extracted PDF Text:", pdfText.text);
    return NextResponse.json({ text: pdfText.text });
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
  }
}
