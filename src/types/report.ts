export type ReportStatus = 'TERKIRIM' | 'DITINJAU_SATGAS' | 'INVESTIGASI' | 'SELESAI';

export interface TimelineLog {
  timestamp: string;
  stage: string;
  description: string;
}

export interface ReportRecord {
  ticketCode: string;        
  dateIncident: string;
  location: string;
  description: string;
  evidenceFileName?: string;
  status: ReportStatus;
  createdAt: string;
  timeline: TimelineLog[];
}