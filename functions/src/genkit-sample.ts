// Import the Genkit core libraries and plugins.
import {genkit, z} from "genkit";
import {vertexAI, gemini20Flash} from "@genkit-ai/vertexai";

// Cloud Functions for Firebase supports Genkit natively.
import {onCallGenkit} from "firebase-functions/https";

// Genkit models generally depend on an API key.
import {defineSecret} from "firebase-functions/params";
const apiKey = defineSecret("GOOGLE_GENAI_API_KEY");

// The Firebase telemetry plugin exports a combination of
// metrics, traces, and logs to Google Cloud Observability.
import {enableFirebaseTelemetry} from "@genkit-ai/firebase";
enableFirebaseTelemetry();

const ai = genkit({
  plugins: [
    vertexAI({location: "us-central1"}),
  ],
});

// Define a simple flow that prompts an LLM to generate menu suggestions.
const menuSuggestionFlow = ai.defineFlow(
  {
    name: "menuSuggestionFlow",
    inputSchema: z.string().describe("A restaurant theme").default("seafood"),
    outputSchema: z.string(),
    streamSchema: z.string(),
  },
  async (subject, {sendChunk}) => {
    // Construct a request and send it to the model API.
    const prompt = `Suggest an item for the menu of a 
    ${subject} themed restaurant`;
    const {response, stream} = ai.generateStream({
      model: gemini20Flash,
      prompt,
      config: {
        temperature: 1,
      },
    });

    for await (const chunk of stream) {
      sendChunk(chunk.text);
    }

    // Handle the response from the model API.
    return (await response).text;
  }
);

export const menuSuggestion = onCallGenkit(
  {
    // Uncomment to enable AppCheck.
    // enforceAppCheck: true,

    // Example authPolicy:
    // authPolicy: hasClaim("email_verified"),

    // Grant access to the API key to this function:
    secrets: [apiKey],
  },
  menuSuggestionFlow
);
