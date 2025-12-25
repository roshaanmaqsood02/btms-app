export interface OverTime {
  attendence_id: string;
  name: string;
  dates: string;
  overTime: string;
  pm_approval: "PENDING" | "DECLINED" | "APPROVED";
  tl_approval: "PENDING" | "DECLINED" | "APPROVED";
  hr_approval: "PENDING" | "DECLINED" | "APPROVED";
}

export const dummyOverTime: OverTime[] = [
  {
    attendence_id: "123",
    name: "Roshaan Maqsood",
    dates: "2025-12-12",
    overTime: "22:22:22",
    pm_approval: "PENDING",
    tl_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "122",
    name: "Ayyaz Boota",
    dates: "2025-12-21",
    overTime: "02:22:22",
    pm_approval: "PENDING",
    tl_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "121",
    name: "Talha Dev",
    dates: "2025-12-22",
    overTime: "05:00:00",
    pm_approval: "PENDING",
    tl_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "112",
    name: "Nasir Dev",
    dates: "2025-12-24",
    overTime: "06:22:22",
    pm_approval: "PENDING",
    tl_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "111",
    name: "Shawaiz Saeed",
    dates: "2025-12-29",
    overTime: "12:22:22",
    pm_approval: "PENDING",
    tl_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "103",
    name: "Usman Khan",
    dates: "2025-12-15",
    overTime: "22:22:22",
    pm_approval: "PENDING",
    tl_approval: "PENDING",
    hr_approval: "PENDING",
  },
];
