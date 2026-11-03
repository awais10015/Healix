"use client";

import { useEffect, useMemo, useState } from "react";
import { format, setHours, setMinutes, startOfDay, isBefore } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8);
const MINUTES = [0, 15, 30, 45];

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function parseStartsAt(value: string): {
  date?: Date;
  hour: number;
  minute: number;
} {
  if (!value) {
    return { hour: 9, minute: 0 };
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return { hour: 9, minute: 0 };
  }
  return { date: d, hour: d.getHours(), minute: d.getMinutes() };
}

export function buildStartsAtISO(
  date: Date | undefined,
  hour: number,
  minute: number
): string {
  if (!date) return "";
  const combined = setMinutes(setHours(startOfDay(date), hour), minute);
  return combined.toISOString();
}

export function formatStartsAtDisplay(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return format(d, "EEE, MMM d, yyyy · h:mm a");
}

type AppointmentDateTimePickerProps = {
  id?: string;
  value: string;
  onChange: (isoValue: string) => void;
  required?: boolean;
  disabled?: boolean;
};

export function AppointmentDateTimePicker({
  id,
  value,
  onChange,
  required: _required,
  disabled,
}: AppointmentDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const parsed = parseStartsAt(value);
  const [date, setDate] = useState<Date | undefined>(parsed.date);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(
    MINUTES.includes(parsed.minute) ? parsed.minute : 0
  );

  useEffect(() => {
    const p = parseStartsAt(value);
    setDate(p.date);
    setHour(p.hour);
    setMinute(MINUTES.includes(p.minute) ? p.minute : 0);
  }, [value]);

  const display = formatStartsAtDisplay(value);
  const todayStart = useMemo(() => startOfDay(new Date()), []);

  const applySelection = (d: Date | undefined, h: number, m: number) => {
    if (!d) {
      onChange("");
      return;
    }
    onChange(buildStartsAtISO(d, h, m));
  };

  const onDateSelect = (d: Date | undefined) => {
    setDate(d);
    if (d) {
      applySelection(d, hour, minute);
    } else {
      onChange("");
    }
  };

  const onHourChange = (h: number) => {
    setHour(h);
    if (date) applySelection(date, h, minute);
  };

  const onMinuteChange = (m: number) => {
    setMinute(m);
    if (date) applySelection(date, hour, m);
  };

  const selectedDateTime = date
    ? setMinutes(setHours(startOfDay(date), hour), minute)
    : null;
  const isPast =
    selectedDateTime != null && isBefore(selectedDateTime, new Date());

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Date & time</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full h-9 justify-start text-left font-normal border-input bg-transparent dark:bg-input/30 hover:bg-muted/40 shadow-xs",
              !display && "text-muted-foreground",
              isPast && display && "border-destructive/50"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            {display ?? "Pick date and time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex flex-col sm:flex-row sm:divide-x divide-border">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateSelect}
              disabled={(d) => isBefore(d, todayStart)}
              defaultMonth={date ?? new Date()}
            />
            <div className="p-4 space-y-4 min-w-[11rem] bg-muted/20">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4 text-primary" />
                Time
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label
                    htmlFor={`${id}-hour`}
                    className="text-xs text-muted-foreground"
                  >
                    Hour
                  </Label>
                  <select
                    id={`${id}-hour`}
                    className={selectClass}
                    value={hour}
                    onChange={(e) => onHourChange(Number(e.target.value))}
                    disabled={!date}
                  >
                    {HOURS.map((h) => (
                      <option key={h} value={h}>
                        {format(setHours(new Date(), h), "h a")}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor={`${id}-minute`}
                    className="text-xs text-muted-foreground"
                  >
                    Min
                  </Label>
                  <select
                    id={`${id}-minute`}
                    className={selectClass}
                    value={minute}
                    onChange={(e) => onMinuteChange(Number(e.target.value))}
                    disabled={!date}
                  >
                    {MINUTES.map((m) => (
                      <option key={m} value={m}>
                        {m.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!date || isPast}
                onClick={() => setOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      {_required && !value && (
        <p className="text-xs text-muted-foreground">
          Select a date and time to continue.
        </p>
      )}
      {isPast && display && (
        <p className="text-xs text-destructive">
          That time is in the past. Choose a later slot.
        </p>
      )}
      {display && !isPast && (
        <p className="text-xs text-muted-foreground">
          Visit length: about 30 minutes
        </p>
      )}
      <input type="hidden" name="startsAt" value={value} readOnly />
    </div>
  );
}

export function isStartsAtInFuture(value: string): boolean {
  if (!value) return false;
  const d = new Date(value);
  return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
}
