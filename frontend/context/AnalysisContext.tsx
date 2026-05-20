/**
 * AnalysisContext — Shared state across all screens.
 * Stores the full pipeline response so process/results/simulation screens
 * can access real data without re-fetching.
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type {
  AnalysisResponse,
  Insight,
  ImpactAnalysis,
  Action,
  TraceLog,
  SimulationResult,
  FinalOutcome,
} from '@/services/api';

interface AnalysisState {
  // Input
  content: string;
  contentType: string;

  // Pipeline results
  runId: string;
  processingTime: string;
  traces: TraceLog[];
  insights: Insight[];
  impactAnalysis: ImpactAnalysis[];
  actions: Action[];
  simulationResult: SimulationResult | null;
  finalOutcome: FinalOutcome | null;

  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Mode selection
  mode: 'demo' | 'real';
}

interface AnalysisContextType extends AnalysisState {
  setContent: (content: string, contentType: string) => void;
  setResults: (data: AnalysisResponse) => void;
  setSimulation: (sim: SimulationResult) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setMode: (mode: 'demo' | 'real') => void;
  reset: () => void;
}

const defaultState: AnalysisState = {
  content: '',
  contentType: 'text',
  runId: '',
  processingTime: '',
  traces: [],
  insights: [],
  impactAnalysis: [],
  actions: [],
  simulationResult: null,
  finalOutcome: null,
  isLoading: false,
  error: null,
  mode: 'real', // Default to real mode
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnalysisState>(defaultState);

  const setContent = (content: string, contentType: string) => {
    setState((s) => ({ ...s, content, contentType }));
  };

  const setResults = (data: AnalysisResponse) => {
    setState((s) => ({
      ...s,
      runId: data.run_id,
      processingTime: data.processing_time,
      traces: data.traces || [],
      insights: data.insights || [],
      impactAnalysis: data.impact_analysis || [],
      actions: data.actions || [],
      simulationResult: data.simulation_result || null,
      finalOutcome: data.final_outcome || null,
      isLoading: false,
      error: null,
    }));
  };

  const setSimulation = (sim: SimulationResult) => {
    setState((s) => ({ ...s, simulationResult: sim }));
  };

  const setLoading = (loading: boolean) => {
    setState((s) => ({ ...s, isLoading: loading, error: null }));
  };

  const setError = (error: string | null) => {
    setState((s) => ({ ...s, error, isLoading: false }));
  };

  const setMode = (mode: 'demo' | 'real') => {
    setState((s) => ({ ...s, mode }));
  };

  const reset = () => {
    setState(defaultState);
  };

  return (
    <AnalysisContext.Provider
      value={{
        ...state,
        setContent,
        setResults,
        setSimulation,
        setLoading,
        setError,
        setMode,
        reset,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return ctx;
}
