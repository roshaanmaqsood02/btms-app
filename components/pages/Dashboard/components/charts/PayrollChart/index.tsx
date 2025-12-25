// components/PayrollChart.tsx
"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PayrollChart = () => {
  const labels = [
    "2025 Nov",
    "2025 Sep",
    "2025 Jul",
    "2025 May",
    "2025 Mar",
    "2025 Jan",
    "2024 Nov",
    "2024 Sep",
    "2024 Jul",
    "2024 Apr",
    "2024 Feb",
    "2023 Dec",
    "2022 Nov",
  ];

  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label: "Basic Salary",
        data: [
          18000000, 17500000, 17000000, 16500000, 16000000, 15500000, 15000000,
          14500000, 14000000, 13500000, 13000000, 12500000, 12000000,
        ],
        backgroundColor: "#4F46E5",
        barThickness: 20,
      },
      {
        label: "Allowances",
        data: [
          3500000, 3300000, 3100000, 2900000, 2700000, 2500000, 2300000,
          2100000, 1900000, 1700000, 1500000, 1300000, 1100000,
        ],
        backgroundColor: "#8B5CF6",
        barThickness: 20,
      },
      {
        label: "OverTime",
        data: [
          2200000, 2100000, 2000000, 1900000, 1800000, 1700000, 1600000,
          1500000, 1400000, 1300000, 1200000, 1100000, 1000000,
        ],
        backgroundColor: "#F59E0B",
        barThickness: 20,
      },
      {
        label: "Reimbursement",
        data: [
          1800000, 1700000, 1600000, 1500000, 1400000, 1300000, 1200000,
          1100000, 1000000, 900000, 800000, 700000, 600000,
        ],
        backgroundColor: "#10B981",
        barThickness: 20,
      },
      {
        label: "Taxes",
        data: [
          4500000, 4300000, 4100000, 3900000, 3700000, 3500000, 3300000,
          3100000, 2900000, 2700000, 2500000, 2300000, 2100000,
        ],
        backgroundColor: "#EF4444",
        barThickness: 20,
      },
      {
        label: "Deductions",
        data: [
          1500000, 1400000, 1300000, 1200000, 1100000, 1000000, 900000, 800000,
          700000, 600000, 500000, 400000, 300000,
        ],
        backgroundColor: "#6B7280",
        barThickness: 20,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "center",
        labels: {
          boxWidth: 8,
          boxHeight: 8,
          padding: 8,
          font: { size: 9 },
          usePointStyle: true,
          pointStyle: "rect",
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0,0,0,0.85)",
        titleFont: { size: 11 },
        bodyFont: { size: 10 },
        padding: 6,
        callbacks: {
          label(context) {
            let label = context.dataset.label || "";
            if (label) label += ": ";

            const value = context.raw as number;
            const isNegative =
              context.dataset.label === "Taxes" ||
              context.dataset.label === "Deductions";

            const displayValue = isNegative ? -value : value;

            if (Math.abs(displayValue) >= 1_000_000) {
              label += `${displayValue < 0 ? "-" : ""}$${
                Math.abs(displayValue) / 1_000_000
              }M`;
            } else {
              label += `${displayValue < 0 ? "-" : ""}$${
                Math.abs(displayValue) / 1_000
              }K`;
            }
            return label;
          },
          footer(items) {
            const total = items.reduce((sum, item) => {
              const value = item.raw as number;
              const isNegative =
                item.dataset.label === "Taxes" ||
                item.dataset.label === "Deductions";
              return sum + (isNegative ? -value : value);
            }, 0);

            return `Net Salary: $${(total / 1_000_000).toFixed(1)}M`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: {
          font: { size: 8 },
          maxRotation: 45,
          minRotation: 45,
          color: "#64748B",
        },
        grid: {
          color: "#E5E7EB",
        },
      },
      y: {
        stacked: true,
        min: -5_000_000,
        max: 30_000_000,
        ticks: {
          stepSize: 5_000_000,
          font: { size: 8 },
          color: "#64748B",
          callback(value) {
            const val = Number(value);
            if (val === 0) return "$0";
            return val >= 0
              ? `$${val / 1_000_000}M`
              : `-$${Math.abs(val) / 1_000_000}M`;
          },
        },
        grid: {
          color: "#E5E7EB",
        },
      },
    },
  };

  return (
    <div className="w-full h-[280px]">
      <Bar data={data} options={options} />
    </div>
  );
};

export default PayrollChart;
