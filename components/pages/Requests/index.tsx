"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import Leave from "./Leave";
import Reimbursement from "./Reimbursement";
import Loan from "./Loan";
import AdvnaceSalary from "./AdvnaceSalary";
import WorkFromHome from "./WorkFromHome";
import General from "./General";
import OverTime from "./OverTime";

type RequestsPropa = {
  id: string;
};

type TabValues =
  | "leave"
  | "reimbursement"
  | "loan"
  | "advance_salary"
  | "work_from_home"
  | "general"
  | "over_time";

const Requests = ({ id }: RequestsPropa) => {
  const [tabValue, setTabValue] = useState<TabValues>("leave");

  return (
    <div className="p-5">
      <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as TabValues)}>
        {/* Tabs header */}
        <TabsList className="relative flex w-full gap-6 bg-gray-200 px-4">
          {[
            { label: "Leave", value: "leave" },
            { label: "Reimbursement", value: "reimbursement" },
            { label: "Loan", value: "loan" },
            { label: "Advance Salary", value: "advance_salary" },
            { label: "Work From Home", value: "work_from_home" },
            { label: "General", value: "general" },
            { label: "Over Time", value: "over_time" },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="
                group relative flex flex-col items-center
                rounded-none bg-transparent px-2 py-3
                text-lg font-semibold text-gray-600
                data-[state=active]:text-[#6039BB]
              "
            >
              <span>{tab.label}</span>

              {/* Active indicator */}
              <span
                className="
                  absolute -bottom-[4px]
                  h-[2px] w-full
                  bg-transparent
                  group-data-[state=active]:bg-[#19C9D1]
                  transition-all
                "
              />
            </TabsTrigger>
          ))}

          {/* Full-width bottom border */}
          <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gray-300" />
        </TabsList>

        {/* Tab content */}
        <div className="mt-6">
          <TabsContent value="leave">
            <Leave />
          </TabsContent>

          <TabsContent value="reimbursement">
            <Reimbursement />
          </TabsContent>

          <TabsContent value="loan">
            <Loan />
          </TabsContent>

          <TabsContent value="advance_salary">
            <AdvnaceSalary />
          </TabsContent>

          <TabsContent value="work_from_home">
            <WorkFromHome />
          </TabsContent>

          <TabsContent value="general">
            <General />
          </TabsContent>

          <TabsContent value="over_time">
            <OverTime />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Requests;
