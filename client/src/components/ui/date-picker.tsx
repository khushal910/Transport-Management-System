import * as React from "react";
import { Calendar as DayCalendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value?: string; // yyyy-MM-dd
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({ id, value, onChange, placeholder = "Select date", disabled, className }: DatePickerProps) {
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          size="default"
          disabled={disabled}
          className={cn(
            "w-full h-10 px-3 py-2 text-base items-center justify-between text-left",
            !selected && "text-muted-foreground",
            className,
          )}
          aria-label={placeholder}
        >
          <span className="truncate">{selected ? format(selected, "dd-MM-yyyy") : placeholder}</span>
          <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-2">
          <DayCalendar
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) return;
              const v = format(date, "yyyy-MM-dd");
              onChange?.(v);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
