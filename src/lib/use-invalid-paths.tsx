"use client";

import { usePathname } from "next/navigation";

export default function useInvalidPaths() {
    const pathName = usePathname();

    const invalidPaths = ['studio', 'home', 'practice', 'edit-deck', 'flash-cards', 'settings', 'summaries'];

    const isInvalid = invalidPaths.some((path) => pathName.startsWith(`/${path}`));

    return isInvalid;
}
