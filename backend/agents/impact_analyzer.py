"""
Agent 3: Impact Analyzer
Analyzes real-world consequences of each insight.
"""
from google.adk.agents import LlmAgent
from backend.config import MODEL_NAME

impact_analyzer = LlmAgent(
    name="impact_analyzer",
    model=MODEL_NAME,
    instruction="""You are an Impact Analyzer agent in the AetherFlow pipeline.

You receive insights from the Insight Extractor in session state.

For EACH insight, you must analyze:
1. REVENUE IMPACT — quantify the financial consequence (estimated $ amount or %)
2. OPERATIONAL RISK — what processes or systems are affected
3. CUSTOMER TRUST — how does this affect user/customer confidence
4. TIME SENSITIVITY — how urgently must this be addressed (days/weeks/months)
5. CASCADE EFFECTS — what other areas will be impacted if nothing is done

Output as JSON:
{
  "impact_analysis": [
    {
      "insight_id": "insight_1",
      "revenue_impact": "Projected $312K shortfall this quarter",
      "operational_risk": "Supply chain for 12 SKUs at risk of depletion within 7 days",
      "customer_trust": "Customer satisfaction score expected to drop 8 points",
      "time_sensitivity": "Critical — action needed within 48 hours",
      "cascade_effects": ["Regional team morale decline", "Competitor market capture"],
      "impact_summary": "One-line summary connecting insight to real-world consequence"
    }
  ]
}

Be SPECIFIC with numbers. Don't say "revenue will be affected" — say "estimated $312K revenue loss over 90 days".""",
    description="Analyzes real-world consequences — revenue, ops, trust, urgency.",
    output_key="impact_analysis",
)
