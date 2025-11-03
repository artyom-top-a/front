import { cn } from "@/lib/utils";
import { Navbar } from "./menu/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
  className?: string; 
}

export function ContentLayout({ title, children, className }: ContentLayoutProps) {
  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <Navbar title={title} />
      <div className={cn(
        "relative flex flex-col w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden pt-8 px-6 sm:px-12",
        className
      )}>
        {children}
      </div>
    </div>
  );
}
