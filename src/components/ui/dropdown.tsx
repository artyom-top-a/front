"use client"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverTrigger, PopoverContent } from "./popover"

type DropDownProps = {
  title: string
  trigger: JSX.Element
  children: React.ReactNode
  ref?: React.RefObject<HTMLButtonElement>
}

export const DropDown = ({ trigger, title, children, ref }: DropDownProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild ref={ref}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="rounded-2xl w-52 items-start bg-white dark:bg-black border bg-clip-padding backdrop--blur__safari backdrop-filter backdrop-blur-4xl p-4 mr-5 mt-1">
        <h4 className="text-sm pl-3">{title}</h4>
        <Separator className=" my-2.5" />
        {children}
      </PopoverContent>
    </Popover>
  )
}