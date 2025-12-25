export interface WorkFromHome {
  attendence_id: string;
  name: string;
  wfhType: "WFH_SHORT_DAY" | "WFH_HALF_DAY" | "WFH_FULL_DAY";
  totalDays: number;
  dates: string;
  pm_approval: "PENDING" | "DECLINED" | "APPROVED";
  hr_approval: "PENDING" | "DECLINED" | "APPROVED";
}

export const dummyWorkFromHome: WorkFromHome[] = [
  {
    attendence_id: "123",
    name: "Roshaan Maqsood",
    wfhType: "WFH_HALF_DAY",
    totalDays: 1,
    dates: "2025-12-12",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "124",
    name: "Ayyaz Boota",
    wfhType: "WFH_HALF_DAY",
    totalDays: 1,
    dates: "2025-12-13",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "125",
    name: "Talha Dev",
    wfhType: "WFH_SHORT_DAY",
    totalDays: 1,
    dates: "2025-12-14",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "113",
    name: "Roshaan Maqsood",
    wfhType: "WFH_HALF_DAY",
    totalDays: 1,
    dates: "2025-12-12",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "174",
    name: "Nasir Dev",
    wfhType: "WFH_FULL_DAY",
    totalDays: 1,
    dates: "2025-12-21",
    pm_approval: "APPROVED",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "121",
    name: "Dawood Dev",
    wfhType: "WFH_HALF_DAY",
    totalDays: 1,
    dates: "2025-12-22",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "177",
    name: "Fraz Ahmed",
    wfhType: "WFH_HALF_DAY",
    totalDays: 1,
    dates: "2025-12-27",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "181",
    name: "Shaban Khawar",
    wfhType: "WFH_FULL_DAY",
    totalDays: 1,
    dates: "2025-12-30",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "119",
    name: "Aaliyan",
    wfhType: "WFH_HALF_DAY",
    totalDays: 1,
    dates: "2025-12-18",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "45",
    name: "Faizan Ahmed",
    wfhType: "WFH_SHORT_DAY",
    totalDays: 1,
    dates: "2025-12-15",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "78",
    name: "Shahbaz Salvi",
    wfhType: "WFH_HALF_DAY",
    totalDays: 1,
    dates: "2025-12-02",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
  {
    attendence_id: "132",
    name: "Saad Dev",
    wfhType: "WFH_SHORT_DAY",
    totalDays: 1,
    dates: "2025-12-31",
    pm_approval: "PENDING",
    hr_approval: "PENDING",
  },
];
