"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ChartRadialText } from "./components/charts/EmployeePieChart";
import { InterneeChartRadialText } from "./components/charts/InternsPieChart";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileImage from "@/public/images/dashboard_image.jpg";
import Image from "next/image";
import PayrollChart from "./components/charts/PayrollChart";
import AttendanceBar from "./components/AttendanceBar";

export default function Dashboard() {
  const images = ["/images/dashboard_image.jpg", "/images/shahbaz_pm.png"];

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 p-5">
      {/* Header */}
      <header className="px-4 py-3 bg-[#6039BB] rounded-lg text-white text-xl font-semibold">
        Your dedication to your work is helping lead us to success!
      </header>

      {/* Main Section */}
      <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
        {/* Left Column - Smooth Carousel */}
        <section className="bg-card rounded-md p-4 relative overflow-hidden">
          {/* Slider */}
          <div
            className="flex h-[290px] transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {images.map((src, index) => (
              <div
                key={index}
                className="min-w-full flex items-center justify-center"
              >
                <img
                  src={src}
                  alt={`Slide ${index + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* Left Chevron */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-gray-600 rounded-full p-2"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          {/* Right Chevron */}
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-gray-600 rounded-full p-2"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </section>

        {/* Right Column */}
        <section>
          <ChartRadialText />
        </section>

        <section>
          <InterneeChartRadialText />
        </section>
      </div>

      {/* Team Members & Birthday Section */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="bg-card rounded-md p-5 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Team Members</h2>
            <button className="text-xl font-semibold text-[#19C9D1] hover:underline">
              View All
            </button>
          </div>

          {/* Team List */}
          <div className="space-y-6">
            {[
              {
                role: "Backend Developers",
                initials: ["A", "R", "S"],
              },
              {
                role: "Software Quality Assurance Engineer",
                initials: ["M", "H"],
              },
              {
                role: "SQA Internee",
                initials: ["J"],
              },
            ].map((team, index) => (
              <div key={index} className="flex items-center justify-between">
                {/* Left - Role */}
                <p className="text-lg font-medium capitalize text-gray-700">
                  {team.role}
                </p>

                {/* Right - Avatars */}
                <div className="flex -space-x-2">
                  {team.initials.map((letter, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-[#6039BB] text-white text-sm font-semibold flex items-center justify-center border-2 border-white"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="bg-card rounded-md p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contract Expiry (18)</h2>
            <button className="text-xl font-semibold text-[#19C9D1] hover:underline">
              View All
            </button>
          </div>

          {/* List */}
          <div className="space-y-6">
            {/* Mahruk TR */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-100">
                  <Image
                    src={ProfileImage}
                    alt="avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    MT
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Mahruk TR</span>
                </div>
              </div>

              <div className="bg-red-100 px-4 py-2">
                <h2 className="text-xl font-semibold text-red-500">
                  Sat, Mar 01
                </h2>
              </div>
            </div>

            {/* Shahbaz PM */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-100">
                  <Image
                    src={ProfileImage}
                    alt="avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    SP
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Shahbaz PM</span>
                </div>
              </div>

              <div className="bg-red-100 px-4 py-2">
                <h2 className="text-xl font-semibold text-red-500">
                  Mon, Mar 10
                </h2>
              </div>
            </div>

            {/* Fazian TL */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-100">
                  <Image
                    src={ProfileImage}
                    alt="avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    FT
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Fazian TL</span>
                </div>
              </div>

              <div className="bg-red-100 px-4 py-2">
                <h2 className="text-xl font-semibold text-red-500">
                  Fri, Mar 15
                </h2>
              </div>
            </div>
          </div>
        </section>
        {/* Contract Reveal */}
        <section className="bg-card rounded-md p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Contract Renewal (5)</h2>
            <button className="text-xl font-semibold text-[#19C9D1] hover:underline">
              View All
            </button>
          </div>

          {/* List */}
          <div className="space-y-6">
            {/* Mahruk TR */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-100">
                  <Image
                    src={ProfileImage}
                    alt="avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    MT
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Mahruk TR</span>
                </div>
              </div>

              <div className="">
                <h2 className="text-lg font-semibold text-[#19C9D1]">
                  Fri, Mar 15
                </h2>
              </div>
            </div>

            {/* Shahbaz PM */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-100">
                  <Image
                    src={ProfileImage}
                    alt="avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    SP
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Shahbaz PM</span>
                </div>
              </div>

              <div className="">
                <h2 className="text-lg font-semibold text-[#19C9D1]">
                  Fri, Mar 15
                </h2>
              </div>
            </div>

            {/* Fazian TL */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-gray-100">
                  <Image
                    src={ProfileImage}
                    alt="avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    FT
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">Fazian TL</span>
                </div>
              </div>

              <div className="">
                <h2 className="text-lg font-semibold text-[#19C9D1]">
                  Fri, Mar 15
                </h2>
              </div>
            </div>
          </div>
        </section>
        {/* Payroll analyst */}
        <section className="bg-card rounded-md p-5 space-y-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Payroll Analytics</h2>
          </div>

          {/* Chart Container */}
          <div className="pt-4">
            <PayrollChart />
          </div>
        </section>

        {/* Requests */}
        <section className="bg-card rounded-md p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Request (7)</h2>
            <button className="text-xl font-semibold text-[#19C9D1] hover:underline">
              View All
            </button>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg">LEAVE</p>
            <p className="text-lg">2</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg">GENERAL_REQUEST</p>
            <p className="text-lg">2</p>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-lg">REQUEST_FROM_HOME</p>
            <p className="text-lg">3</p>
          </div>
        </section>

        {/* Next Raise */}
        <section className="bg-card rounded-md p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Next Raise</h2>
            <button className="text-xl font-semibold text-[#19C9D1] hover:underline">
              View All
            </button>
          </div>
        </section>

        {/* Late Coming Employees */}
        <section className="bg-card rounded-md p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Late Coming Employees</h2>
            <button className="text-xl font-semibold text-[#19C9D1] hover:underline">
              View All
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-gray-100">
                <Image
                  src={ProfileImage}
                  alt="avatar"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  FT
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Fazian TL</span>
              </div>
            </div>

            <div className="">
              <h2 className="font-semibold text-[#19C9D1]">Late 7 days</h2>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-gray-100">
                <Image
                  src={ProfileImage}
                  alt="avatar"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  FT
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Fazian TL</span>
              </div>
            </div>

            <div className="">
              <h2 className="font-semibold text-[#19C9D1]">Late 8 days</h2>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-gray-100">
                <Image
                  src={ProfileImage}
                  alt="avatar"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  FT
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">Fazian TL</span>
              </div>
            </div>

            <div className="">
              <h2 className="font-semibold text-[#19C9D1]">Late 13 days</h2>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-md p-5 space-y-4">
          <h2 className="text-lg font-semibold">Weekly Attendance</h2>

          {/* Monday */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Monday</p>
              <p className="text-gray-400 text-sm">2025-12-22</p>
            </div>
            <div className="flex flex-col w-1/3">
              <p className="font-medium">16 P / 20 A</p>
              <AttendanceBar present={16} absent={20} />
            </div>
          </div>

          {/* Tuesday */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Tuesday</p>
              <p className="text-gray-400 text-sm">2025-12-23</p>
            </div>
            <div className="flex flex-col w-1/3">
              <p className="font-medium">16 P / 20 A</p>
              <AttendanceBar present={16} absent={20} />
            </div>
          </div>

          {/* Wednesday */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Wednesday</p>
              <p className="text-gray-400 text-sm">2025-12-24</p>
            </div>
            <div className="flex flex-col w-1/3">
              <p className="font-medium">19 P / 17 A</p>
              <AttendanceBar present={19} absent={17} />
            </div>
          </div>

          {/* Thursday */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Thursday</p>
              <p className="text-gray-400 text-sm">2025-12-25</p>
            </div>
            <div className="flex flex-col w-1/3">
              <p className="font-medium">17 P / 19 A</p>
              <AttendanceBar present={17} absent={19} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
