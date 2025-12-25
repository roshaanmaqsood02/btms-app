export interface AdvanceSalary {
  attendence_id: string;
  name: string;
  date: string;
  amount: string;
  hr_approval: "PENDING" | "DECLINED" | "APPROVED";
}

export const dummyAdvanceSalary: AdvanceSalary[] = [
  {
    attendence_id: "123",
    name: "Roshaan Maqsood",
    date: "2025-12-22",
    amount: "Rs. 100000",
    hr_approval: "APPROVED",
  },
  {
    attendence_id: "122",
    name: "Talha Dev",
    date: "2025-12-22",
    amount: "Rs. 200000",
    hr_approval: "DECLINED",
  },
  {
    attendence_id: "121",
    name: "Ayyaz boota",
    date: "2025-12-22",
    amount: "Rs. 300000",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "120",
    name: "Shawaiz Saeed",
    date: "2025-12-22",
    amount: "Rs. 400000",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "111",
    name: "Usman Khan",
    date: "2025-12-22",
    amount: "Rs. 500000",
    hr_approval: "APPROVED",
  },
  {
    attendence_id: "112",
    name: "Nasir Dev",
    date: "2025-12-22",
    amount: "Rs. 600000",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "114",
    name: "Daud Dev",
    date: "2025-12-22",
    amount: "Rs. 700000",
    hr_approval: "APPROVED",
  },
  {
    attendence_id: "113",
    name: "Fraz Ahmed",
    date: "2025-12-22",
    amount: "Rs. 800000",
    hr_approval: "DECLINED",
  },
  {
    attendence_id: "125",
    name: "Ahsan Ahmed",
    date: "2025-12-22",
    amount: "Rs. 900000",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "101",
    name: "Umar Khan",
    date: "2025-12-22",
    amount: "Rs. 1000000",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "133",
    name: "Moeen Ali",
    date: "2025-12-22",
    amount: "Rs. 1100000",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "109",
    name: "Aaliyan Asif",
    date: "2025-12-22",
    amount: "Rs. 1200000",
    hr_approval: "APPROVED",
  },
  {
    attendence_id: "108",
    name: "Shabaz Salvi",
    date: "2025-12-22",
    amount: "Rs. 1300000",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "172",
    name: "Faizan Ahmed",
    date: "2025-12-22",
    amount: "Rs. 1500000",
    hr_approval: "APPROVED",
  },
];
