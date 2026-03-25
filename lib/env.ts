/**
 * Environment variables configuration
 * Centralized validation and type-safe access
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please add it to your .env.local file.`
    );
  }
  
  return value;
}

export const env = {
  // Notion API
  NOTION_TOKEN: getEnvVar('NOTION_TOKEN'),
  
  // App Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  
  // Auth (for future use)
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
} as const;

// Type-safe environment
export type Env = typeof env;
