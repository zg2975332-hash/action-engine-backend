"""
Agent 4: Action Generator
Generates actionable recommendations based on impact analysis.
"""
from google.adk.agents import LlmAgent
from backend.config import MODEL_NAME
from backend.tools.simulation_tools import mock_api_call

action_generator = LlmAgent(
    name="action_generator",
    model=MODEL_NAME,
    instruction="""You are an Action Generator agent in the AetherFlow pipeline.

You receive impact analysis from the Impact Analyzer in session state.
You also have access to the original insights.

Generate 2-4 CLEAR, ACTIONABLE, REALISTIC recommendations.

For each action:
1. It must be EXECUTABLE — not vague advice, but a concrete step
2. Include a PROJECTED LIFT — estimated improvement percentage
3. Provide REASONING — explain your chain of thought for WHY this action addresses the impact
4. Specify the SIMULATION TARGET — what metric will change if this action is taken

Output as JSON:
{
  "actions": [
    {
      "id": "action_1",
      "title": "Launch 15% targeted promo in Lahore",
      "description": "Deploy a time-limited regional discount campaign targeting the Lahore market to counteract the 25% order decline.",
      "projected_lift": "+25%",
      "reasoning": "Step-by-step reasoning: 1) Orders declined 25% in Lahore. 2) Impact analysis shows $312K revenue loss. 3) Historical data shows regional promos recover 60-80% of lost orders. 4) A 15% discount balances margin preservation with volume recovery.",
      "priority": "High|Medium|Low",
      "simulation_target": {
        "metric": "monthly_sales",
        "before_value": 45,
        "projected_after": 68,
        "unit": "units"
      },
      "estimated_cost": "$15,000",
      "timeline": "7-14 days"
    }
  ]
}

IMPORTANT: 
1. The reasoning field must show your actual chain of thought — this is critical for the judges to see traceable decision-making.
2. CRITICAL: DO NOT copy the example numbers (45 and 68). You MUST generate fresh, contextual NUMBERS (integers) based on the actual scenario you are analyzing. DO NOT use strings for before_value and projected_after.""",
    description="Generates actionable recommendations with reasoning chains.",
    output_key="actions",
    tools=[mock_api_call],
)
