
import { Router } from "express";
import { hmntToken } from "../services/hmnt/HMNTToken";
import { hmntGovernance } from "../services/hmnt/Governance";

const router = Router();

// Token Stats
router.get("/stats", (req, res) => {
    res.json(hmntToken.getStats());
});

// Governance Proposals
router.get("/proposals", (req, res) => {
    res.json(hmntGovernance.getProposals());
});

router.post("/proposals", (req, res) => {
    const { proposer, title, description } = req.body;
    const proposal = hmntGovernance.createProposal(proposer || "user", title, description);
    res.json(proposal);
});

router.post("/vote", (req, res) => {
    const { proposalId, voter, support, weight } = req.body;
    const success = hmntGovernance.vote(proposalId, voter, support, weight || 100);
    if (!success) return res.status(400).json({ error: "Vote failed" });
    res.json({ status: "success" });
});

export default router;
