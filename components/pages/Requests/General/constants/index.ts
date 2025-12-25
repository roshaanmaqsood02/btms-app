export interface General {
  attendence_id: string;
  name: string;
  dates: string;
  detail: string;
  hr_approval: "PENDING" | "DECLINED" | "APPROVED";
}

export const dummyGeneral: General[] = [
  {
    attendence_id: "123",
    name: "Roshaan Maqsood",
    dates: "2025-12-22",
    detail: "BTMS",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "122",
    name: "Roshaan Rajpoot",
    dates: "2025-12-21",
    detail: "BTMS",
    hr_approval: "PENDING",
  },
];
