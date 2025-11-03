import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Menu } from "./menu";
import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";

export function SheetMenu() {
  return (
    // <Sheet>
    //   <SheetTrigger className="lg:hidden" asChild>
    //     <Button className="h-8" variant="outline" size="icon">
    //       <MenuIcon size={20} />
    //     </Button>
    //   </SheetTrigger>
    //   <SheetContent className="sm:w-64 px-3 h-full flex flex-col z-50" side="left">
    //     <SheetHeader>
    //       <Button
    //         className="flex justify-center items-center pb-2 pt-1"
    //         variant="link"
    //         asChild
    //       >
        //     <Link href="/dashboard" className="flex items-start gap-2">
        //       <SheetTitle className="font-bold text-lg">SaaS</SheetTitle>
        //     </Link>
        //   </Button>
        // </SheetHeader>
        // <Menu isOpen />
    //   </SheetContent>
    // </Sheet>


    <Drawer>
      <DrawerTrigger className="lg:hidden" asChild>
        <Button className="size-9" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="px-3 pb-5">
        <DrawerHeader>
        <Link href="/home" className="flex items-center gap-2">
            {/* <div className="rounded-sm bg-gray-white border dark:bg-black w-6 h-6 mr-1" /> */}
            <div className="rounded-sm bg-[#6127FF] flex items-center justify-center size-7 mr-1">
              <div className="size-4 rounded-full bg-white dark:bg-black"/>
            </div>
            <div className="text-base font-semibold whitespace-nowrap text-primary">
              GStudy
            </div>
          </Link>
        </DrawerHeader>
     
        <Menu isOpen />
      </DrawerContent>
    </Drawer>
  );
}
