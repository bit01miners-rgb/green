import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    console.error("Please create a .env file with a valid PostgreSQL connection string.");
    process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, {
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
});
export const db = drizzle(client, { schema });
