export type ExpenseCategory = "Maintenance" | "Tax" | "Salary" | "Utility" | "Other";

export interface Expense {
    id: number;
    title: string;
    category: ExpenseCategory;
    amount: number;
    date: string;
    description?: string;
    fileUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}
