"use client";
import Link from "next/link";
import SettingsModal from "@/components/settings/settings-modal";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useTheme } from "next-themes";
import {
  RiFolder2Line,
  RiBookOpenLine,
  RiSearchLine,
  RiSideBarLine,
  RiAddLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiMore2Line,
  RiPushpinLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiMoonLine,
  RiSettings2Line,
  RiTranslate,
  RiQuestionAnswerLine,
  RiLoginBoxLine,
  RiCloseLine,
} from "@remixicon/react";
import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";
import * as Switch from "@/components/ui/switch";
import * as Popover from "@radix-ui/react-popover";
import * as Tooltip from "@radix-ui/react-tooltip";
import { cn } from "@/utils/cn";

const sidebarData = {
  user: {
    name: "James Brown",
    email: "james@alignui.com",
    avatar: "JB",
    isPro: true,
    profileMenu: [
      {
        id: "settings",
        label: "Settings",
        icon: RiSettings2Line,
        href: "/settings",
      },
      {
        id: "language",
        label: "Language",
        icon: RiTranslate,
        href: "/language",
      },
      {
        id: "help",
        label: "Need help?",
        icon: RiQuestionAnswerLine,
        href: "/help",
      },
      {
        id: "logout",
        label: "Log out",
        icon: RiLoginBoxLine,
        href: "/login",
        variant: "danger",
      },
    ],
    version: "v1.5.69",
    termsUrl: "/terms",
  },
  sections: [
    {
      id: "main-navigation",
      title: null,
      items: [
        {
          id: "new-chat",
          label: "New chat",
          icon: RiAddLine,
          href: "/",
        },
        {
          id: "projects",
          label: "Projects",
          icon: RiFolder2Line,
          href: "/projects",
        },
        {
          id: "library",
          label: "Library",
          icon: RiBookOpenLine,
          href: "",
        },
      ],
    },
    {
      id: "pinned",
      title: "Pinned",
      items: [
        {
          id: "research-analysis",
          label: "Research & Analysis",
          icon: RiFolder2Line,
          href: "/projects/research-analysis",
        },
        {
          id: "web-search",
          label: "Web Search",
          icon: RiFolder2Line,
          href: "/projects/web-search?empty=true",
        },
        {
          id: "knowledge-base",
          label: "Knowledge Base",
          icon: RiFolder2Line,
          href: "/projects/knowledge-base",
        },
      ],
    },
    {
      id: "history",
      title: null,
      isHistorySection: true,
      subsections: [
        {
          id: "recents",
          title: "Recents",
          items: [
            {
              id: "chat-1",
              title: "User research analysis",
              href: "/chat/1",
            },
            {
              id: "chat-2",
              title: "Competitive analysis",
              href: "/chat/2",
            },
            {
              id: "chat-3",
              title: "Meeting notes",
              href: "/chat/3",
            },
          ],
        },
        {
          id: "yesterday",
          title: "Yesterday",
          items: [
            {
              id: "chat-4",
              title: "Market trends analysis",
              href: "/chat/4",
            },
            {
              id: "chat-5",
              title: "Usability testing results",
              href: "/chat/5",
            },
            {
              id: "chat-6",
              title: "Competitive analysis",
              href: "/chat/6",
            },
            {
              id: "chat-7",
              title: "Feature prioritization",
              href: "/chat/7",
            },
            {
              id: "chat-8",
              title: "User feedback",
              href: "/chat/8",
            },
          ],
        },
      ],
    },
  ],
};

export interface MainSidebarRef {
  toggleMobileSidebar: () => void;
}

