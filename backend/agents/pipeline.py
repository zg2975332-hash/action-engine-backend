"""
Master Pipeline -- Orchestrates all 6 agents using Google ADK SequentialAgent.
Uses InMemoryRunner for execution and captures all agent traces.
"""
import os
import json
import time
import uuid
from google.adk.agents import SequentialAgent
from google.adk.runners import InMemoryRunner
from google.genai import types as genai_types

# Create a folder for logs in the backend directory
LOGS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "logs")


def _save_traces_to_file(run_type: str, run_id: str, data: dict):
    """
    Save the traces and results of a run/simulation to a JSON file in backend/logs/.
    """
    try:
        os.makedirs(LOGS_DIR, exist_ok=True)
        timestamp_str = time.strftime("%Y%m%d_%H%M%S")
        filename = f"{run_type}_{run_id}_{timestamp_str}.json"
        filepath = os.path.join(LOGS_DIR, filename)
        
        log_payload = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "run_type": run_type,
            "run_id": run_id,
            "data": data
        }
        
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(log_payload, f, indent=2, ensure_ascii=False)
        print(f"\n[Trace Logger] Successfully saved {run_type} logs to: {filepath}\n")
    except Exception as e:
        print(f"\n[Trace Logger] Error saving traces to file: {e}\n")


from backend.agents.content_parser import content_parser
from backend.agents.insight_extractor import insight_extractor
from backend.agents.impact_analyzer import impact_analyzer
from backend.agents.action_generator import action_generator
from backend.agents.simulation_engine import simulation_engine
from backend.agents.outcome_visualizer import outcome_visualizer


# --- Build the SequentialAgent pipeline ---
analysis_pipeline = SequentialAgent(
    name="AetherFlow_Pipeline",
    description="6-phase autonomous content-to-action reasoning pipeline powered by Google ADK.",
    sub_agents=[
        content_parser,
        insight_extractor,
        impact_analyzer,
        action_generator,
        simulation_engine,
        outcome_visualizer,
    ],
)

# --- Runner ---
APP_NAME = "aetherflow"
SIM_APP_NAME = "aetherflow_sim"
USER_ID = "user_main"

runner = InMemoryRunner(agent=analysis_pipeline, app_name=APP_NAME)


def _parse_json_output(raw):
    """Try to parse JSON from an LLM output string (may have markdown fences)."""
    if not isinstance(raw, str):
        return raw
    clean = raw.strip()
    if clean.startswith("```"):
        lines = clean.split("\n")
        if len(lines) > 2:
            clean = "\n".join(lines[1:-1])
        else:
            clean = clean.replace("```json", "").replace("```", "")
    try:
        return json.loads(clean)
    except (json.JSONDecodeError, Exception):
        return {"raw": raw}


async def run_analysis_pipeline(content: str, content_type: str = "text") -> dict:
    """
    Execute the full 6-agent pipeline on the given content.
    Returns insights, actions, simulation results, outcome, and agent traces.
    """
    start_time = time.time()
    traces = []
    session_id = str(uuid.uuid4())

    # Create session FIRST -- InMemoryRunner requires it
    session_service = runner.session_service
    await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session_id,
    )

    # Prepare the input message
    input_text = f"""Analyze the following {content_type} content and process it through the full pipeline:

---
{content}
---

Process this content step by step through all agents."""

    user_message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=input_text)]
    )

    # Run the pipeline and collect all events
    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=session_id,
        new_message=user_message,
    ):
        trace_entry = {
            "agent": getattr(event, "author", "system"),
            "timestamp": round(time.time() - start_time, 3),
        }

        # Capture text content
        if hasattr(event, "content") and event.content:
            if hasattr(event.content, "parts") and event.content.parts:
                text_parts = [p.text for p in event.content.parts if hasattr(p, "text") and p.text]
                if text_parts:
                    traces.append({
                        **trace_entry,
                        "type": "reasoning",
                        "content": text_parts[0][:500],
                    })

        # Capture tool calls
        if hasattr(event, "tool_calls") and event.tool_calls:
            for tc in event.tool_calls:
                tool_name = getattr(tc, "name", str(tc))
                traces.append({
                    **trace_entry,
                    "type": "tool_call",
                    "tool": tool_name,
                    "content": f"Tool called: {tool_name}",
                })

    elapsed = round(time.time() - start_time, 1)

    # Retrieve session state
    session_state = {}
    try:
        session = await session_service.get_session(
            app_name=APP_NAME,
            user_id=USER_ID,
            session_id=session_id,
        )
        if session and session.state:
            session_state = dict(session.state)
    except Exception:
        pass

    # Parse agent outputs
    parsed = {}
    for key in ["parsed_content", "insights", "actions", "impact_analysis", "simulation_result", "final_outcome"]:
        raw = session_state.get(key, "{}")
        parsed[key] = _parse_json_output(raw)

    run_id = f"af_{hex(int(time.time()))[2:][:6]}"
    result = {
        "run_id": run_id,
        "processing_time": f"{elapsed}s",
        "traces": traces,
        "parsed_content": parsed.get("parsed_content", {}),
        "insights": parsed.get("insights", {}).get("insights", []) if isinstance(parsed.get("insights"), dict) else [],
        "impact_analysis": parsed.get("impact_analysis", {}).get("impact_analysis", []) if isinstance(parsed.get("impact_analysis"), dict) else [],
        "actions": parsed.get("actions", {}).get("actions", []) if isinstance(parsed.get("actions"), dict) else [],
        "simulation_result": parsed.get("simulation_result", {}).get("simulation", {}) if isinstance(parsed.get("simulation_result"), dict) else {},
        "final_outcome": parsed.get("final_outcome", {}).get("outcome", {}) if isinstance(parsed.get("final_outcome"), dict) else {},
    }
    
    _save_traces_to_file("analysis", run_id, result)
    
    return result


