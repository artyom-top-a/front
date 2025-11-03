"use client"

import { deleteUser } from "@/app/actions/user"
import { useCurrentUser } from "@/app/hooks/user"
import { ContentLayout } from "@/components/global/content-layout"
import DarkModetoggle from "@/components/global/dark-mode"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogHeader, DialogClose } from '@/components/ui/dialog';
import { logout } from "@/app/actions/logout"
import { cancelSubscription } from "@/app/actions/cancelSubscription"
import { useToast } from "@/hooks/use-toast"
import { Loader } from "@/components/global/loader"

// Define Zod schema for settings form validation
const SettingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
});

type SettingsFormValues = z.infer<typeof SettingsSchema>;

const SettingsPage = () => {
  const { toast } = useToast();

  const { session } = useCurrentUser();

  // const { session, status } = useCurrentUser();

  // const router = useRouter();

  // const [name, setName] = useState("");
  // const [email, setEmail] = useState("");
  // const [isChanged, setIsChanged] = useState(false);
  const [emailConfirmation, setEmailConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [subscriptionEndDate, setSubscriptionEndDate] = useState<string | null>(null);

  const [fetchingStatus, setFetchingStatus] = useState(true); // Loading state for API call

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch("/api/subscription-status");
        if (!response.ok) throw new Error("Failed to fetch subscription status");

        const data = await response.json();
        setSubscriptionEndDate(data.subscriptionEnd);
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      } finally {
        setFetchingStatus(false);
      }
    };

    fetchSubscriptionStatus();
  }, []);


  const handleConfirmCancel = async () => {
    // setLoading(true);
    // try {
    //   await cancelSubscription(); // Call the cancelSubscription function
    //   console.log("Subscription cancellation scheduled successfully");
    //   setSubscriptionEndDate("End of current billing period");
    // } catch (error) {
    //   console.error("Failed to cancel subscription", error);
    // } finally {
    //   setLoading(false);
    // }


    setLoading(true);
    try {
      // Call the server action to cancel the subscription
      console.log('Calling cancelSubscription function');
      const result = await cancelSubscription(); // Now returns a plain object
      console.log('Result from cancelSubscription:', result);

      if (result?.success) {
        toast({
          title: 'Success',
          description: 'Your subscription will be canceled at the end of the billing period.',
          variant: 'default',
        });
        setIsDialogOpen(false); // Close the dialog
      } else {
        toast({
          title: 'Error',
          description: result?.error || 'Failed to cancel subscription',
          variant: 'default',
        });
        setIsDialogOpen(false); // Close the dialog
      }
    } catch (error) {
      console.error('Error in handleConfirmCancel:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while canceling the subscription.',
        variant: 'default',
      });
      setIsDialogOpen(false); // Close the dialog
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (emailConfirmation === session?.user?.email && session?.user?.id) {
      try {
        await deleteUser(session.user.id);

        toast({
          title: "Account Deleted",
          description: "Your account, along with all associated summaries and decks, has been permanently deleted.",
        });
        console.log("Account deleted successfully");
        await logout();
      } catch (error) {
        toast({
          title: "Account Deletion Failed",
          description: "An error occurred while trying to delete your account.",
        });
        console.error("Logout failed:", error);
      }
    }
  };

  const {
    // register,
    // handleSubmit,
    // formState: { errors },
    watch,
    // reset,
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsSchema),
    mode: "onBlur",
  });

  // Use watch to track form field values
  // const watchedName = watch("name");
  // const watchedEmail = watch("email");

  // useEffect(() => {
  //   // Check if the form values are different from session values
  //   setIsChanged(
  //     watchedName !== session?.user?.name || watchedEmail !== session?.user?.email
  //   );
  // }, [watchedName, watchedEmail, session?.user?.name, session?.user?.email]);


  // const onSubmit = async (values: SettingsFormValues) => {
  //   // Handle form submission
  //   try {
  //     await updateUser(session?.user?.id!, values.name, values.email);
  //     console.log('User updated successfully');
  //   } catch (error) {
  //     console.error('Failed to update user', error);
  //   }
  // };


  return (
    <ContentLayout title="Settings">
      {/* <div className="w-full flex flex-row items-center justify-between"> */}
      {/* <div className="flex flex-col">
          <div className="text-lg font-bold text-primary">General</div>
          <div className="text-sm font-medium text-gray-500 dark:text-foreground mt-[-0.5]">
            Settings and options for your account
          </div>
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isChanged}
          className={`${!isChanged
            ? "bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-white cursor-not-allowed"
            : "bg-[#562ae6] hover:bg-[#562ae6]/90 dark:bg-[#734df1] dark:hover:bg-[#734df1]/90"
            }`}
        >
          Save
        </Button>
      </div>

      <Separator className="my-4" />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <div className="mr-4 text-sm font-medium">Name</div>
          </div>
          <div className="w-3/4 flex flex-col">
          <Input
            placeholder="Name"
            value={name}
            {...register("name")}
            className="w-full border-border dark:text-white"
          />
          {errors.name && <p className="text-red-600 text-sm my-1">{errors.name.message}</p>}
          </div>
        </div>

        <Separator className="my-0.5" />

        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex flex-col">
            <div className="mr-4 text-sm font-medium">Email</div>
          </div>
          <div className="w-3/4 flex flex-col">
          <Input
            placeholder="Email"
            value={email}
            {...register("email")}
            className="w-full border-border dark:text-white"
          />
          {errors.email && <p className="text-red-600 text-sm my-1">{errors.email.message}</p>}
          </div>
        </div>
      </form>

      <Separator className="my-4" /> */}

      <div className="flex flex-col items-start justify-center pb-8">
        <div className="text-lg font-bold text-primary mt-4">Interface theme</div>
        <div className="text-sm font-medium text-gray-500 dark:text-foreground mt-[-0.5]">Choose the appropriate theme for the application</div>

        <Separator className="my-6" />

        <DarkModetoggle />

        <Separator className="my-6" />


        <div className="text-base font-bold text-primary mt-2"> Cancel Subscription <span className="text-xl ml-1 mt-0.5">😢</span></div>
        <div className="text-sm font-medium text-gray-500 dark:text-foreground mt-[-0.5]">
          Cancel your subscription to end it after the current billing period
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className="max-w-auto mt-4 w-full md:w-48"
              disabled={!subscriptionEndDate}
            >
              Cancel Subscription
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="my-0 text-primary">
                Cancel Subscription
              </DialogTitle>
              <DialogDescription className="my-0">
                {fetchingStatus ? (
                  "Your subscription will end on {}. . Are you sure you want to proceed with cancellation?"
                ) : (
                  <>
                    Your subscription will end on{" "}
                    <span className="font-semibold">
                      {subscriptionEndDate ? new Date(subscriptionEndDate).toLocaleDateString() : "N/A"}
                    </span>
                    . Are you sure you want to proceed with cancellation?
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose>
                <Button variant="secondary" onClick={() => { }}>
                  Cancel
                </Button>
              </DialogClose>
              {/* <DialogClose> */}
                <Button onClick={handleConfirmCancel} disabled={loading} variant="destructive">
                <Loader loading={loading}>Confirm Cancellation</Loader>
                </Button>
              {/* </DialogClose> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <Separator className="my-4" />

        <div className="text-base font-bold text-primary mt-2">Danger Zone</div>
        <div className="text-sm font-medium text-gray-500 dark:text-foreground mt-[-0.5]">
          If you want to permanently delete this account and all of its data, you can do so below
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="default"
              className="max-w-auto mt-4 w-full md:w-36 px-3"
            >
              Delete account
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="my-0 text-primary">
                Confirm Account Deletion
              </AlertDialogTitle>
              <AlertDialogDescription className="my-0">
                Are you sure you want to delete your account? This action is irreversible.
                Please enter your email to confirm.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="mb-2">
              <Input
                placeholder="Enter your email"
                className="w-full border-border dark:text-white"
                value={emailConfirmation}
                onChange={(e) => setEmailConfirmation(e.target.value)}
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={emailConfirmation !== session?.user?.email}
                className={`${emailConfirmation !== session?.user?.email
                  ? "bg-gray-200 dark:bg-stone-800 text-gray-700 dark:text-white cursor-not-allowed"
                  : "bg-destructive hover:bg-destructive/80 text-white"
                  }`}
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContentLayout>
  );
}

export default SettingsPage;
