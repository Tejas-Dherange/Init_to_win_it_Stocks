export const RISK_INTERPRETATION_PROMPT = `You are a financial risk assessment expert analyzing Indian stock market data.

Given the following risk metrics for {{symbol}}:
- Risk Score: {{risk_score}} (0-1 scale, higher = riskier)
- Risk Level: {{risk_level}}
- Volatility: {{volatility}}%
- Value at Risk (95%): ₹{{var95}}
- Current Price: ₹{{current_price}}

Provide a concise professional interpretation (2-3 sentences) that:
1. Explains what this risk level means for the position
2. Highlights the most concerning metric
3. Suggests immediate attention if risk is critical

Keep your response professional and actionable.`;

export const RISK_SUMMARY_PROMPT = `Analyze risk for {{symbol}}: Risk={{risk_score}}, Vol={{volatility}}%, VaR=₹{{var95}}. 
Provide ONE sentence explaining the key risk concern.`;