const MainSidebar = forwardRef<MainSidebarRef>((props, ref) => {
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileOpenMini, setIsProfileOpenMini] = useState(false);
  const [isProfileAnimating, setIsProfileAnimating] = useState(false);
  const [openPopovers, setOpenPopovers] = useState<Record<string, boolean>>({});
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPopovers, setSearchPopovers] = useState<Record<string, boolean>>(
    {},
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleProfileOpen = () => {
    setIsProfileOpen(true);
    setTimeout(() => {
      setIsProfileAnimating(true);
    }, 10);
  };

  const handleProfileClose = () => {
    setIsProfileAnimating(false);
    setTimeout(() => {
      setIsProfileOpen(false);
    }, 300);
  };

  useImperativeHandle(ref, () => ({
    toggleMobileSidebar,
  }));

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const handleLinkClick = () => {
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleMiniSearchClick = () => {
    setIsSidebarCollapsed(false);
    setIsSearchActive(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 350);
  };

  const allHistoryItems =
    sidebarData.sections
      .find((section) => section.isHistorySection)
      ?.subsections?.flatMap((subsection) => subsection.items) || [];

  const filteredHistoryItems = searchQuery.trim()
    ? allHistoryItems.filter((item) =>
        ((item as any).label || (item as any).title)
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : allHistoryItems;

  const togglePopover = (itemId: string, isOpen: boolean) => {
    setOpenPopovers((prev) => ({
      ...prev,
      [itemId]: isOpen,
    }));
  };

  const toggleSearchPopover = (itemId: string, isOpen: boolean) => {
    setSearchPopovers((prev) => ({
      ...prev,
      [itemId]: isOpen,
    }));
  };
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span key={index} className="bg-green-alpha-10 pl-0.5 text-green-600">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const dropdownElement = dropdownRef.current;

      if (dropdownElement && !dropdownElement.contains(target)) {
        setIsProfileOpen(false);
        setIsProfileOpenMini(false);
      }
    };

    if (isProfileOpen || isProfileOpenMini) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isProfileOpen, isProfileOpenMini]);

  useEffect(() => {
    const handleSearchClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const searchOverlay = document.querySelector("[data-search-overlay]");
      const searchInput = document.querySelector(
        'input[placeholder="Search..."]',
      );

      if (
        searchOverlay &&
        searchInput &&
        !searchOverlay.contains(target) &&
        !searchInput.contains(target)
      ) {
        setIsSearchActive(false);
      }
    };

    if (isSearchActive) {
      document.addEventListener("mousedown", handleSearchClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleSearchClickOutside);
    };
  }, [isSearchActive]);

  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    const scrollableElement = scrollableRef.current;

    if (!sidebarElement || !scrollableElement) return;

    const handleWheel = (event: WheelEvent) => {
      if (isSearchActive) {
        return;
      }

      if (scrollableElement.contains(event.target as Node)) {
        return;
      }

      event.preventDefault();
      scrollableElement.scrollTop += event.deltaY;
    };

    sidebarElement.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      sidebarElement.removeEventListener("wheel", handleWheel);
    };
  }, [isSearchActive]);

  const Logo = ({ className }: { className?: string }) => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17.92 0.00800058C30.784 0.147208 32 1.9985 32 15.9992L31.9904 17.9193C31.8512 30.7839 30 32 16 32L14.08 31.9904C1.8272 31.8576 0.1424 30.1727 0.00960007 17.9177L0 15.5048L0.00960007 14.0807C0.1456 1.52007 1.9136 0.0640032 15.0208 0L17.9184 0.00800058H17.92ZM10 7.9988H9.0672C8.8115 7.99865 8.56425 8.09032 8.37044 8.25712C8.17663 8.42392 8.04915 8.65477 8.0112 8.90765L8 9.06605V14.9319C8 15.468 8.3952 15.9112 8.9088 15.988L9.0672 15.9992H10C11.536 15.9991 13.0136 16.588 14.1283 17.6448C15.243 18.7015 15.9101 20.1456 15.992 21.6795L16 21.9995V22.9323C16 23.4684 16.3952 23.9116 16.9088 23.9884L17.0672 23.9996H22.9328C23.1885 23.9998 23.4358 23.9081 23.6296 23.7413C23.8234 23.5745 23.9508 23.3436 23.9888 23.0908L24 22.9323V21.9995C23.9999 18.3578 22.581 14.8595 20.0443 12.2468C17.5076 9.63404 14.0527 8.11258 10.4128 8.0052L10 7.9988Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <>
      <div
        className={cn(
          "bg-bg-white-0 fixed z-60 h-full transition-all duration-300 ease-in-out lg:relative lg:z-50 lg:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
          isSidebarCollapsed ? "w-18" : "w-full lg:w-[272px]",
        )}
      >
        <div
          onClick={toggleSidebar}
          className={cn(
            "group absolute inset-0 hidden h-full w-18 cursor-e-resize flex-col justify-between p-5 transition-opacity duration-300 lg:flex",
            isSidebarCollapsed
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <div className="space-y-5">
            <div className="before:bg-stroke-soft-200 relative flex pb-5 before:absolute before:right-0 before:bottom-0 before:left-0 before:h-px">
              <Tooltip.Provider delayDuration={300}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button.Root
                      variant="neutral"
                      mode="ghost"
                      size="xsmall"
                      aria-label="Toggle sidebar"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSidebar();
                      }}
                      className="group/logo hover:bg-bg-weak-50 h-8 w-8 cursor-e-resize p-0"
                    >
                      <Logo className="size-8 text-green-600 transition-opacity duration-200 group-hover:hidden" />
                      <Button.Icon
                        as={RiSideBarLine}
                        className="text-text-soft-400 group-hover/logo:text-text-sub-600 hidden transition-opacity duration-200 group-hover:block"
                      />
                    </Button.Root>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-bg-strong-950 text-text-white-0 shadow-tooltip z-61 rounded-md px-2 py-1 text-xs font-medium"
                      side="right"
                      sideOffset={8}
                      align="center"
                    >
                      Toggle sidebar
                      <Tooltip.Arrow className="fill-bg-strong-950" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
            <div className="space-y-3">
              {sidebarData.sections[0].items?.map((item) => {
                const IconComponent = (item as any).icon;
                const isNewChat = item.id === "new-chat";
                const itemPath = item.href.split("?")[0];
                const isActive = pathname === itemPath;
                const itemLabel = (item as any).label || (item as any).title;

                return (
                  <Tooltip.Provider key={item.id} delayDuration={300}>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <Link
                          href={item.href}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLinkClick();
                          }}
                          className={cn(
                            "group/item flex items-center justify-between rounded-lg p-1.5 pr-2 text-sm font-medium transition-colors duration-200",
                            isNewChat
                              ? "p-0 text-green-600"
                              : "text-text-sub-600 hover:bg-bg-weak-50",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {IconComponent && (
                              <IconComponent
                                className={cn(
                                  "h-5 w-5 transition duration-200 ease-out",
                                  isNewChat
                                    ? "bg-green-alpha-10 size-8 rounded-full p-1.5 text-green-600"
                                    : isActive
                                      ? "text-green-600"
                                      : "group-hover/item:text-text-sub-600 text-text-soft-400",
                                )}
                              />
                            )}
                          </div>
                        </Link>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          className="bg-bg-strong-950 text-text-white-0 shadow-tooltip z-50 rounded-md px-2 py-1 text-xs font-medium"
                          side="right"
                          sideOffset={8}
                          align="center"
                        >
                          {itemLabel}
                          <Tooltip.Arrow className="fill-bg-strong-950" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </Tooltip.Provider>
                );
              })}

              <Tooltip.Provider delayDuration={300}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button.Root
                      variant="neutral"
                      mode="ghost"
                      size="xsmall"
                      aria-label="Toggle Search"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMiniSearchClick();
                      }}
                      className="group/search hover:bg-bg-weak-50 cursor-pointer"
                    >
                      <Button.Icon
                        as={RiSearchLine}
                        className="text-text-soft-400 group-hover/search:text-text-sub-600"
                      />
                    </Button.Root>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="bg-bg-strong-950 text-text-white-0 shadow-tooltip z-50 rounded-md px-2 py-1 text-xs font-medium"
                      side="right"
                      sideOffset={8}
                      align="center"
                    >
                      Toggle Search
                      <Tooltip.Arrow className="fill-bg-strong-950" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>
          <div className="before:bg-stroke-soft-200 relative flex pt-5 before:absolute before:top-0 before:right-0 before:left-0 before:h-px">
            <Button.Root
              variant="neutral"
              mode="ghost"
              size="xsmall"
              aria-label="Toggle profile"
              onClick={(e) => {
                e.stopPropagation();
                setIsProfileOpenMini(!isProfileOpenMini);
              }}
              className={cn(
                "text-static-black tracking-spacing-tiny-2 size-8 cursor-pointer rounded-full p-0.75 text-sm font-medium transition-all duration-200",
                isProfileOpenMini
                  ? "bg-bg-weak-50 shadow-gray-shadow"
                  : "hover:bg-bg-weak-50 bg-neutral-200",
              )}
            >
              {sidebarData.user.avatar}
            </Button.Root>
          </div>
        </div>

        {isProfileOpenMini && (
          <div
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-bg-white-0 shadow-complex absolute bottom-15 left-10 z-50 flex h-auto w-62 cursor-default flex-col gap-1 rounded-2xl p-1.5"
          >
            <div className="flex gap-2 p-2">
              <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                <div className="text-static-black text-base font-medium">
                  {sidebarData.user.avatar}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <div className="text-text-strong-950 text-sm font-medium tracking-[var(--letter-spacing-title-h4)]">
                    {sidebarData.user.name}
                  </div>
                  <div className="text-success-dark text-2xs tracking-spacing-tiny bg-success-light flex items-center justify-center rounded-[5px] px-1.5 py-0.5 leading-3 font-medium">
                    {sidebarData.user.isPro ? "Pro" : ""}
                  </div>
                </div>
                <div className="text-text-soft-400 text-xs/snug font-medium">
                  {sidebarData.user.email}
                </div>
              </div>
            </div>
            <div className="border-stroke-soft-200 flex items-center gap-2 border-t p-2 pt-3">
              <RiMoonLine className="text-text-soft-400 size-5 rounded-lg" />
              <span className="text-text-sub-600 tracking-spacing-tiny-2 flex-1 text-sm font-medium">
                Dark Mode
              </span>
              <Switch.Root
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
              />
            </div>
            <div className="border-stroke-soft-200 flex flex-col gap-1 border-t pt-1">
              {sidebarData.user.profileMenu
                .filter((item) => item.variant !== "danger")
                .map((item) => {
                  const IconComponent = item.icon;
                  if (item.id === "settings") {
                    return (
                      <Button.Root
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsSettingsOpen(true);
                          setIsProfileOpenMini(false);
                        }}
                        className="group hover:bg-bg-weak-50 flex h-auto w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-transparent p-2 duration-300"
                      >
                        <Button.Icon
                          as={IconComponent}
                          className="text-text-soft-400 -mx-0 flex max-w-5 min-w-5 rounded-lg"
                        />
                        <span className="text-text-sub-600 group-hover:text-text-strong-950 tracking-spacing-tiny-2 flex-1 text-left text-sm font-medium duration-300">
                          {item.label}
                        </span>
                      </Button.Root>
                    );
                  }
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="group hover:bg-bg-weak-50 flex items-center gap-2 rounded-lg p-2 duration-300"
                    >
                      <IconComponent className="text-text-soft-400 size-5 rounded-lg" />
                      <span className="text-text-sub-600 group-hover:text-text-strong-950 tracking-spacing-tiny-2 flex-1 text-sm font-medium duration-300">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
            </div>
            <div className="border-stroke-soft-200 flex flex-col gap-1 border-t pt-1">
              {sidebarData.user.profileMenu
                .filter((item) => item.variant === "danger")
                .map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={(e) => e.stopPropagation()}
                      className="group hover:bg-bg-weak-50 flex items-center gap-2 rounded-lg p-2 duration-300"
                    >
                      <IconComponent className="text-error-base size-5 rounded-lg" />
                      <span className="text-text-sub-600 group-hover:text-text-strong-950 tracking-spacing-tiny-2 flex-1 text-sm font-medium duration-300">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              <div className="text-text-soft-400 p-2 text-xs/snug">
                {sidebarData.user.version} ·{" "}
                <Link
                  href={sidebarData.user.termsUrl}
                  className="hover:text-text-sub-600"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        )}

        <div
          className={cn(
            "h-full transition-opacity duration-300 ease-in-out",
            !isSidebarCollapsed
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
        >
          <nav
            ref={sidebarRef}
            className="flex h-full w-full flex-col whitespace-nowrap lg:w-[272px]"
          >
            <div className="bg-bg-white-0 after:bg-stroke-soft-200 sticky top-0 z-10 after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px lg:pt-5 lg:after:right-5 lg:after:left-5">
              <div className="border-stroke-soft-200 flex items-center justify-between border-b py-4 pr-4 pl-5 lg:border-none lg:py-0 lg:pr-3.5">
                <Link href="/">
                  <Logo className="size-7 text-green-600 transition-opacity duration-200 group-hover:hidden lg:size-8" />
                </Link>
                <Button.Root
                  variant="neutral"
                  mode="ghost"
                  size="xsmall"
                  onClick={toggleMobileSidebar}
                  className="group hover:bg-bg-weak-50 flex size-8 items-center justify-center p-0 lg:hidden"
                >
                  <Button.Icon
                    as={RiCloseLine}
                    className="text-text-soft-400 group-hover:text-text-sub-600 size-5"
                  />
                </Button.Root>
                <Tooltip.Provider delayDuration={300}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Button.Root
                        variant="neutral"
                        mode="ghost"
                        size="xsmall"
                        onClick={toggleSidebar}
                        className="group hover:bg-bg-weak-50 hidden cursor-w-resize lg:flex"
                      >
                        <Button.Icon
                          as={RiSideBarLine}
                          className="text-text-soft-400 group-hover:text-text-sub-600"
                        />
                      </Button.Root>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        className="bg-bg-strong-950 text-text-white-0 shadow-tooltip z-50 rounded-lg px-2.5 py-1 text-xs"
                        sideOffset={6}
                        align="center"
                      >
                        Toggle sidebar
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              </div>

              <div className="relative p-5 lg:px-3.5 lg:pt-4 lg:pb-3.5">
                <Input.Root
                  size="small"
                  className="!rounded-10 has-[input:focus]:!shadow-gray-shadow-2 !shadow-none"
                >
                  <Input.Wrapper className="bg-bg-weak-50 px-2">
                    <Input.Icon
                      as={RiSearchLine}
                      className="!text-text-soft-400"
                    />
                    <Input.Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={() => setIsSearchActive(true)}
                      className="placeholder:text-text-soft-400 group-hover:hover:placeholder:text-text-sub-600"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="text-text-soft-400 hover:text-text-sub-600 flex items-center justify-center transition-colors duration-200"
                      >
                        <RiCloseLine className="size-5" />
                      </button>
                    )}
                  </Input.Wrapper>
                </Input.Root>

                {isSearchActive && (
                  <div
                    data-search-overlay
                    className="bg-bg-white-0 absolute top-full right-0 left-0 z-50 h-[calc(100vh-196px)] overflow-y-auto px-3.5 pt-2 pb-3.5"
                    style={{ scrollbarWidth: "none" }}
                  >
                    <h3 className="text-text-soft-400 mb-2 px-1.5 text-xs font-medium">
                      Recents
                    </h3>
                    <div className="space-y-1">
                      {filteredHistoryItems.length > 0 ? (
                        filteredHistoryItems.map((item) => {
                          const itemPath = item.href.split("?")[0];
                          const isActive = pathname === itemPath;
                          const isSearchPopoverOpen =
                            searchPopovers[item.id] || false;
                          return (
                            <Popover.Root
                              key={`search-${item.id}`}
                              open={isSearchPopoverOpen}
                              onOpenChange={(open) =>
                                toggleSearchPopover(item.id, open)
                              }
                            >
                              <div
                                className={cn(
                                  "group flex items-center justify-between rounded-lg pr-1.5 transition-colors duration-200",
                                  isActive
                                    ? "bg-bg-weak-50"
                                    : isSearchPopoverOpen
                                      ? "bg-bg-weak-50"
                                      : "hover:bg-bg-weak-50",
                                )}
                              >
                                <Link
                                  href={item.href}
                                  className="text-text-sub-600 flex-1 p-1.5 pr-0 text-sm font-medium"
                                  onClick={() => {
                                    setIsSearchActive(false);
                                    setSearchQuery("");
                                    handleLinkClick();
                                  }}
                                >
                                  {highlightText(
                                    (item as any).label || (item as any).title,
                                    searchQuery,
                                  )}
                                </Link>
                                <Popover.Trigger asChild>
                                  <Button.Root
                                    variant="neutral"
                                    mode="ghost"
                                    size="xsmall"
                                    aria-label="More options"
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    className={cn(
                                      "group hover:bg-bg-sub-100 flex size-4.5 cursor-pointer items-center justify-center p-0 transition-opacity",
                                      isSearchPopoverOpen
                                        ? "opacity-100"
                                        : "opacity-100 group-hover:opacity-100 lg:opacity-0",
                                    )}
                                  >
                                    <Button.Icon
                                      as={RiMore2Line}
                                      className="text-text-soft-400 size-full"
                                    />
                                  </Button.Root>
                                </Popover.Trigger>
                                <Popover.Portal>
                                  <Popover.Content
                                    className="bg-bg-white-0 shadow-complex z-[60] min-w-30 rounded-xl p-1"
                                    side="bottom"
                                    sideOffset={16}
                                    align="start"
                                    alignOffset={-2}
                                    avoidCollisions={true}
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                    onPointerDown={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      <Button.Root
                                        variant="neutral"
                                        mode="ghost"
                                        size="small"
                                        className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                                      >
                                        <Button.Icon
                                          as={RiPushpinLine}
                                          className="text-text-soft-400 group-hover/menu-item:text-text-sub-600 !-mx-0 !size-4"
                                        />
                                        Pinned
                                      </Button.Root>

                                      <Button.Root
                                        variant="neutral"
                                        mode="ghost"
                                        size="small"
                                        className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                                      >
                                        <Button.Icon
                                          as={RiPencilLine}
                                          className="text-text-soft-400 group-hover/menu-item:text-text-sub-600 !-mx-0 !size-4"
                                        />
                                        Rename
                                      </Button.Root>

                                      <Button.Root
                                        variant="neutral"
                                        mode="ghost"
                                        size="small"
                                        className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                                      >
                                        <Button.Icon
                                          as={RiDeleteBinLine}
                                          className="text-error-base !-mx-0 !size-4"
                                        />
                                        Delete
                                      </Button.Root>
                                    </div>
                                  </Popover.Content>
                                </Popover.Portal>
                              </div>
                            </Popover.Root>
                          );
                        })
                      ) : (
                        <div className="text-text-soft-400 p-4 text-center text-sm">
                          {searchQuery.trim()
                            ? "No conversations found"
                            : "No conversations yet"}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 pb-5 lg:px-3.5 lg:pb-4">
                <div className="space-y-1">
                  {sidebarData.sections[0].items?.map((item) => {
                    const IconComponent = (item as any).icon;
                    const isNewChat = item.id === "new-chat";
                    const itemPath = item.href.split("?")[0];
                    const isActive = pathname === itemPath;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "group flex items-center justify-between rounded-lg p-1.5 pr-2 text-sm font-medium transition-colors duration-200",
                          isNewChat
                            ? "hover:bg-green-alpha-10 text-green-600"
                            : isActive
                              ? "text-text-sub-600 bg-bg-weak-50"
                              : "text-text-sub-600 hover:bg-bg-weak-50",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          {IconComponent && (
                            <IconComponent
                              className={cn(
                                "h-5 w-5",
                                isNewChat
                                  ? "bg-green-alpha-10 rounded-full text-green-600"
                                  : isActive
                                    ? "text-green-600"
                                    : "text-gray-400",
                              )}
                            />
                          )}
                          {(item as any).label || (item as any).title}
                        </div>
                        {!isNewChat && (
                          <RiArrowRightSLine
                            className={cn(
                              "text-text-soft-400 size-4.5 transition-opacity group-hover:opacity-100",
                              isActive ? "opacity-100" : "lg:opacity-0",
                            )}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              ref={scrollableRef}
              className="flex-1 overflow-x-hidden overflow-y-auto lg:px-3.5"
              style={{ scrollbarWidth: "none" }}
            >
              {sidebarData.sections.slice(1).map((section, index) => (
                <div key={section.id}>
                  <aside
                    className={cn(
                      "p-5 lg:mb-4 lg:p-0 lg:pt-4",
                      index > 0 &&
                        "before:bg-stroke-soft-200 relative pt-4 before:absolute before:top-0 before:right-0 before:left-0 before:h-px lg:before:right-1.5 lg:before:left-1.5",
                    )}
                  >
                    {section.title && (
                      <h3 className="text-text-soft-400 mb-1 px-1.5 text-xs font-medium lg:mb-1">
                        {section.title}
                      </h3>
                    )}

                    {section.isHistorySection ? (
                      section.subsections?.map((subsection) => (
                        <div
                          key={subsection.id}
                          className="mb-3 last:mb-0 lg:mb-4"
                        >
                          <h3 className="text-text-soft-400 mb-1 px-1.5 text-xs font-medium lg:mb-2">
                            {subsection.title}
                          </h3>
                          <div className="space-y-1">
                            {subsection.items.map((item) => {
                              const itemPath = item.href.split("?")[0];
                              const isActive = pathname === itemPath;
                              const isPopoverOpen =
                                openPopovers[item.id] || false;
                              return (
                                <Popover.Root
                                  key={item.id}
                                  open={isPopoverOpen}
                                  onOpenChange={(open) =>
                                    togglePopover(item.id, open)
                                  }
                                >
                                  <div
                                    className={cn(
                                      "group flex items-center justify-between rounded-lg pr-1.5 transition-colors duration-200",
                                      isActive
                                        ? "bg-bg-weak-50"
                                        : isPopoverOpen
                                          ? "bg-bg-weak-50"
                                          : "hover:bg-bg-weak-50",
                                    )}
                                  >
                                    <Link
                                      href={item.href}
                                      onClick={handleLinkClick}
                                      className={cn(
                                        "text-text-sub-600 flex-1 p-1.5 text-sm font-medium",
                                      )}
                                    >
                                      {(item as any).label ||
                                        (item as any).title}
                                    </Link>
                                    <Popover.Trigger asChild>
                                      <Button.Root
                                        variant="neutral"
                                        mode="ghost"
                                        size="xsmall"
                                        aria-label="More options"
                                        className={cn(
                                          "group hover:bg-bg-sub-100 flex size-4.5 cursor-pointer items-center justify-center p-0 transition-opacity",
                                          isPopoverOpen
                                            ? "opacity-100"
                                            : "opacity-100 group-hover:opacity-100 lg:opacity-0",
                                        )}
                                      >
                                        <Button.Icon
                                          as={RiMore2Line}
                                          className="text-text-soft-400 size-full"
                                        />
                                      </Button.Root>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                      <Popover.Content
                                        className="bg-bg-white-0 shadow-complex z-61 min-w-30 rounded-xl p-1"
                                        side="bottom"
                                        sideOffset={16}
                                        align="start"
                                        alignOffset={-2}
                                        avoidCollisions={true}
                                        onOpenAutoFocus={(e) =>
                                          e.preventDefault()
                                        }
                                      >
                                        <div className="flex flex-col gap-0.5">
                                          <Button.Root
                                            variant="neutral"
                                            mode="ghost"
                                            size="small"
                                            className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                                          >
                                            <Button.Icon
                                              as={RiPushpinLine}
                                              className="text-text-soft-400 group-hover/menu-item:text-text-sub-600 !-mx-0 !size-4"
                                            />
                                            Pinned
                                          </Button.Root>

                                          <Button.Root
                                            variant="neutral"
                                            mode="ghost"
                                            size="small"
                                            className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                                          >
                                            <Button.Icon
                                              as={RiPencilLine}
                                              className="text-text-soft-400 group-hover/menu-item:text-text-sub-600 !-mx-0 !size-4"
                                            />
                                            Rename
                                          </Button.Root>

                                          <Button.Root
                                            variant="neutral"
                                            mode="ghost"
                                            size="small"
                                            className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                                          >
                                            <Button.Icon
                                              as={RiDeleteBinLine}
                                              className="text-error-base !-mx-0 !size-4"
                                            />
                                            Delete
                                          </Button.Root>
                                        </div>
                                      </Popover.Content>
                                    </Popover.Portal>
                                  </div>
                                </Popover.Root>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="space-y-1">
                        {section.items?.map((item) => {
                          const IconComponent = (item as any).icon;
                          const isNewChat = item.id === "new-chat";
                          const itemPath = item.href.split("?")[0];
                          const isActive = pathname === itemPath;
                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "group flex items-center justify-between rounded-lg p-1.5 pr-2 text-sm font-medium transition-colors duration-200",
                                isNewChat
                                  ? "hover:bg-green-alpha-10 text-green-600"
                                  : isActive
                                    ? "text-text-sub-600 bg-bg-weak-50"
                                    : "text-text-sub-600 hover:bg-bg-weak-50",
                              )}
                            >
                              <div className="flex items-center gap-2">
                                {IconComponent && (
                                  <IconComponent
                                    className={cn(
                                      "h-5 w-5",
                                      isNewChat
                                        ? "bg-green-alpha-10 rounded-full text-green-600"
                                        : isActive
                                          ? "text-green-600"
                                          : "text-gray-400",
                                    )}
                                  />
                                )}
                                {(item as any).label || (item as any).title}
                              </div>
                              {!isNewChat && (
                                <RiArrowRightSLine
                                  className={cn(
                                    "text-text-soft-400 size-4.5 transition-opacity group-hover:opacity-100",
                                    isActive ? "opacity-100" : "lg:opacity-0",
                                  )}
                                />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </aside>
                </div>
              ))}
            </div>

            <div
              className="bg-bg-white-0 before:bg-stroke-soft-200 sticky bottom-0 z-30 cursor-pointer p-5 before:absolute before:top-0 before:right-0 before:left-0 before:h-px lg:pt-4.5 lg:before:right-5 lg:before:left-5"
              onClick={() => {
                if (isProfileOpen) {
                  handleProfileClose();
                } else {
                  handleProfileOpen();
                }
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                    <div className="text-static-black text-base font-medium">
                      {sidebarData.user.avatar}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <div className="text-text-strong-950 text-sm font-medium tracking-[var(--letter-spacing-title-h4)]">
                        {sidebarData.user.name}
                      </div>
                      <div className="text-success-dark text-2xs tracking-spacing-tiny bg-success-light flex items-center justify-center rounded-[5px] px-1.5 py-0.5 leading-3 font-medium uppercase">
                        {sidebarData.user.isPro ? "Pro" : ""}
                      </div>
                    </div>
                    <div className="text-text-soft-400 text-xs/snug font-medium">
                      {sidebarData.user.email}
                    </div>
                  </div>
                </div>
                <div className="relative flex">
                  <Button.Root
                    variant="neutral"
                    mode="ghost"
                    size="xsmall"
                    aria-label="Toggle profile"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isProfileOpen) {
                        handleProfileClose();
                      } else {
                        handleProfileOpen();
                      }
                    }}
                    className={cn(
                      "size-6 cursor-pointer rounded-md p-0.75 transition-all duration-200",
                      isProfileOpen
                        ? "bg-bg-weak-50 shadow-gray-shadow"
                        : "hover:bg-bg-weak-50",
                    )}
                  >
                    <Button.Icon
                      as={RiArrowDownSLine}
                      className={cn(
                        "text-text-sub-600 size-6 transition-transform duration-400 lg:size-4.5",
                        isProfileOpen && "rotate-180",
                      )}
                    />
                  </Button.Root>
                  {isProfileOpen && (
                    <div
                      ref={dropdownRef}
                      className={cn(
                        "bg-overlay-gray fixed bottom-0 left-0 z-50 flex h-screen w-full items-end transition-opacity duration-200 lg:absolute lg:bottom-[calc(100%+0.75rem)] lg:h-auto lg:w-62 lg:items-start lg:bg-transparent",
                        isProfileAnimating ? "opacity-100" : "opacity-0",
                      )}
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          handleProfileClose();
                        }
                      }}
                    >
                      <div
                        className={cn(
                          "bg-bg-white-0 lg:shadow-complex flex h-auto w-full transform cursor-default flex-col gap-1 rounded-t-3xl transition-transform duration-300 lg:rounded-2xl lg:p-1.5",
                          isProfileAnimating
                            ? "translate-y-0"
                            : "translate-y-full lg:translate-y-0",
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-3 p-5 lg:p-2">
                          <div className="flex size-10 items-center justify-center rounded-full bg-gray-200">
                            <div className="text-static-black text-base font-medium">
                              {sidebarData.user.avatar}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <div className="text-text-strong-950 text-sm font-medium tracking-[var(--letter-spacing-title-h4)]">
                                {sidebarData.user.name}
                              </div>
                              <div className="text-success-dark text-2xs tracking-spacing-tiny bg-success-light flex items-center justify-center rounded-[5px] px-1.5 py-0.5 leading-3 font-medium">
                                {sidebarData.user.isPro ? "Pro" : ""}
                              </div>
                            </div>
                            <div className="text-text-soft-400 text-xs/snug font-medium">
                              {sidebarData.user.email}
                            </div>
                          </div>
                        </div>
                        <div className="border-stroke-soft-200 flex items-center gap-2 border-t p-5 lg:p-2 lg:pt-3">
                          <RiMoonLine className="text-text-soft-400 size-5 rounded-lg" />
                          <span className="text-text-sub-600 tracking-spacing-tiny-2 flex-1 text-sm font-medium">
                            Dark Mode
                          </span>
                          <Switch.Root
                            checked={theme === "dark"}
                            onCheckedChange={(checked) =>
                              setTheme(checked ? "dark" : "light")
                            }
                            className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
                          />
                        </div>
                        <div className="border-stroke-soft-200 flex flex-col gap-1 border-t lg:pt-1">
                          {sidebarData.user.profileMenu
                            .filter((item) => item.variant !== "danger")
                            .map((item) => {
                              const IconComponent = item.icon;
                              if (item.id === "settings") {
                                return (
                                  <Button.Root
                                    key={item.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsSettingsOpen(true);
                                      handleProfileClose();
                                    }}
                                    className="group hover:bg-bg-weak-50 flex h-auto w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-transparent px-5 py-3 duration-300 lg:p-2"
                                  >
                                    <Button.Icon
                                      as={IconComponent}
                                      className="text-text-soft-400 -mx-0 flex max-w-5 min-w-5 rounded-lg"
                                    />
                                    <span className="text-text-sub-600 group-hover:text-text-strong-950 tracking-spacing-tiny-2 flex-1 text-left text-sm font-medium duration-300">
                                      {item.label}
                                    </span>
                                    <RiArrowRightSLine className="text-text-soft-400 size-5 lg:hidden" />
                                  </Button.Root>
                                );
                              }
                              return (
                                <Link
                                  key={item.id}
                                  href={item.href}
                                  onClick={(e) => e.stopPropagation()}
                                  className="group hover:bg-bg-weak-50 flex items-center gap-2 rounded-lg px-5 py-3 duration-300 lg:p-2"
                                >
                                  <IconComponent className="text-text-soft-400 size-5 rounded-lg" />
                                  <span className="text-text-sub-600 group-hover:text-text-strong-950 tracking-spacing-tiny-2 flex-1 text-sm font-medium duration-300">
                                    {item.label}
                                  </span>
                                  <RiArrowRightSLine className="text-text-soft-400 size-5 lg:hidden" />
                                </Link>
                              );
                            })}
                        </div>
                        <div className="border-stroke-soft-200 flex flex-col gap-1 border-t lg:pt-1">
                          {sidebarData.user.profileMenu
                            .filter((item) => item.variant === "danger")
                            .map((item) => {
                              const IconComponent = item.icon;
                              return (
                                <Link
                                  key={item.id}
                                  href={item.href}
                                  className="group hover:bg-bg-weak-50 flex items-center gap-2 rounded-lg px-5 py-3 duration-300 lg:p-2"
                                >
                                  <IconComponent className="text-error-base size-5 rounded-lg" />
                                  <span className="text-text-sub-600 group-hover:text-text-strong-950 tracking-spacing-tiny-2 flex-1 text-sm font-medium duration-300">
                                    {item.label}
                                  </span>
                                </Link>
                              );
                            })}
                          <div className="text-text-soft-400 px-5 py-2 text-xs/snug lg:p-2">
                            {sidebarData.user.version} ·{" "}
                            <Link
                              href={sidebarData.user.termsUrl}
                              className="hover:text-text-sub-600"
                            >
                              Terms & Conditions
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
});

MainSidebar.displayName = "MainSidebar";

export default MainSidebar;
