export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  clientId?: number;
  projectId?: number;
}

export interface ReportRow {
  date: string;
  clientId: number;
  clientName: string;
  projectId: number;
  projectName: string;
  hours: number;
  income: number;
}

export interface ReportChartSeries {
  dates: string[];
  revenue: number[];
  hours: number[];
}

export interface ReportOutput {
  totalHours: number;
  totalIncome: number;
  rows: ReportRow[];
  chart: ReportChartSeries;
}

