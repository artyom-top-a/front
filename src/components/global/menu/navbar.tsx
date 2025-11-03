'use client';

import { SheetMenu } from "./sheet-menu";
import { UserWidget } from "./user-widget";
import { useCurrentUser } from "@/app/hooks/user";

interface NavbarProps {
  title: string;
}

export const Navbar = ({ title }: NavbarProps) => {

  const { session } = useCurrentUser();


  return (
    <header className="sticky top-0 z-20 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-5 sm:mx-12 flex h-16 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <div className="text-[15px] font-bold text-primary">{title}</div>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <UserWidget
            userid={session?.user?.id}
            name={session?.user?.name || "Anonymous"}
            image={session?.user?.image || ""}
          />

        </div>
      </div>
    </header>
  );
};



// import GlassSheet from "@/components/global/glass-sheet"
// import Search from "@/components/global/search"
// import SideBar from "@/components/global/sidebar"
// import { UserWidget } from "@/components/global/user-widget"
// import { Button } from "@/components/ui/button"
// import { CheckBadge } from "@/icons"
// import { currentUser } from "@clerk/nextjs/server"
// import { Menu } from "lucide-react"
// import Link from "next/link"

// type NavbarProps = {
//   groupid: string
//   userid: string
// }

// export const Navbar = async ({ groupid, userid }: NavbarProps) => {
//   const user = await currentUser()
//   return (
//     <div className="bg-[#1A1A1D] py-2 px-3 md:px-7 md:py-5 flex gap-5 justify-between md:justify-end items-center">
//       <GlassSheet trigger={<Menu className="md:hidden cursor-pointer" />}>
//         <SideBar groupid={groupid} userid={userid} mobile />
//       </GlassSheet>
//       <Search
//         searchType="POSTS"
//         className="rounded-full border-themeGray bg-black !opacity-100 px-3"
//         placeholder="Search..."
//       />
//       <Link href={`/group/create`} className="hidden md:inline">
//         <Button
//           variant="outline"
//           className="bg-themeBlack rounded-2xl flex gap-2 border-themeGray hover:bg-themeGray"
//         >
//           <CheckBadge />
//           Create Group
//         </Button>
//       </Link>
//       <UserWidget userid={userid} image={user?.imageUrl!} groupid={groupid} />
//     </div>
//   )
// }