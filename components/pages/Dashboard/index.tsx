import { ChartRadialText } from "./components/PieChart";

export default function Dashboard() {
  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <header className="px-4 py-3 bg-[#6039BB] rounded-lg text-white text-xl font-semibold">
        Your dedication to your work is helping lead us to success!
      </header>

      {/* Main Section */}
      <div className="grid grid-cols-[2fr_1fr] gap-3">
        {/* Left Column */}
        <section className="row-span-2 bg-card rounded-md p-5"></section>

        {/* Right Column */}
        <section className="">
          <ChartRadialText />
        </section>
      </div>

      {/* Team Members & Birthday Section */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="bg-card rounded-md p-5"></section>
        <section className="bg-card rounded-md p-5"></section>
      </div>
    </div>
  );
}
