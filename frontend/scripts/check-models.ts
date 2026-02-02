
import { GoogleGenerativeAI } from '@google/generative-ai';
// import * as dotenv from 'dotenv'; // Removed dependency
import * as path from 'path';
import * as fs from 'fs';

// Manually parse .env format
function parseEnv(content: string) {
    const res: any = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            res[key] = value;
        }
    });
    return res;
}

// Manually load env since we're running via ts-node in a script
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = parseEnv(fs.readFileSync(envPath, 'utf-8'));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ No GEMINI_API_KEY found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

const MODELS_TO_TEST = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-pro-002",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
];

async function testModel(modelName: string) {
    console.log(`\nTesting model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = result.response.text();
        console.log(`✅ SUCCESS: ${modelName} is working!`);
        console.log(`Response: ${response.substring(0, 50)}...`);
        return true;
    } catch (error: any) {
        console.log(`❌ FAILED: ${modelName}`);
        console.log(`Error: ${error.message.substring(0, 100)}...`);
        return false;
    }
}

async function run() {
    console.log("Starting model check...");
    let workingModel = null;

    for (const model of MODELS_TO_TEST) {
        const success = await testModel(model);
        if (success) {
            workingModel = model;
            // Stop after first success if you want, or check all. Let's check all to give best option.
            break;
        }
    }

    if (workingModel) {
        console.log(`\n🎉 CONCLUSION: Please use '${workingModel}' in your code.`);
    } else {
        console.error("\n💀 ALL MODELS FAILED. Check your API Key or Region availability.");
    }
}

run();
