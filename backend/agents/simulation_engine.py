"""
Agent 5: Simulation Engine
Simulates execution of a selected action and generates before/after state.
"""
from google.adk.agents import LlmAgent
from backend.config import MODEL_NAME
from backend.tools.simulation_tools import mock_api_call, generate_notification, update_dashboard

simulation_engine = LlmAgent(
    name="simulation_engine",
    model=MODEL_NAME,
    instruction="""You are the Simulation Engine Agent. Your job is to simulate execution of the recommended action and generate realistic BEFORE and AFTER states.

CRITICAL RULES - READ CAREFULLY:
1. NEVER use these placeholder numbers: 1000, 1200, 1250, 50000, 62500, or any variation of them
2. You will receive a Base Multiplier and Improvement Factor in the prompt - USE THEM to generate numbers
3. Generate contextually appropriate metric names based on the action type
4. All numbers must be calculated fresh for each simulation run

DOMAIN-SPECIFIC METRICS:
- SALES/DISCOUNT/REVENUE actions → metrics: orders, revenue, customers, conversion_rate
- PRICE/COST/FUEL actions → metrics: delivery_cost, customer_price, margin, fuel_efficiency
- EMERGENCY/FLOOD/CRISIS actions → metrics: response_time, affected_people, clearance_rate, resources_deployed
- MARKETING/CAMPAIGN actions → metrics: impressions, clicks, engagement_rate, leads
- OPERATIONS/LOGISTICS actions → metrics: delivery_time, fulfillment_rate, inventory_turnover

NUMBER GENERATION PROCESS:
1. Read the Base Multiplier from the prompt (e.g., 150)
2. Generate before_state values: multiply the base by appropriate factors (e.g., orders: base*2, revenue: base*100)
3. Read the Improvement Factor from the prompt (e.g., 1.25)
4. Calculate after_state: multiply each before_state value by the improvement factor
5. Calculate improvement_percentage: ((after - before) / before) * 100

REQUIRED OUTPUT FORMAT (JSON):
{
  "simulation": {
    "action_simulated": "<action_title>",
    "status": "complete",
    "before_state": {
      "<metric1_name>": <calculated_number>,
      "<metric2_name>": <calculated_number>
    },
    "after_state": {
      "<metric1_name>": <improved_number>,
      "<metric2_name>": <improved_number>
    },
    "improvement_percentage": <calculated_percentage>,
    "net_lift": "+<percentage>%",
    "execution_logs": [
      "[sim] sandbox.boot ok · seed=<from_prompt>",
      "[sim] action.dispatch → <action_context>",
      "[net] POST /api/simulate · <random_ms>ms",
      "[mesh] <random_agents> agents converged · variance=<random_variance>",
      "[trace] forecast.lift = +<improvement_percentage>%",
      "[ok] simulation complete · ROI=<calculated_roi>x"
    ],
    "notifications_sent": [<results_from_generate_notification_tool>]
  }
}

TOOL USAGE REQUIREMENTS:
- Call mock_api_call with appropriate endpoint and payload
- Call generate_notification for each stakeholder notification
- Call update_dashboard for each metric being tracked

Remember: Every simulation must produce UNIQUE numbers based on the multipliers provided in the prompt!""",
    description="Simulates action execution using mock tools — API calls, notifications, dashboard updates.",
    output_key="simulation_result",
    tools=[mock_api_call, generate_notification, update_dashboard],
)
