import { reports as seedReports } from '../data/mockData';

export type ReportRecord = (typeof seedReports)[number];

const STORAGE_KEY = 'eris-reports';

export function loadReports(): ReportRecord[] {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(stored) ? stored : seedReports;
  } catch {
    return seedReports;
  }
}

export function saveReports(reports: ReportRecord[]) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}
