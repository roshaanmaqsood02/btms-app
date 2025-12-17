"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  debounce?: number;
}

export function SearchBar({
  placeholder = "Search...",
  value,
  onChange,
  className,
  debounce = 300,
}: SearchBarProps) {
  let timeoutId: NodeJS.Timeout;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (debounce > 0) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onChange(value);
      }, debounce);
    } else {
      onChange(value);
    }
  };

  return (
    <div className={cn("relative w-1/4 bg-white rounded-md", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        placeholder={placeholder}
        defaultValue={value}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  );
}
