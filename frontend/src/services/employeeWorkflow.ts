import { supabase } from '../lib/supabase';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }
  return supabase;
}

export type WorkflowRequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type WorkflowRequestType = 'Annual leave' | 'Overtime' | 'Shift change' | 'Remote work';

export interface WorkflowRequest {
  id: string;
  employee_email: string;
  employee_name: string;
  request_type: WorkflowRequestType;
  requested_date: string;
  detail: string;
  status: WorkflowRequestStatus;
  reviewer_email?: string | null;
  reviewer_note?: string | null;
  reviewed_at?: string | null;
  created_at: string;
}

export async function listEmployeeRequests(employeeEmail?: string) {
  let query = requireSupabase().from('employee_requests').select('*').order('created_at', { ascending: false });
  if (employeeEmail) query = query.eq('employee_email', employeeEmail);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as WorkflowRequest[];
}

export async function createEmployeeRequest(input: {
  employeeEmail: string;
  employeeName: string;
  type: WorkflowRequestType;
  date: string;
  detail: string;
}) {
  const { data, error } = await requireSupabase().from('employee_requests').insert({
    employee_email: input.employeeEmail,
    employee_name: input.employeeName,
    request_type: input.type,
    requested_date: input.date,
    detail: input.detail,
  }).select('*').single();
  if (error) throw error;
  return data as WorkflowRequest;
}

export async function reviewEmployeeRequest(id: string, status: Exclude<WorkflowRequestStatus, 'Pending'>, reviewerEmail: string, note?: string) {
  const { data, error } = await requireSupabase().from('employee_requests').update({
    status,
    reviewer_email: reviewerEmail,
    reviewer_note: note || null,
    reviewed_at: new Date().toISOString(),
  }).eq('id', id).select('*').single();
  if (error) throw error;
  return data as WorkflowRequest;
}
