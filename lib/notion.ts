import { Client } from "@notionhq/client";
import { env } from "./env";
import logger from "./logger";

/**
 * Notion API client with lazy initialization
 */

let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = new Client({
      auth: env.NOTION_TOKEN,
    });
    
    logger.info('Notion client initialized');
  }
  
  return notionClient;
}

// Lazy initialization - don't throw at module load time
export const notion = new Proxy(
  {},
  {
    get: (_target, prop) => {
      const client = getNotionClient();
      return (client as any)[prop];
    },
  }
) as unknown as Client;
