import { Router } from "express";
import { db } from "../db";
import { forumPosts } from "../../shared/schema-extensions";
import { desc } from "drizzle-orm";

const router = Router();

// Get all posts
router.get("/posts", async (req, res) => {
    try {
        const posts = await db.select({
            id: forumPosts.id,
            title: forumPosts.title,
            content: forumPosts.content,
            category: forumPosts.category,
            likes: forumPosts.likes,
            createdAt: forumPosts.createdAt,
        })
            .from(forumPosts)
            .orderBy(desc(forumPosts.createdAt));

        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
    }
});

// Create post
router.post("/posts", async (req, res) => {
    // Cast to any to bypass TS check for isAuthenticated
    if (!(req as any).isAuthenticated()) return res.status(401).send("Unauthorized");

    try {
        const newPost = await db.insert(forumPosts).values({
            userId: (req as any).user!.id,
            title: req.body.title,
            content: req.body.content,
            category: req.body.category || "General",
        }).returning();
        res.json(newPost[0]);
    } catch (error) {
        res.status(500).json({ error: "Failed to create post" });
    }
});

export default router;
