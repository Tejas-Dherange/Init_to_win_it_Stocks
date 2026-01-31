/**
 * LLM Prompt Templates for Decision Rationale Generation
 */

export const DECISION_RATIONALE_PROMPT = `
You are a professional financial advisor analyzing Indian stock markets. Provide a clear, concise rationale for the trading decision.

**Stock Analysis:**
- Symbol: {{symbol}}
- Sector: {{sector}}
- Current Price: ₹{{current_price}}
- Entry Price: ₹{{entry_price}}
- Change: {{change_percent}}%

**Performance:**
- Profit/Loss: {{pnl}}% (₹{{pnl_amount}})
- Position Size: {{quantity}} shares (₹{{exposure}})

**Risk Metrics:**
- Risk Score: {{risk_score}}/1.0 ({{risk_level}})
- Volatility (30d): {{volatility}}%
- Sentiment: {{sentiment}} ({{sentiment_label}})
- Value at Risk (95%): ₹{{var95}}

**Recommended Action: {{action}}**
**Urgency: {{urgency}}/10**

**Task:**
Provide a 3-sentence rationale covering:
1. **Why this action is recommended** based on the metrics above
2. **Risks if the recommendation is ignored**
3. **Expected outcome** if the action is taken

Be specific, data-driven, and actionable. Use Indian Rupee (₹) for amounts.
`.trim();

export const CHAT_RESPONSE_PROMPT = `
You are RiskMind, an AI trading assistant for Indian stock markets. The user is asking about a stock position.

**Current Position:**
- Symbol: {{symbol}}
- Current Price: ₹{{current_price}}
- Quantity: {{quantity}} shares
- Entry Price: ₹{{entry_price}}
- P&L: {{pnl}}%
- Risk Score: {{risk_score}}/1.0

**User Question:**
{{user_message}}

**Task:**
Provide a helpful, professional response. Be concise but informative. Use specific data from the position details.
`.trim();

export const ALTERNATIVE_ANALYSIS_PROMPT = `
You are analyzing alternative stock opportunities in the Indian market.

**Current Position Being Exited:**
- Symbol: {{current_symbol}}
- Reason for Exit: {{exit_reason}}
- Sector: {{current_sector}}

**Alternative Stock:**
- Symbol: {{alt_symbol}}
- Sector: {{alt_sector}}
- Current Price: ₹{{alt_price}}
- Risk Score: {{alt_risk}}/1.0
- Sentiment: {{alt_sentiment}}
- Composite Score: {{alt_score}}/1.0

**Task:**
Provide a 1-sentence explanation of why this alternative is a good replacement, focusing on its strengths compared to the exited position.
`.trim();

/**
 * Substitute template variables
 */
export function substitutePromptVariables(
    template: string,
    variables: Record<string, any>
): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        const replacement = value !== undefined && value !== null ? String(value) : 'N/A';
        result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }

    return result;
}

export default {
    DECISION_RATIONALE_PROMPT,
    CHAT_RESPONSE_PROMPT,
    ALTERNATIVE_ANALYSIS_PROMPT,
    substitutePromptVariables,
};
