import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-5 bg-white rounded-2xl shadow-2xl w-fit border border-gray-100", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-2 relative items-center mb-6 px-12",
        caption_label: "text-sm font-extrabold text-blue-900 tracking-tight",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-white p-0 opacity-100 border-gray-100 transition-all hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 shadow-sm"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-separate border-spacing-1",
        head_row: "grid grid-cols-7 mb-3",
        head_cell:
          "text-gray-400 font-bold text-[0.65rem] uppercase tracking-widest text-center w-10",
        row: "grid grid-cols-7 w-full gap-1.5",
        cell: "h-10 w-10 text-center text-sm p-0 flex items-center justify-center relative",
        day: "h-10 w-10 p-0 font-semibold rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 flex items-center justify-center border-2 border-transparent",
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-700 hover:text-white rounded-xl shadow-lg scale-110 z-10 font-bold ring-2 ring-blue-600 ring-offset-2",
        day_today: "text-blue-600 font-black bg-blue-50 rounded-xl ring-1 ring-blue-200",
        day_outside:
          "day-outside text-gray-200 opacity-20 cursor-default grayscale",
        day_disabled: "text-gray-300 opacity-20 line-through cursor-not-allowed bg-gray-50/50 rounded-xl",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
