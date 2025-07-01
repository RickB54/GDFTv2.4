
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { useIsMobile } from "@/hooks/use-mobile"

interface DateRangePickerProps {
  value?: DateRange
  onDateChange: (date: DateRange | undefined) => void
  align?: "start" | "center" | "end"
  className?: string
  calendarClassName?: string // Add this new prop
}

export function DateRangePicker({
  value,
  onDateChange,
  className,
  align = "start",
  calendarClassName, // Destructure the new prop
  ...props
}: DateRangePickerProps & Omit<React.HTMLAttributes<HTMLDivElement>, "onDateChange">) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isMobile = useIsMobile()

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal h-8",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onDateChange}
            numberOfMonths={isMobile ? 1 : 2}
            className={calendarClassName} // Apply the className here
          />
          <div className="flex justify-end gap-2 p-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onDateChange(undefined)
                setIsOpen(false)
              }}
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsOpen(false)
              }}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
