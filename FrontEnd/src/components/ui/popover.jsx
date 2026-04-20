import * as React from "react"
import { cn } from "@/lib/utils"

const Popover = ({ children, open, onOpenChange, trigger }) => {
  const [isOpen, setIsOpen] = React.useState(open || false)
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        if (onOpenChange) onOpenChange(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onOpenChange])

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open)
  }, [open])

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="w-full cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen)
          if (onOpenChange) onOpenChange(!isOpen)
        }}
      >
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute left-0 top-full z-[100] mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}

export { Popover }
