"use client";

import Link from "next/link";
import { Ellipsis, NotepadText, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/components/ui/tooltip";
import { CollapseMenuButton } from "../collapse-menu-button";
import { getMenuList } from "@/constants/menu-list";
import { useEffect, useState } from "react";
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { getUserGenerations } from "@/app/actions/getUserGenerations";
import PricingDialog from "@/components/dialogs/pricing-dialog";
import { Discord } from "@/icons/discord";

interface MenuProps {
  isOpen: boolean | undefined;
}

export function Menu({ isOpen }: MenuProps) {
  const pathname = usePathname();
  const menuList = getMenuList(pathname);

  const [open, setOpen] = useState(false);

  const [userGenerations, setUserGenerations] = useState({
    generations: 0,
    generationsUsedThisMonth: 0,
  });


  useEffect(() => {
    async function fetchGenerations() {
      const result = await getUserGenerations();
      if (result.success) {
        setUserGenerations({
          generations: result.generations,
          generationsUsedThisMonth: result.generationsUsedThisMonth,
        });
      }
    }

    fetchGenerations();
  }, []);

  // Pricing data with price as a number
  // Menu.tsx


  return (
    <ScrollArea className="[&>div>div[style]]:!block">
      <nav className="mt-2 lg:mt-7 h-full w-full">
        <div className="flex flex-col items-start space-y-1 px-2 lg:min-h-[calc(100vh-32px-40px-48px)]">
          {menuList.map(({ groupLabel, menus }, index) => (
            <div className={cn("w-full", groupLabel ? "pt-3" : "")} key={index}>
              {(isOpen && groupLabel) || isOpen === undefined ? (
                <div className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                  {groupLabel}
                </div>
              ) : !isOpen && isOpen !== undefined && groupLabel ? (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div>{groupLabel}</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <div className="pb-2"></div>
              )}
              {menus.map(
                ({ href, label, icon: Icon, active, submenus }, index) =>
                  submenus.length === 0 ? (
                    <div className="w-full" key={index}>
                      <TooltipProvider disableHoverableContent>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Button
                              variant={active ? "secondary" : "ghost"}
                              className={`w-full justify-start text-sm h-11 mb-1 ${active ? "text-primary bg-[#F4F0FF]" : "text-gray-600 dark:text-stone-500"}`}
                              asChild
                            >
                              <Link href={href}>
                                <span
                                  className={cn(isOpen === false ? "" : "mr-4")}
                                >
                                  <Icon size={20} />
                                </span>
                                <div
                                  className={cn(
                                    "max-w-[200px] truncate",
                                    isOpen === false
                                      ? "-translate-x-96 opacity-0"
                                      : "translate-x-0 opacity-100"
                                  )}
                                >
                                  {label}
                                </div>
                              </Link>
                            </Button>
                          </TooltipTrigger>
                          {isOpen === false && (
                            <TooltipContent side="right">
                              {label}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  ) : (
                    <div className="w-full" key={index}>
                      <CollapseMenuButton
                        icon={Icon}
                        label={label}
                        active={active}
                        submenus={submenus}
                        isOpen={isOpen}
                      />
                    </div>
                  )
              )}
            </div>
          ))}
          <div className="w-full pt-4">
            {(isOpen && "Community Links") || isOpen === undefined ? (
              <div className="text-sm font-medium text-muted-foreground px-4 pb-2 max-w-[248px] truncate">
                Community Links
              </div>
            ) : !isOpen && isOpen !== undefined ? (
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger className="w-full">
                    <div className="w-full flex justify-center items-center">
                      <Ellipsis className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div>Community Links</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className={`w-full justify-start text-sm h-11 mb-1 text-gray-600 dark:text-stone-500`}
                    asChild
                  >
                    <a href={"/blog"}>
                      <span
                        className={cn(isOpen === false ? "" : "mr-4")}
                      >
                        <NotepadText className="size-5" />
                      </span>
                      <div
                        className={cn(
                          "max-w-[200px] truncate",
                          isOpen === false
                            ? "-translate-x-96 opacity-0"
                            : "translate-x-0 opacity-100"
                        )}
                      >
                        Blog
                      </div>
                    </a>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">
                    Blog
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>


            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className={`w-full justify-start text-sm h-11 mb-1 text-gray-600 dark:text-stone-500`}
                    asChild
                  >
                    <a href="https://discord.gg/7rPhBMteaD" target="_blank" rel="noopener noreferrer">
                      <span
                        className={cn(isOpen === false ? "" : "mr-4")}
                      >
                        <Discord />
                      </span>
                      <div
                        className={cn(
                          "max-w-[200px] truncate",
                          isOpen === false
                            ? "-translate-x-96 opacity-0"
                            : "translate-x-0 opacity-100"
                        )}
                      >
                        Discord
                      </div>
                    </a>
                  </Button>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">
                    Discord
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="w-full grow flex items-end pt-8 lg:pt-0">
            <div className="w-full flex flex-col">
              {/* <div className="flex flex-col items-start w-full">
                <div className="w-full flex flex-row items-center justify-between text-primary text-sm font-semibold">
                  <div>Generations:</div>
                  <div>{userGenerations.generationsUsedThisMonth}/{userGenerations.generations}</div>
                </div>
                <Progress
                  value={
                    userGenerations.generations > 0
                      ? Math.min(
                        (userGenerations.generationsUsedThisMonth / userGenerations.generations) * 100,
                        100
                      )
                      : 0
                  }
                  className="mt-2 h-1.5"
                />
              </div> */}
              {(isOpen || isOpen === undefined) && (
                <div className="flex flex-col items-start w-full">
                  <div className="w-full flex flex-row items-center justify-between text-primary text-sm font-semibold">
                    <div>Generations:</div>
                    <div>{userGenerations.generationsUsedThisMonth}/{userGenerations.generations}</div>
                  </div>
                  <Progress
                    value={
                      userGenerations.generations > 0
                        ? Math.min(
                          (userGenerations.generationsUsedThisMonth / userGenerations.generations) * 100,
                          100
                        )
                        : 0
                    }
                    className="mt-2 h-1.5"
                  />
                </div>
              )}
              {!isOpen && isOpen !== undefined && (
                <TooltipProvider>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger className="w-full">
                      <div className="w-full flex justify-center items-center">
                        <Ellipsis className="h-5 w-5" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <div>Generations: {userGenerations.generationsUsedThisMonth}/{userGenerations.generations}</div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider disableHoverableContent>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setOpen(true)}
                      variant="outline"
                      className="w-full justify-center h-11 mt-5 font-medium"
                    >
                      <span className={cn(isOpen === false ? "" : "mr-4")}>
                        <Sparkles size={18} />
                      </span>
                      <div
                        className={cn(
                          "whitespace-nowrap text-sm",
                          isOpen === false ? "opacity-0 hidden" : "opacity-100"
                        )}
                      >
                        Upgrade Plan
                      </div>
                    </Button>
                  </TooltipTrigger>
                  {isOpen === false && (
                    <TooltipContent side="right">Upgrade Plan</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </nav>


      {/* Dialog Component */}
      {/* <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[100%] overflow-hidden z-50 w-full flex flex-col p-6 sm:p-6 max-w-full h-full items-center justify-center no-scrollbar">
          <div className="flex-1 overflow-y-auto w-full mx-auto flex max-w-screen-xl flex-col gap-8 px-4 pt-28 md:!pt-0 md:px-8 no-scrollbar md:justify-center">

            <div className="mx-auto max-w-3xl text-center">
              <div className="text-xl font-bold tracking-tight text-primary sm:text-3xl">
                Upgrade your plan
              </div>
              <div className="mt-3 text-xl leading-8 text-primary/60">
                Choose an <strong className="text-primary/60">affordable plan</strong> that's packed with the best features for engaging your audience, creating customer loyalty, and driving sales.
              </div>
            </div>

            <div className="flex w-full items-center justify-center space-x-3">
              <span className="text-primary/60">Annual</span>
              <SwitchToggle isAnnual={isAnnual} setIsAnnual={setIsAnnual} />
  
            </div>

            <div className="mx-auto max-w-3xl grid w-full justify-center grid-cols-1 md:grid-cols-2 gap-6 pb-6 md:!pb-0">
              {pricingPlans.map((plan, index) => (
                <PlanCard
                  key={index}
                  title={plan.title}
                  description={plan.description}
                  monthlyPrice={plan.monthlyPrice}
                  annualPrice={plan.annualPrice}
                  features={plan.features}
                  highlight={plan.highlight}
                  href={plan.href}
                  paymentLink={isAnnual ? plan.paymentLinkAnnual : plan.paymentLinkMonthly}
                  isAnnual={isAnnual}
                />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog> */}

      <PricingDialog open={open} onOpenChange={setOpen} />

    </ScrollArea>
  );
}
