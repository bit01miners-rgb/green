
// Usage: npx tsx scripts/make-admin.ts <email>
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Please provide an email address");
        process.exit(1);
    }

    console.log(`Promoting user ${email} to admin...`);

    const [user] = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.email, email))
        .returning();

    if (user) {
        console.log(`User ${user.email} is now an ADMIN.`);
    } else {
        console.error("User not found.");
    }
    process.exit(0);
}

main().catch(console.error);
