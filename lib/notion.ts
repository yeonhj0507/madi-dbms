import { Client } from "@notionhq/client";

// Runtime check - only throw error when Notion API is actually called
let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!process.env.NOTION_TOKEN) {
    throw new Error(
      "NOTION_TOKEN environment variable is not set. Please add it to your .env.local file."
    );
  }
  
  if (!notionClient) {
    notionClient = new Client({
      auth: process.env.NOTION_TOKEN,
    });
  }
  
  return notionClient;
}

// Lazy initialization - don't throw at module load time
export const notion = new Proxy(
  {},
  {
    get: (target, prop) => {
      const client = getNotionClient();
      return (client as any)[prop];
    },
  }
) as unknown as Client;
