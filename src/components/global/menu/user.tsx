"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar"
import { LogOut, Settings } from "lucide-react"
import { DropDown } from "@/components/ui/dropdown"
import { useInitials } from "@/app/hooks/useInitials"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog"
import { logout } from "@/app/actions/logout"
import { useRouter } from "next/navigation"

type UserWidgetProps = {
  image: string
  name: string
  userid?: string
}

export const UserAvatar = ({ image, name }: UserWidgetProps) => {

  const initials = useInitials(name);
  const router = useRouter();

  // const { signOut } = useClerk()

//   const untrackPresence = async () => {
//     await supabaseClient.channel("tracking").untrack()
//   }

//   const dispatch: AppDispatch = useDispatch()

const onLogout = async () => {
  try {
    await logout(); // Use your custom logout function
    router.replace("/sign-in")
    console.log("Logged out successfully.");
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

  return (
    <DropDown
      title="Account"
      trigger={
        <Avatar className="cursor-pointer">
          <AvatarImage src={image} alt="user" />
          <AvatarFallback className="text-black/80 dark:text-white/80">{initials}</AvatarFallback>
        </Avatar>
      }
    >
      <Link href={`/settings`} className="w-full justify-start  h-9 px-2 py-2 bg-transparent hover:bg-accent hover:text-accent-foreground gap-x-2.5 inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
        <Settings size={20}/> Settings
      </Link>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="р-9 flex gap-x-2.5 px-2 justify-start w-full mt-2 py-0"
          >
            <LogOut size={20} />
            Logout
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="my-0">Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription className="my-0">
              Are you sure you want to log out? This will end your session and
              redirect you to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onLogout} className="bg-destructive hover:bg-destructive/80 text-white">Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropDown>
  )
}