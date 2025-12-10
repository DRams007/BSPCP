import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SlidersHorizontal, X } from "lucide-react";

interface ReportFilterProps {
    availableColumns: { key: string; label: string }[];
    selectedColumns: string[];
    onColumnToggle: (key: string) => void;
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
}

const ReportFilter: React.FC<ReportFilterProps> = ({
    availableColumns,
    selectedColumns,
    onColumnToggle,
    filters,
    onFilterChange,
    onClearFilters,
}) => {
    return (
        <div className="space-y-4 p-4 border rounded-lg bg-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">Report Configuration</h3>
                    {Object.keys(filters).length > 0 && (
                        <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8 px-2 lg:px-3">
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[150px]">
                        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {availableColumns.map((column) => {
                            return (
                                <DropdownMenuCheckboxItem
                                    key={column.key}
                                    className="capitalize"
                                    checked={selectedColumns.includes(column.key)}
                                    onCheckedChange={() => onColumnToggle(column.key)}
                                >
                                    {column.label}
                                </DropdownMenuCheckboxItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableColumns
                    .filter((col) => selectedColumns.includes(col.key))
                    .slice(0, 4) // Show inputs for first 4 selected columns to avoid clutter
                    .map((col) => (
                        <div key={col.key} className="space-y-1">
                            <Label htmlFor={`filter-${col.key}`} className="text-xs">
                                Filter {col.label}
                            </Label>
                            <Input
                                id={`filter-${col.key}`}
                                placeholder={`Filter by ${col.label}...`}
                                value={filters[col.key] || ""}
                                onChange={(e) => onFilterChange(col.key, e.target.value)}
                                className="h-8"
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default ReportFilter;
