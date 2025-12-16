export interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  cashFlow: number;
}

export interface FinanceAccount {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface FinanceSettings {
  defaultAccountId?: number;
  autoCategorize: boolean;
  autoReconcile: boolean;
  userId: number;
}
