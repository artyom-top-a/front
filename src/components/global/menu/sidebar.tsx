import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu } from "./menu";
import { useSidebarToggle } from "@/stores/sidebar";
import { useStore } from "@/stores/use-store";
import { SidebarToggle } from "./sidebar-toggle";
import Image from "next/image";

export function Sidebar() {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  
  if(!sidebar) return null;
  

  return (
    <aside
      className={cn(
        // "fixed top-0 left-0 z-40 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300 bg-[#fafafa] dark:bg-[#090909]",
        "fixed top-0 left-0 z-40 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        sidebar?.isOpen === false ? "w-[90px]" : "w-64"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />
      <div className="relative h-full flex flex-col px-3 pt-4 pb-4 overflow-y-auto border-r">
        <Button
          className={cn(
            "flex flex-row items-center transition-transform ease-in-out duration-300 mb-1 justify-start",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href="/home" className="flex items-center gap-2">
            {/* <div className="rounded-sm bg-gray-white border dark:bg-black w-6 h-6 mr-1" /> */}
            {/* <div className="rounded-sm bg-[#6127FF] flex items-center justify-center size-7 mr-1">
              <div className="size-4 rounded-full bg-white dark:bg-black"/>
            </div> */}
            <Image
              src="/logo.png"
              alt='logo'
              width={28}
              height={28}
            />
            <div
              className={cn(
                "text-base font-semibold whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                sidebar?.isOpen === false
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              GStudy
            </div>
          </Link>
        </Button>
        <Menu isOpen={sidebar?.isOpen} />
      </div>
    </aside>
  );
}