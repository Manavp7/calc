import { NextResponse } from 'next/server';
import { OTP } from '@/lib/models/otp';
import dbConnect from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await dbConnect();

        // Remove existing OTPs for this email to prevent spam/confusion
        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            otp,
        });

        // Send email via Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Simplest for personal/dev usage, or use standard SMTP
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // App Password if using Gmail
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${otp}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #0ea5e9;">Verification Code</h2>
                    <p>Please use the following code to unlock your estimate:</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="font-size: 14px; color: #666;">This code will expire in 5 minutes.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'OTP sent successfully' });
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        return NextResponse.json({ error: 'Failed to send OTP. Check server logs.' }, { status: 500 });
    }
}
