
import { NextResponse } from 'next/server';
import { OTP } from '@/lib/models/otp';
import { dbConnect } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
        }

        await dbConnect();

        const record = await OTP.findOne({ email, otp });

        if (!record) {
            return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
        }

        // OTP is valid, verify it (maybe delete it to prevent reuse? optional but good practice)
        await OTP.deleteOne({ _id: record._id });

        return NextResponse.json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
