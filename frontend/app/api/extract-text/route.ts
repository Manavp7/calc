import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Ensure Node.js runtime for pdf-parse and mammoth

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        const mimeType = file.type;
        const fileName = file.name.toLowerCase();

        if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
            // Use require for pdf-parse (CommonJS module — no default export in ESM bundle)
            // eslint-disable-next-line
            const pdfParse = require('pdf-parse');
            const pdfData = await pdfParse(buffer);
            text = pdfData.text;
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileName.endsWith('.docx')
        ) {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else {
            return NextResponse.json(
                { error: 'Unsupported file type. Please upload a PDF or DOCX file.' },
                { status: 400 }
            );
        }

        const trimmed = text.trim();
        if (!trimmed) {
            return NextResponse.json(
                { error: 'The document appears to be empty or could not be read.' },
                { status: 422 }
            );
        }

        return NextResponse.json({ success: true, text: trimmed });
    } catch (error: any) {
        console.error('File extraction error:', error);
        return NextResponse.json(
            { error: 'Failed to extract text from the file. Please make sure it is a valid PDF or DOCX.' },
            { status: 500 }
        );
    }
}