async def run_simulation_only(action_id: str, action_title: str, action_description: str = "") -> dict:
    """
    Run just the simulation for a specific action.
    """
    start_time = time.time()
    traces = []
    last_raw_response = ""
    session_id = str(uuid.uuid4())

    sim_runner = InMemoryRunner(agent=simulation_engine, app_name=SIM_APP_NAME)

    # Create session FIRST
    sim_session_service = sim_runner.session_service
    sim_user = f"{USER_ID}_sim"
    await sim_session_service.create_session(
        app_name=SIM_APP_NAME,
        user_id=sim_user,
        session_id=session_id,
    )

    import random
    entropy = random.randint(10000, 99999)
    
    # Generate random baseline numbers to force variation
    base_multiplier = random.randint(50, 500)
    improvement_factor = random.uniform(1.15, 1.45)
    
    input_text = f"""Simulate the execution of this action:

Action ID: {action_id}
Action Title: {action_title}
Description: {action_description}

[Simulation Seed: {entropy}] 
[Base Multiplier: {base_multiplier}]
[Improvement Factor: {improvement_factor:.2f}]

CRITICAL INSTRUCTIONS FOR THIS SPECIFIC RUN:
1. You MUST generate UNIQUE numbers for THIS simulation - DO NOT use 1000, 1200, 1250, 50000, or 62500
2. Use the Base Multiplier ({base_multiplier}) to scale your numbers appropriately
3. Apply the Improvement Factor ({improvement_factor:.2f}) to calculate after_state from before_state
4. Choose metric names that match the action context (e.g., if action mentions "sales", use sales/revenue; if "emergency", use response_time/affected_people)
5. Generate realistic before_state values using the multiplier (e.g., orders: {base_multiplier * 2}, revenue: {base_multiplier * 100})
6. Calculate after_state by applying improvement factor to before_state values
7. You MUST use all three tools (mock_api_call, generate_notification, update_dashboard) to demonstrate the simulation

Example structure (DO NOT copy these exact numbers):
{{
  "simulation": {{
    "action_simulated": "{action_title}",
    "status": "complete",
    "before_state": {{"orders": <unique_number>, "revenue": <unique_number>}},
    "after_state": {{"orders": <improved_number>, "revenue": <improved_number>}},
    "improvement_percentage": <calculated_percentage>,
    "execution_logs": [<realistic_logs>],
    "notifications_sent": [<notification_results>]
  }}
}}"""

    user_message = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=input_text)]
    )

    async for event in sim_runner.run_async(
        user_id=sim_user,
        session_id=session_id,
        new_message=user_message,
    ):
        trace_entry = {
            "agent": getattr(event, "author", "simulation_engine"),
            "timestamp": round(time.time() - start_time, 3),
        }
        if hasattr(event, "content") and event.content:
            if hasattr(event.content, "parts") and event.content.parts:
                text_parts = [p.text for p in event.content.parts if hasattr(p, "text") and p.text]
                if text_parts:
                    full_text = text_parts[0]
                    last_raw_response = full_text
                    traces.append({**trace_entry, "type": "reasoning", "content": full_text[:500]})

        if hasattr(event, "tool_calls") and event.tool_calls:
            for tc in event.tool_calls:
                tool_name = getattr(tc, "name", str(tc))
                traces.append({**trace_entry, "type": "tool_call", "tool": tool_name, "content": f"Tool: {tool_name}"})

    # Get result from session or traces
    sim_result = {}
    try:
        session = await sim_session_service.get_session(
            app_name=SIM_APP_NAME,
            user_id=sim_user,
            session_id=session_id,
        )
        raw = "{}"
        if session and session.state:
            raw = session.state.get("simulation_result", "{}")
            
        # If ADK failed to populate state (e.g. due to markdown fences), use last_raw_response
        if raw == "{}" or not raw:
            if last_raw_response and "{" in last_raw_response:
                raw = last_raw_response
                    
        sim_result = _parse_json_output(raw)
    except Exception as e:
        sim_result = {"error": str(e), "raw_extracted": raw}

    elapsed = round(time.time() - start_time, 1)

    run_id = f"sim_{hex(int(time.time()))[2:][:6]}"
    result = {
        "run_id": run_id,
        "processing_time": f"{elapsed}s",
        "traces": traces,
        "simulation": sim_result.get("simulation", sim_result) if isinstance(sim_result, dict) else sim_result,
    }
    
    _save_traces_to_file("simulation", run_id, result)
    
    return result
