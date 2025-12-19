// data/reimbursements.ts
export interface Reimbursement {
  id: string;
  employeeName: string;
  employeeId: string;
  expenseDate: string;
  category: string;
  description: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  submittedDate: string;
  approvedBy?: string;
  paymentDate?: string;
  receiptUrl?: string;
}

export const dummyReimbursements: Reimbursement[] = [
  {
    id: "REIM001",
    employeeName: "John Doe",
    employeeId: "EMP001",
    expenseDate: "2025-11-10",
    category: "Travel",
    description: "Client meeting transportation",
    amount: 125.75,
    status: "APPROVED",
    submittedDate: "2025-11-11",
    approvedBy: "Jane Manager",
    paymentDate: "2025-11-15",
    receiptUrl: "/receipts/travel-001.pdf",
  },
  {
    id: "REIM002",
    employeeName: "Sarah Smith",
    employeeId: "EMP002",
    expenseDate: "2025-11-12",
    category: "Meals",
    description: "Team lunch",
    amount: 89.5,
    status: "PENDING",
    submittedDate: "2025-11-13",
  },
  {
    id: "REIM003",
    employeeName: "Michael Johnson",
    employeeId: "EMP003",
    expenseDate: "2025-11-08",
    category: "Office Supplies",
    description: "Stationery items",
    amount: 45.2,
    status: "PAID",
    submittedDate: "2025-11-09",
    approvedBy: "Robert Supervisor",
    paymentDate: "2025-11-14",
  },
  {
    id: "REIM004",
    employeeName: "Emily Brown",
    employeeId: "EMP004",
    expenseDate: "2025-11-15",
    category: "Training",
    description: "Online course subscription",
    amount: 199.99,
    status: "REJECTED",
    submittedDate: "2025-11-16",
    approvedBy: "David HR",
  },
  {
    id: "REIM005",
    employeeName: "David Wilson",
    employeeId: "EMP005",
    expenseDate: "2025-11-18",
    category: "Software",
    description: "Annual license renewal",
    amount: 299.0,
    status: "PENDING",
    submittedDate: "2025-11-19",
  },
  {
    id: "REIM006",
    employeeName: "Lisa Taylor",
    employeeId: "EMP006",
    expenseDate: "2025-11-20",
    category: "Travel",
    description: "Conference accommodation",
    amount: 450.0,
    status: "APPROVED",
    submittedDate: "2025-11-21",
    approvedBy: "Mark Director",
  },
  {
    id: "REIM007",
    employeeName: "Robert Miller",
    employeeId: "EMP007",
    expenseDate: "2025-11-22",
    category: "Meals",
    description: "Client dinner",
    amount: 156.8,
    status: "PENDING",
    submittedDate: "2025-11-23",
  },
  {
    id: "REIM008",
    employeeName: "Amanda Davis",
    employeeId: "EMP008",
    expenseDate: "2025-11-25",
    category: "Equipment",
    description: "External monitor",
    amount: 320.0,
    status: "REJECTED",
    submittedDate: "2025-11-26",
    approvedBy: "Sarah Manager",
  },
  {
    id: "REIM009",
    employeeName: "Thomas Anderson",
    employeeId: "EMP009",
    expenseDate: "2025-11-28",
    category: "Internet",
    description: "Home office internet bill",
    amount: 65.5,
    status: "PAID",
    submittedDate: "2025-11-29",
    approvedBy: "John Supervisor",
    paymentDate: "2025-12-03",
  },
  {
    id: "REIM010",
    employeeName: "Jennifer White",
    employeeId: "EMP010",
    expenseDate: "2025-12-01",
    category: "Travel",
    description: "Flight ticket - business trip",
    amount: 580.25,
    status: "APPROVED",
    submittedDate: "2025-12-02",
    approvedBy: "Michael Director",
  },
];
