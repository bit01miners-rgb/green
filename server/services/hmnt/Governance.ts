
import { EventEmitter } from 'events';

interface Proposal {
    id: string;
    title: string;
    description: string;
    proposer: string;
    votesFor: number;
    votesAgainst: number;
    status: 'Active' | 'Passed' | 'Rejected' | 'Executed';
    aiAnalysis: {
        score: number; // 0-100
        sentiment: 'Positive' | 'Negative' | 'Neutral';
        recommendation: 'Approve' | 'Reject';
        reasoning: string;
    };
    endpoints: number; // Block Number or Timestamp
}

export class HMNTGovernance extends EventEmitter {
    private proposals: Map<string, Proposal> = new Map();

    constructor() {
        super();
        // Seed with a dummy proposal
        this.createProposal(
            "deployer",
            "Increase Burn Rate to 2%",
            "To accelerate deflation, we propose increasing the burn tax from 1% to 2%."
        );
    }

    public createProposal(proposer: string, title: string, description: string) {
        const id = Math.random().toString(36).substring(7);

        // Simulate AI Analysis
        const aiAnalysis = this.analyzeProposal(title, description);

        const proposal: Proposal = {
            id,
            title,
            description,
            proposer,
            votesFor: 0,
            votesAgainst: 0,
            status: 'Active',
            aiAnalysis,
            endpoints: Date.now() + 86400000 // 24 hours
        };

        this.proposals.set(id, proposal);
        return proposal;
    }

    public vote(proposalId: string, voter: string, support: boolean, weight: number) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal || proposal.status !== 'Active') return false;

        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }

        // Check for early closure (mock logic)
        if (proposal.votesFor > 100000) {
            proposal.status = 'Passed';
            this.executeProposal(proposal);
        }

        return true;
    }

    public getProposals() {
        return Array.from(this.proposals.values());
    }

    private analyzeProposal(title: string, description: string) {
        // Mock AI Analysis Logic
        // In real implementation, this calls OpenAI or a local LLM to analyze the text

        const isBurn = title.toLowerCase().includes('burn');
        const isFee = title.toLowerCase().includes('fee');

        if (isBurn) {
            return {
                score: 85,
                sentiment: 'Positive' as const,
                recommendation: 'Approve' as const,
                reasoning: "Increasing burn rate aligns with the deflationary roadmap and benefits long-term holders by reducing supply."
            };
        } else if (isFee) {
            return {
                score: 45,
                sentiment: 'Neutral' as const,
                recommendation: 'Reject' as const,
                reasoning: "Changing fee structures frequently can lead to user confusion and instability. Recommend delaying until Q3."
            };
        }

        return {
            score: 60,
            sentiment: 'Neutral' as const,
            recommendation: 'Approve' as const,
            reasoning: "Proposal seems standard but lacks detailed impact analysis."
        };
    }

    private executeProposal(proposal: Proposal) {
        proposal.status = 'Executed';
        this.emit('executed', proposal);
        // Logic to actually call HMNTToken methods would go here
    }
}

export const hmntGovernance = new HMNTGovernance();
