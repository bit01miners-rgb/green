import { Router } from "express";
import { storage } from "../storage";

const router = Router();

// Middleware to ensure user is admin
const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    next();
};

router.use(requireAdmin);

// Get all users
router.get("/users", async (req, res) => {
    try {
        const users = await storage.getAllUsers();
        // Remove sensitive data
        const safeUsers = users.map(u => {
            const { password, ...rest } = u;
            return rest;
        });
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Update user role
router.patch("/users/:id/role", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const updated = await storage.updateUser(userId, { role });
        const { password, ...safeUser } = updated;
        res.json(safeUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user role" });
    }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Prevent self-deletion
        if (userId === req.session.userId) {
            return res.status(400).json({ error: "Cannot delete yourself" });
        }

        await storage.deleteUser(userId);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user. They may have related records." });
    }
});

export default router;
