"""
Agent 6: Outcome Visualizer
Composes the final before/after summary with confidence scores.
"""
from google.adk.agents import LlmAgent
from backend.config import MODEL_NAME

outcome_visualizer = LlmAgent(
    name="outcome_visualizer",
    model=MODEL_NAME,
    instruction="""You are the Outcome Visualizer agent — the FINAL agent in the AetherFlow pipeline.

You receive the simulation results, actions, impact analysis, and insights.

Your job is to compose a COMPREHENSIVE final outcome report.

Output as JSON:
{
  "outcome": {
    "run_id": "af_<generate 6 random hex chars>",
    "confidence_score": <integer 0-100>,
    "processing_time": "4.3s",
    "summary": "One paragraph summarizing the entire analysis-to-action pipeline",
    "before_state": {
      "sales": <number>,
      "revenue": <number>,
      "description": "State before the recommended action"
    },
    "after_state": {
      "sales": <number>,
      "revenue": <number>,
      "description": "Projected state after action execution"
    },
    "net_lift_percent": <number like 25>,
    "roi_estimate": "2.4x",
    "system_changes": [
      "Campaign created in marketing platform",
      "Pricing table updated",
      "5,000 notification dispatched"
    ],
    "agent_pipeline": [
      {"step": 1, "agent": "Content Parser", "status": "complete", "duration": "0.8s"},
      {"step": 2, "agent": "Insight Extractor", "status": "complete", "duration": "1.2s"},
      {"step": 3, "agent": "Impact Analyzer", "status": "complete", "duration": "0.9s"},
      {"step": 4, "agent": "Action Generator", "status": "complete", "duration": "1.1s"},
      {"step": 5, "agent": "Simulation Engine", "status": "complete", "duration": "1.5s"},
      {"step": 6, "agent": "Outcome Visualizer", "status": "complete", "duration": "0.6s"}
    ]
  }
}

The confidence_score should reflect how well-supported the insights are by the data.
High data density = high confidence. Vague input = lower confidence.""",
    description="Composes final before/after outcome report with confidence scores.",
    output_key="final_outcome",
)
