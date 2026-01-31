export const DECISION_VALIDATION_PROMPT = `You are validating a trading decision made by an AI system.

**Stock**: {{symbol}}
**Recommended Action**: {{action}}
**Urgency**: {{urgency}}/10

**Context**:
- Risk Score: {{risk_score}}
- Current Price: ₹{{current_price}}
- P&L: {{pnl}}%
- Volatility: {{volatility}}%

**Rationale**: {{rationale}}

Validate this decision by providing:
1. Confidence score (0-1): How confident are you this is the right action?
2. Concerns: Any red flags or concerns (1 sentence, or "None")
3. Final verdict: "APPROVE" or "REVIEW_NEEDED"

Format your response as JSON:
{
  "confidence": 0.85,
  "concerns": "None" or "Brief concern",
  "verdict": "APPROVE" or "REVIEW_NEEDED",
  "reasoning": "One sentence explanation"
}`;
