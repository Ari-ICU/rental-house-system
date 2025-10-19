export interface Report {
    id: number;
    name: string;
    type: string;
    generatedAt: string;
    status: "Completed" | "In-Review";
}