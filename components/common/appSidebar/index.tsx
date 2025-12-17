"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Home,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Calculator,
  Briefcase,
  Settings,
  Building,
  ImageIcon,
  Layers,
  FileSpreadsheet,
  UserCheck,
  BarChart,
  Globe,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import NavLogo from "@/public/icons/brackets_logo_nav.svg";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  url?: string; // Added URL property
  subItems?: SubMenuItem[];
  hasSubItems?: boolean;
}

interface SubMenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  url: string; // URL for subitems
}

export default function Sidebar() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [activeItem, setActiveItem] = useState<string>("dashboard");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Toggle subitem expansion
  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Handle navigation
  const handleNavigation = (url?: string, itemId?: string) => {
    if (!url) return;

    if (itemId) {
      setActiveItem(itemId);
    }

    router.push(url);
  };

  // Handle scroll on sidebar only
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const handleWheel = (e: WheelEvent) => {
      if (sidebar.contains(e.target as Node)) {
        e.stopPropagation();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Menu items data with URLs
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Home size={20} />,
      url: "/dashboard",
    },
    {
      id: "users",
      label: "Users",
      icon: <Users size={20} />,
      url: "/users",
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: <Calendar size={20} />,
      url: "/attendance",
    },
    {
      id: "payroll",
      label: "Payroll",
      icon: <CreditCard size={20} />,
      url: "/payroll",
    },
    {
      id: "requests",
      label: "Requests",
      icon: <FileText size={20} />,
      url: "/requests",
    },
    {
      id: "assessment",
      label: "Assessment",
      icon: <BarChart size={20} />,
      url: "/assessment",
    },
    {
      id: "tax",
      label: "Tax",
      icon: <Calculator size={20} />,
      hasSubItems: true,
      subItems: [
        {
          id: "tax-details",
          label: "Tax Details",
          icon: <FileSpreadsheet size={16} />,
          url: "/tax/tax-detail",
        },
        {
          id: "tax-slabs",
          label: "Tax Slabs",
          icon: <Layers size={16} />,
          url: "/tax/tax-slabs",
        },
      ],
    },
    {
      id: "recruitment",
      label: "Recruitment",
      icon: <Briefcase size={20} />,
      hasSubItems: true,
      subItems: [
        {
          id: "applicants",
          label: "Applicants",
          icon: <UserCheck size={16} />,
          url: "/recruitment/applicants",
        },
        {
          id: "business",
          label: "Business",
          icon: <Building size={16} />,
          url: "/recruitment/business",
        },
        {
          id: "jobs",
          label: "Jobs",
          icon: <Megaphone size={16} />,
          url: "/recruitment/jobs",
        },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings size={20} />,
      hasSubItems: true,
      subItems: [
        {
          id: "teams",
          label: "Teams",
          icon: <Users size={16} />,
          url: "/settings/teams",
        },
        {
          id: "departments",
          label: "Departments",
          icon: <Building size={16} />,
          url: "/settings/departments",
        },
        {
          id: "designation",
          label: "Designation",
          icon: <Briefcase size={16} />,
          url: "/settings/designations",
        },
        {
          id: "positions",
          label: "Positions",
          icon: <Users size={16} />,
          url: "/settings/positions",
        },
        {
          id: "holidays",
          label: "Holidays",
          icon: <Calendar size={16} />,
          url: "/settings/holidays",
        },
        {
          id: "shifts",
          label: "Shifts",
          icon: <Calendar size={16} />,
          url: "/settings/shifts",
        },
        {
          id: "contracts",
          label: "Contracts",
          icon: <FileText size={16} />,
          url: "/settings/contracts",
        },
      ],
    },
    {
      id: "general",
      label: "General",
      icon: <Globe size={20} />,
      hasSubItems: true,
      subItems: [
        {
          id: "quotations",
          label: "Quotations",
          icon: <FileText size={16} />,
          url: "/general/quotations",
        },
        {
          id: "gallery",
          label: "Gallery",
          icon: <ImageIcon size={16} />,
          url: "/general/gallery",
        },
      ],
    },
  ];

  return (
    <div
      ref={sidebarRef}
      className={cn(
        "relative flex flex-col bg-[rgb(96,57,187)] transition-all duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent",
        isCollapsed ? "w-[60px]" : "w-[250px]"
      )}
      style={{
        height: "100vh",
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.2) transparent",
      }}
    >
      {/* Header with Logo and Collapse Button */}
      <div
        className={cn(
          "flex items-center px-4 border-white/10",
          isCollapsed ? "justify-center" : "justify-between"
        )}
      >
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="relative w-40 h-24">
              <Image src={NavLogo} alt="Logo" fill className="object-contain" />
            </div>
          </div>
        )}

        {/* Collapse Button - Show hamburger when collapsed */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center justify-center transition-colors duration-200",
            isCollapsed
              ? "w-8 h-8 text-white hover:bg-white/10 rounded"
              : "w-7 h-7 bg-white rounded-full hover:bg-gray-100"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <Menu size={20} className="text-white" />
          ) : (
            <ChevronLeft size={20} className="text-[rgb(96,57,187)]" />
          )}
        </button>
      </div>

      {/* Horizontal Line with fade effect - Only show when expanded */}
      {!isCollapsed && (
        <div className="relative h-0.5 mx-4 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 px-2 space-y-0.5">
        {menuItems.map((item) => (
          <div key={item.id} className="space-y-0.5">
            {/* Main Menu Item */}
            <button
              onClick={() => {
                if (item.hasSubItems && !isCollapsed) {
                  toggleExpand(item.id);
                } else if (item.url) {
                  handleNavigation(item.url, item.id);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 transition-all duration-200 group",
                isCollapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5",
                activeItem === item.id && !item.hasSubItems
                  ? "bg-[rgb(25,201,209)] text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex-shrink-0">{item.icon}</div>
              {!isCollapsed && (
                <>
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.hasSubItems && (
                    <ChevronRight
                      size={16}
                      className={cn(
                        "ml-auto transition-transform duration-200",
                        expandedItems.includes(item.id) && "rotate-90"
                      )}
                    />
                  )}
                </>
              )}
            </button>

            {/* Sub Items - Only show when expanded */}
            {!isCollapsed &&
              item.hasSubItems &&
              expandedItems.includes(item.id) && (
                <div className="ml-6 space-y-0.5 border-l border-white/20 pl-3">
                  {item.subItems?.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => handleNavigation(subItem.url, subItem.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-1.5 transition-all duration-200",
                        activeItem === subItem.id
                          ? "bg-[rgb(25,201,209)] text-white"
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {subItem.icon}
                      <span className="text-sm font-medium">
                        {subItem.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>

      {/* Collapsed State Tooltips */}
      {isCollapsed && (
        <div className="fixed left-[60px] top-0 h-full pointer-events-none">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className="absolute left-2"
              style={{ top: `${100 + index * 48}px` }}
            >
              <div className="relative">
                <div className="bg-gray-900 text-white text-xs font-medium py-1.5 px-3 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ml-2">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
