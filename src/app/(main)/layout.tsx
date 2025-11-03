'use client'

import React from 'react';
import { Sidebar } from "@/components/global/menu/sidebar";
import { cn } from "@/lib/utils";
import { useSidebarToggle } from "@/stores/sidebar";
import { useStore } from "@/stores/use-store";


type ExploreLayoutProps = {
  children: React.ReactNode
}

const ExploreLayout = ({ children }: ExploreLayoutProps) => {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  if (!sidebar) return null;


  return (
    <>
      <Sidebar />
      <main
        className={cn(
          "h-[100dvh] bg-white dark:bg-black transition-[margin-left] ease-in-out duration-300",
        sidebar?.isOpen === false ? "lg:ml-[90px]" : "lg:ml-64"
        )}
      >
        {children}

      </main>
    </>
  );
}

export default ExploreLayout