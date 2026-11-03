"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type PersonSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type PersonSelectFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: PersonSelectOption[];
  emptyMessage?: string;
  className?: string;
};

export function PersonSelectField({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  options,
  emptyMessage = "No options available.",
  className,
}: PersonSelectFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground rounded-md border border-dashed border-border px-3 py-2">
          {emptyMessage}
        </p>
      ) : (
        <Select value={value || undefined} onValueChange={onValueChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} textValue={opt.label}>
                <span className="flex flex-col items-start gap-0.5 py-0.5 text-left">
                  <span>{opt.label}</span>
                  {opt.description ? (
                    <span className="text-xs text-muted-foreground font-normal">
                      {opt.description}
                    </span>
                  ) : null}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
