export interface Reimbursement {
  attendence_id: string;
  name: string;
  type: "HEALTH";
  receiptDate: string;
  totalExpense: string;
  hr_approval: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
}

export const dummyReimbursements: Reimbursement[] = [
  {
    attendence_id: "123",
    name: "John Doe",
    type: "HEALTH",
    receiptDate: "2025-11-07",
    totalExpense: "Rs. 500",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "122",
    name: "Roshaan Maqsood",
    type: "HEALTH",
    receiptDate: "2025-11-09",
    totalExpense: "Rs. 1000",
    hr_approval: "APPROVED",
  },
  {
    attendence_id: "120",
    name: "Shawaiz Saeed",
    type: "HEALTH",
    receiptDate: "2025-11-12",
    totalExpense: "Rs. 1500",
    hr_approval: "PAID",
  },
  {
    attendence_id: "119",
    name: "Ahsan AHmed",
    type: "HEALTH",
    receiptDate: "2025-11-13",
    totalExpense: "Rs. 500",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "118",
    name: "Talha Dev",
    type: "HEALTH",
    receiptDate: "2025-11-02",
    totalExpense: "Rs. 500",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "117",
    name: "Aaliyan Asif",
    type: "HEALTH",
    receiptDate: "2025-11-17",
    totalExpense: "Rs. 500",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "117",
    name: "Shabaz Salvi",
    type: "HEALTH",
    receiptDate: "2025-11-22",
    totalExpense: "Rs. 500",
    hr_approval: "APPROVED",
  },
  {
    attendence_id: "116",
    name: "Nasir Dev",
    type: "HEALTH",
    receiptDate: "2025-11-30",
    totalExpense: "Rs. 2500",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "115",
    name: "Ayyaz Boota",
    type: "HEALTH",
    receiptDate: "2025-11-01",
    totalExpense: "Rs. 1500",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "114",
    name: "Daud Dev",
    type: "HEALTH",
    receiptDate: "2025-11-29",
    totalExpense: "Rs. 3500",
    hr_approval: "REJECTED",
  },
  {
    attendence_id: "113",
    name: "Ahmed Rasool",
    type: "HEALTH",
    receiptDate: "2025-11-05",
    totalExpense: "Rs 4500",
    hr_approval: "PAID",
  },
  {
    attendence_id: "112",
    name: "Faizan Ahmed",
    type: "HEALTH",
    receiptDate: "2025-11-10",
    totalExpense: "Rs. 4000",
    hr_approval: "PENDING",
  },
];
