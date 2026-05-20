/**
 * AetherFlow API Client
 * Centralized service for all backend communication.
 */

import { Platform } from 'react-native';

// 🔧 PRODUCTION BACKEND URL
// Replace this with your deployed backend URL after deployment
const PRODUCTION_API_URL = 'https://your-backend-url.com'; // Update this after deploying backend

// 🔧 LOCAL DEVELOPMENT
const LOCAL_IP = 'YOUR_LOCAL_IP'; // For physical device testing

const getBaseUrl = () => {
  // PRODUCTION MODE: Use deployed backend
  if (!__DEV__) {
    return PRODUCTION_API_URL;
  }
  
  // DEVELOPMENT MODE: Use local backend
  if (Platform.OS === 'android') {
    if (LOCAL_IP !== 'YOUR_LOCAL_IP') {
      return `http://${LOCAL_IP}:8000`;
    }
    return 'http://10.0.2.2:8000';
  }
  
  if (Platform.OS === 'ios' && LOCAL_IP !== 'YOUR_LOCAL_IP') {
    return `http://${LOCAL_IP}:8000`;
  }
  
  return 'http://localhost:8000';
};

const API_BASE = getBaseUrl();

// ─── Types ──────────────────────────────────────────────────────────
export interface Insight {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  evidence: string[];
  icon: string;
}

export interface ImpactAnalysis {
  insight_id: string;
  revenue_impact: string;
  operational_risk: string;
  customer_trust: string;
  time_sensitivity: string;
  cascade_effects: string[];
  impact_summary: string;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  projected_lift: string;
  reasoning: string;
  priority: string;
  simulation_target: {
    metric: string;
    before_value: number;
    projected_after: number;
    unit: string;
  };
  estimated_cost: string;
  timeline: string;
}

export interface TraceLog {
  agent: string;
  timestamp: number;
  type: string;
  content?: string;
  tool?: string;
}

export interface SimulationResult {
  action_simulated?: string;
  status?: string;
  execution_logs?: any[];
  before_state?: any;
  after_state?: any;
  net_lift?: string;
  improvement_percentage?: number;
  api_calls?: any[];
  notifications?: any[];
  notifications_sent?: any[];
  dashboard_updates?: any[];
}

export interface FinalOutcome {
  run_id: string;
  confidence_score: number;
  processing_time: string;
  summary: string;
  before_state: { sales: number; revenue: number; description: string };
  after_state: { sales: number; revenue: number; description: string };
  net_lift_percent: number;
  roi_estimate: string;
  system_changes: string[];
  agent_pipeline: { step: number; agent: string; status: string; duration: string }[];
}

export interface AnalysisResponse {
  run_id: string;
  processing_time: string;
  traces: TraceLog[];
  parsed_content: any;
  insights: Insight[];
  impact_analysis: ImpactAnalysis[];
  actions: Action[];
  simulation_result: SimulationResult;
  final_outcome: FinalOutcome;
}

// ─── API Functions ──────────────────────────────────────────────────

export async function analyzeContent(
  content: string,
  contentType: string = 'text',
  pdfBase64?: string,
  isRomanUrdu?: boolean, // ADDED: Roman Urdu flag
): Promise<AnalysisResponse> {
  const resp = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      content_type: contentType,
      pdf_base64: pdfBase64,
      is_roman_urdu: isRomanUrdu || false, // ADDED: Include flag in request
    }),
  });

  if (!resp.ok) {
    throw new Error(`Analysis failed: ${resp.status} ${resp.statusText}`);
  }

  const json = await resp.json();
  if (!json.success) {
    throw new Error('Analysis pipeline returned an error');
  }
  return json.data as AnalysisResponse;
}

export async function runSimulation(
  actionId: string,
  actionTitle: string,
  actionDescription: string = '',
): Promise<{ processing_time: string; traces: TraceLog[]; simulation: SimulationResult }> {
  const resp = await fetch(`${API_BASE}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action_id: actionId,
      action_title: actionTitle,
      action_description: actionDescription,
    }),
  });

  if (!resp.ok) {
    throw new Error(`Simulation failed: ${resp.status} ${resp.statusText}`);
  }

  const json = await resp.json();
  if (!json.success) {
    throw new Error('Simulation returned an error');
  }
  return json.data;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const resp = await fetch(`${API_BASE}/api/health`);
    return resp.ok;
  } catch {
    return false;
  }
}
