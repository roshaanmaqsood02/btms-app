"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import PersonalInfo from "./AddPersonalInfo";
import OfficialInfo from "./AddOfficialInfo";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateUserMutation } from "@/redux/services/userApi";
import { useCreateEmployeeContractMutation } from "@/redux/services/contractApi";
import { useCreateEducationMutation } from "@/redux/services/educationApi"; // ← NEW IMPORT
import { selectCurrentUser } from "@/redux/slices/authSlice";
import { useAppSelector } from "@/redux/hook";
import { CreateContractRequest } from "@/redux/types/contract.type";
import CreateEducationInfo from "./AddEducationInfo";
import { Badge } from "@/components/ui/badge";

interface AddUserProps {
  id?: string;
}

type TabValues =
  | "personal_info"
  | "official_info"
  | "education"
  | "assets"
  | "credentials";

// Education item type
interface EducationItem {
  id?: number;
  degree: string;
  fieldOfStudy: string;
  institution: string;
  startYear: number;
  endYear?: number;
  grade?: string;
  gradeScale?: string;
  description?: string;
}

export default function AddUser({}: AddUserProps) {
  const router = useRouter();
  const [tabValue, setTabValue] = useState<TabValues>("personal_info");
  const currentUser = useAppSelector(selectCurrentUser);

  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [createEmployeeContract] = useCreateEmployeeContractMutation();
  const [createEducation] = useCreateEducationMutation(); // ← NEW MUTATION

  // Complete form state
  const [formData, setFormData] = useState({
    // Personal Info
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    gender: "male" as string,
    city: "",
    province: "",
    country: "",
    phone: "",
    postalCode: "",
    department: "",
    projects: [] as string[],
    positions: [] as string[],
    systemRole: "EMPLOYEE" as any,
    // Official Info
    employeeId: "",
    attendanceId: "",
    salary: "",
    employeeStatus: "EMPLOYEED" as CreateContractRequest["employeeStatus"],
    jobType: "FULL_TIME" as CreateContractRequest["jobType"],
    designation: "",
    position: "",
    reportingHr: "",
    reportingManager: "",
    reportingTeamLead: "",
    joiningDate: "",
    contractStart: "",
    contractEnd: "",
    shift: "MORNING" as CreateContractRequest["shift"],
    workLocation: "ON_SITE" as CreateContractRequest["workLocation"],
    // Education
    educationRecords: [] as EducationItem[],
  });

  // Handle form data changes
  const handlePersonalInfoChange = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleOfficialInfoChange = (data: any) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const handleEducationAdded = (educationData: EducationItem) => {
    setFormData((prev) => ({
      ...prev,
      educationRecords: [...prev.educationRecords, educationData],
    }));
    toast.success("Education record added");
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.firstname.trim() || !formData.lastname.trim()) {
        toast.error("Validation Error", {
          description: "First name and last name are required",
        });
        setTabValue("personal_info");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Validation Error", {
          description: "Email is required",
        });
        setTabValue("personal_info");
        return;
      }
      if (!formData.password.trim()) {
        toast.error("Validation Error", {
          description: "Password is required",
        });
        setTabValue("personal_info");
        return;
      }

      // Check permissions for HRM
      if (currentUser?.systemRole === "HRM") {
        const hrAllowedRoles = [
          "EMPLOYEE",
          "PROJECT_MANAGER",
          "OPERATION_MANAGER",
        ];
        if (
          formData.systemRole &&
          !hrAllowedRoles.includes(formData.systemRole)
        ) {
          toast.error("Permission Denied", {
            description:
              "HRM can only create EMPLOYEE, PROJECT_MANAGER, or OPERATION_MANAGER roles",
          });
          return;
        }
      }

      // Prepare user data for API
      const userData: any = {
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        gender: formData.gender,
        systemRole: formData.systemRole,
      };

      // Add optional personal fields
      if (formData.city.trim()) userData.city = formData.city;
      if (formData.province.trim()) userData.province = formData.province;
      if (formData.country.trim()) userData.country = formData.country;
      if (formData.phone.trim()) userData.phone = formData.phone;
      if (formData.postalCode.trim()) userData.postalCode = formData.postalCode;
      if (formData.department.trim()) userData.department = formData.department;
      if (formData.projects.length > 0) userData.projects = formData.projects;
      if (formData.positions.length > 0)
        userData.positions = formData.positions;

      console.log("Creating user with data:", userData);

      // Step 1: Create the user
      const userResult = await createUser(userData).unwrap();
      console.log("User created:", userResult);

      // Step 2: Prepare and create contract
      const contractData: CreateContractRequest = {
        employeeStatus: formData.employeeStatus || "EMPLOYEED",
        jobType: formData.jobType || "FULL_TIME",
        department: formData.department || "Not specified",
        designation: formData.designation || "Employee",
        position: formData.position || formData.designation || "Employee",
        reportingHr: formData.reportingHr || "",
        reportingManager: formData.reportingManager || "",
        reportingTeamLead: formData.reportingTeamLead || "",
        joiningDate:
          formData.joiningDate || new Date().toISOString().split("T")[0],
        contractStart:
          formData.contractStart || new Date().toISOString().split("T")[0],
        contractEnd:
          formData.contractEnd ||
          new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            .toISOString()
            .split("T")[0],
        shift: formData.shift || "MORNING",
        workLocation: formData.workLocation || "ON_SITE",
      };

      await createEmployeeContract({
        userId: userResult.id,
        data: contractData,
      }).unwrap();

      // Step 3: Create education records (if any)
      if (formData.educationRecords.length > 0) {
        try {
          const educationPromises = formData.educationRecords.map((edu) =>
            createEducation({
              userId: userResult.id,
              data: {
                degree: edu.degree,
                fieldOfStudy: edu.fieldOfStudy,
                institution: edu.institution,
                startYear: edu.startYear,
                endYear: edu.endYear,
                grade: edu.grade || undefined,
                gradeScale: edu.gradeScale || undefined,
                description: edu.description || undefined,
              },
            }).unwrap()
          );

          await Promise.all(educationPromises);

          toast.success(
            `${formData.educationRecords.length} education record(s) created successfully`
          );
        } catch (eduError: any) {
          console.error("Failed to create education records:", eduError);
          toast.warning("Education records could not be saved", {
            description:
              "User created successfully. Add education later from profile.",
          });
          // Continue — user and contract are already created
        }
      }

      toast.success("User created successfully!", {
        description: `${userResult.firstname} ${
          userResult.lastname
        } has been added with contract${
          formData.educationRecords.length > 0 ? " and education" : ""
        }`,
      });

      router.push("/users");
    } catch (error: any) {
      console.error("Create user error:", error);

      if (error?.originalStatus || error?.status) {
        // Contract or education error (user may have been created)
        const errorMessage =
          error?.data?.message || "Operation partially failed";
        toast.warning("Partial success", {
          description: errorMessage + ". Check user profile.",
        });
        router.push("/users");
      } else {
        // Full failure (likely user creation)
        const errorMessage =
          error?.data?.message || error?.message || "Failed to create user";
        toast.error("Failed to create user", {
          description: errorMessage,
        });
      }
    }
  };

  const EducationSection = () => {
    const [isAddingEducation, setIsAddingEducation] = useState(false);

    return (
      <div className="bg-white p-10 rounded-2xl">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Education Information
          </h2>
          <p className="text-gray-600">
            Academic qualifications and educational background
          </p>
        </div>

        {/* Education Records List */}
        {formData.educationRecords.length > 0 ? (
          <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">
                Education Records ({formData.educationRecords.length})
              </h3>
              <Button
                onClick={() => setIsAddingEducation(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Another
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.educationRecords.map((education, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {education.degree}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {education.endYear ? "Completed" : "Ongoing"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {education.fieldOfStudy}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {education.institution}
                  </p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {education.startYear}
                      {education.endYear
                        ? ` - ${education.endYear}`
                        : " - Present"}
                    </span>
                    {education.grade && (
                      <span>
                        Grade: {education.grade}
                        {education.gradeScale && ` (${education.gradeScale})`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-gray-400 mb-4">
              <GraduationCap className="h-12 w-12 mx-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              No Education Records Added
            </h4>
            <p className="text-gray-500 mb-4">
              Add education information to complete the user profile
            </p>
          </div>
        )}

        {/* Add Education Form */}
        {isAddingEducation || formData.educationRecords.length === 0 ? (
          <div className="border-t pt-6">
            <CreateEducationInfo
              userId={0}
              onEducationCreated={() => {
                setIsAddingEducation(false);
              }}
              currentUserRole={currentUser?.systemRole}
              onEducationAdded={handleEducationAdded}
            />
            {isAddingEducation && formData.educationRecords.length > 0 && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setIsAddingEducation(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Button
              onClick={() => setIsAddingEducation(true)}
              variant="outline"
              className="w-full py-6 border-dashed"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Education Record
            </Button>
          </div>
        )}

        {/* Info Note */}
        {formData.educationRecords.length > 0 && !isAddingEducation && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> All education records will be saved
                permanently when you click "Create User".
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-5">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New User</h1>
              <p className="text-gray-600">
                Create a new user account in the system
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isCreatingUser}
            className="bg-gradient-to-r from-[#6039BB] to-[#5029AA] hover:from-[#5029AA] hover:to-[#402099] text-white"
          >
            {isCreatingUser ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create User
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tabValue} onValueChange={(v) => setTabValue(v as TabValues)}>
        <TabsList className="relative flex w-full gap-6 bg-gray-200 px-4">
          {[
            { label: "Personal Info", value: "personal_info" },
            { label: "Official Info", value: "official_info" },
            { label: "Education", value: "education" },
            { label: "Assets", value: "assets" },
            { label: "Credentials", value: "credentials" },
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
          <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gray-300" />
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6 px-6">
          <TabsContent value="personal_info">
            <PersonalInfo
              formData={formData}
              onFormDataChange={handlePersonalInfoChange}
              currentUserRole={currentUser?.systemRole}
            />
          </TabsContent>
          <TabsContent value="official_info">
            <OfficialInfo
              formData={formData}
              onFormDataChange={handleOfficialInfoChange}
              currentUserRole={currentUser?.systemRole}
            />
          </TabsContent>
          <TabsContent value="education">
            <EducationSection />
          </TabsContent>
          <TabsContent value="assets">
            <div className="bg-white p-10 rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Assets Information
              </h2>
              <p className="text-gray-600">Company assets assigned to user</p>
              <div className="mt-6 p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 text-lg">
                  Assets section - Coming soon
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="credentials">
            <div className="bg-white p-10 rounded-2xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Credentials Information
              </h2>
              <p className="text-gray-600">User login credentials and access</p>
              <div className="mt-6 p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 text-lg">
                  Credentials section - Coming soon
                </p>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <div className="flex gap-4">
          {tabValue !== "personal_info" && (
            <Button
              variant="outline"
              onClick={() => {
                const tabs: TabValues[] = [
                  "personal_info",
                  "official_info",
                  "education",
                  "assets",
                  "credentials",
                ];
                const currentIndex = tabs.indexOf(tabValue);
                if (currentIndex > 0) {
                  setTabValue(tabs[currentIndex - 1]);
                }
              }}
            >
              Previous
            </Button>
          )}
          {tabValue !== "credentials" && (
            <Button
              className="bg-gradient-to-r from-[#6039BB] to-[#5029AA] hover:from-[#5029AA] hover:to-[#402099] text-white"
              onClick={() => {
                const tabs: TabValues[] = [
                  "personal_info",
                  "official_info",
                  "education",
                  "assets",
                  "credentials",
                ];
                const currentIndex = tabs.indexOf(tabValue);
                if (currentIndex < tabs.length - 1) {
                  setTabValue(tabs[currentIndex + 1]);
                }
              }}
            >
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
