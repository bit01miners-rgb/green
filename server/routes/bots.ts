import { Router } from "express";
import { botManager } from "../services/botEngine";

const router = Router();
// Bots are now registered internally in BotEngine service

router.get("/", (req, res) => {
    const bots = botManager.getAllBots();
    res.json(bots);
});

router.get("/strategies", (req, res) => {
    const strategies = botManager.getAvailableStrategies();
    res.json(strategies);
});

router.post("/create", (req, res) => {
    const { type, config } = req.body;
    if (!type || !config) return res.status(400).json({ error: "Missing type or config" });

    const bot = botManager.createBot(type, config);
    if (!bot) return res.status(400).json({ error: "Failed to create bot" });

    res.json({ status: "success", bot: bot.getStatus() });
});

router.post("/:id/start", (req, res) => {
    const { id } = req.params;
    const status = botManager.startBot(id);
    if (!status) return res.status(404).json({ error: "Bot not found" });
    res.json({ status });
});

router.post("/:id/stop", (req, res) => {
    const { id } = req.params;
    const status = botManager.stopBot(id);
    if (!status) return res.status(404).json({ error: "Bot not found" });
    res.json({ status });
});

router.get("/:id/logs", (req, res) => {
    const { id } = req.params;
    const logs = botManager.getBotLogs(id);
    res.json(logs);
});

export default router;
