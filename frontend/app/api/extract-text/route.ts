import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
const pdfParse = require('pdf-parse');
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let text = '';

        if (file.type === 'application/pdf') {
            const pdfData = await pdfParse(buffer);
            text = pdfData.text;
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ buffer });
            text = result.value;
        } else {
            return NextResponse.json({ error: 'Unsupported file type. Please upload PDF or DOCX.' }, { status: 400 });
        }

        return NextResponse.json({ success: true, text: text.trim() });
    } catch (error: any) {
        console.error('File extraction error:', error);
        return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 500 });
    }
}
