import {
  Settings,
  LucideIcon,
  GalleryVertical,
  Notebook,
  Home,
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/home",
          label: "Home",
          active: pathname.includes("/home"),
          icon: Home,
          submenus: []
        },
        // {
        //   href: "/favouries",
        //   label: "Favourites",
        //   active: pathname.includes("/favourites"),
        //   icon: Star,
        //   submenus: []
        // },
      ]
    },


    {
      groupLabel: "Content",
      menus: [
        {
          href: "/flash-cards",
          label: "Flash Cards",
          active: pathname.includes("/flash-cards"),
          icon: GalleryVertical,
          submenus: []
        },
        {
          href: "/summaries",
          label: "Summaries",
          active: pathname.includes("/summaries"),
          icon: Notebook,
          submenus: []
        }
      ]
    },
  


    {
      groupLabel: "Account",
      menus: [
        {
          href: "/settings",
          label: "Settings",
          active: pathname.includes("/settings"),
          icon: Settings,
          submenus: []
        }
      ]
    }
  ];
}
