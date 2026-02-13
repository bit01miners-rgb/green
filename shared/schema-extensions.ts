import { pgTable, serial, text, timestamp, integer, boolean, real } from "drizzle-orm/pg-core";
import { users } from "./schema";

// ... existing schema ...

// ==================== COMMUNITY / FORUM ====================
export const forumPosts = pgTable("forum_posts", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    category: text("category").notNull(), // General, Trading, DeFi, Support
    likes: integer("likes").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumComments = pgTable("forum_comments", {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull().references(() => forumPosts.id),
    userId: integer("user_id").notNull().references(() => users.id),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== P2P TRADING ====================
export const p2pOffers = pgTable("p2p_offers", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    type: text("type").notNull(), // buy, sell
    asset: text("asset").notNull(), // USDT, BTC, ETH
    fiatCurrency: text("fiat_currency").notNull(), // USD, EUR
    price: real("price").notNull(),
    minLimit: real("min_limit").notNull(),
    maxLimit: real("max_limit").notNull(),
    paymentMethods: text("payment_methods").notNull(), // Bank Transfer, PayPal
    status: text("status").default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const p2pOrders = pgTable("p2p_orders", {
    id: serial("id").primaryKey(),
    offerId: integer("offer_id").notNull().references(() => p2pOffers.id),
    buyerId: integer("buyer_id").notNull().references(() => users.id),
    sellerId: integer("seller_id").notNull().references(() => users.id),
    amount: real("amount").notNull(), // Crypto amount
    fiatAmount: real("fiat_amount").notNull(),
    status: text("status").default("pending"), // pending, paid, released, disputed, cancelled
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== PRIVACY POOL (Mixer) ====================
export const privacyDeposits = pgTable("privacy_deposits", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id), // Optional for anonymity? track internally for now
    note: text("note").notNull(), // The "secret" key
    amount: real("amount").notNull(),
    asset: text("asset").notNull(),
    isSpent: boolean("is_spent").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
