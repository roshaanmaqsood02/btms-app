export interface PayrollData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    barPercentage?: number;
    categoryPercentage?: number;
  }[];
}

export interface PayrollChartProps {
  data?: PayrollData;
  height?: number;
}
