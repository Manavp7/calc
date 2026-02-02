import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

export async function dbConnect(): Promise<typeof mongoose> {
    if (!MONGODB_URI) {
        throw new Error("Please define the MONGODB_URI environment variable");
    }

    try {
        const conn = await mongoose.connect(MONGODB_URI, {
            dbName: 'calculator',
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
    }
}
