import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

interface CalcHistoryState {
  history: HistoryEntry[];
  addEntry: (expression: string, result: string) => void;
  clearHistory: () => void;
  lastResult: string;
}

const CalcHistoryContext = createContext<CalcHistoryState | null>(null);
const STORAGE_KEY = 'calcproste_history';
const MAX_ENTRIES = 100;

export function CalcHistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastResult, setLastResult] = useState('0');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as HistoryEntry[];
          setHistory(parsed);
          if (parsed.length > 0) setLastResult(parsed[0].result);
        } catch {}
      }
    });
  }, []);

  const addEntry = useCallback((expression: string, result: string) => {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      expression,
      result,
      timestamp: Date.now(),
    };
    setHistory(prev => {
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    setLastResult(result);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <CalcHistoryContext.Provider value={{ history, addEntry, clearHistory, lastResult }}>
      {children}
    </CalcHistoryContext.Provider>
  );
}

export function useCalcHistory() {
  const ctx = useContext(CalcHistoryContext);
  if (!ctx) throw new Error('useCalcHistory must be inside CalcHistoryProvider');
  return ctx;
}
