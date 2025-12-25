// components/AttendanceBar.tsx
interface AttendanceBarProps {
  present: number;
  absent: number;
}

const AttendanceBar = ({ present, absent }: AttendanceBarProps) => {
  const total = present + absent;
  const presentWidth = (present / total) * 100;
  const absentWidth = (absent / total) * 100;

  return (
    <div className="flex items-center gap-4 w-full">
      {/* Right side - bar only */}
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
        <div
          className="h-3 bg-[#19C9D1]"
          style={{ width: `${presentWidth}%` }}
        />
        <div
          className="h-3 bg-[#DA6021]"
          style={{ width: `${absentWidth}%` }}
        />
      </div>
    </div>
  );
};

export default AttendanceBar;
