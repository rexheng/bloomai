
console.log("Start script");
import { GoogleGenerativeAI } from '@google/generative-ai';
console.log("Imported GenAI");

try {
    const client = new GoogleGenerativeAI("test");
    console.log("Client created");
} catch (e) {
    console.error("Error creating client", e);
}
console.log("Done");
