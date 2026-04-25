"use client";

import {
  RiArrowDownSLine,
  RiMore2Line,
  RiPushpinLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiShareLine,
  RiShareForwardBoxLine,
  RiMenu3Line,
  RiAddCircleLine,
  RiAddLine,
  RiMoreLine,
} from "@remixicon/react";
import { useState, useEffect } from "react";
import * as Button from "@/components/ui/button";
import { cn } from "@/utils/cn";
import * as Popover from "@radix-ui/react-popover";
import { useSidebar } from "@/contexts/sidebar-context";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  showDropdown?: boolean;
  className?: string;
  onMenuClick?: () => void;
}

export default function ChatHeader({
  title,
  subtitle,
  className,
  onMenuClick,
}: ChatHeaderProps) {
  const { onMenuClick: contextMenuClick } = useSidebar();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  const handleMenuClick = onMenuClick || contextMenuClick;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isDesktop) {
    return (
      <header
        className={cn(
          "absolute top-4 left-5 flex w-[calc(100%-32px)] items-center justify-between",
          className,
        )}
      >
        <div className="flex items-center gap-1">
          <h1 className="text-text-soft-400 tracking-spacing-tiny-2 text-sm">
            {title}
          </h1>
          <span className="text-text-soft-400 tracking-spacing-tiny-2 text-sm">
            /
          </span>
          <span className="text-text-sub-600 tracking-spacing-tiny-2 text-sm">
            {subtitle}
          </span>
          <Popover.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <Popover.Trigger asChild>
              <Button.Root
                variant="neutral"
                mode="ghost"
                className={cn(
                  "size-5 cursor-pointer rounded-md p-0 transition-all duration-200",
                  isDropdownOpen && "shadow-gray-shadow bg-bg-weak-50",
                )}
              >
                <Button.Icon
                  as={RiArrowDownSLine}
                  className={cn(
                    "text-text-soft-400 hover:text-text-sub-600 size-5 transition-transform duration-400",
                    isDropdownOpen && "text-text-sub-600 rotate-180",
                  )}
                />
              </Button.Root>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-bg-white-0 shadow-complex z-50 min-w-30 rounded-xl p-1"
                side="bottom"
                sideOffset={10}
                align="start"
                alignOffset={0}
                avoidCollisions={true}
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
          </Popover.Root>
        </div>

        <div className="flex items-center gap-2">
          <Popover.Root open={isActionsOpen} onOpenChange={setIsActionsOpen}>
            <Popover.Trigger asChild>
              <Button.Root
                variant="neutral"
                mode="ghost"
                className={cn(
                  "group size-7 cursor-pointer rounded-md p-0 transition-all duration-200",
                  isActionsOpen && "shadow-gray-shadow bg-bg-weak-50",
                )}
              >
                <Button.Icon
                  as={RiMore2Line}
                  className={cn(
                    "text-text-soft-400 hover:text-text-sub-600 group-hover:text-text-sub-600 size-5 transition-transform duration-400",
                    isActionsOpen && "text-text-sub-600",
                  )}
                />
              </Button.Root>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-bg-white-0 shadow-complex z-50 min-w-30 rounded-xl p-1"
                side="left"
                sideOffset={10}
                align="start"
                alignOffset={0}
                avoidCollisions={true}
              >
                <div className="flex flex-col gap-0.5">
                  <Button.Root
                    variant="neutral"
                    mode="ghost"
                    size="small"
                    className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                  >
                    <Button.Icon
                      as={RiShareLine}
                      className="text-text-soft-400 group-hover/menu-item:text-text-sub-600 !-mx-0 !size-4"
                    />
                    Share
                  </Button.Root>

                  <Button.Root
                    variant="neutral"
                    mode="ghost"
                    size="small"
                    className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                  >
                    <Button.Icon
                      as={RiShareForwardBoxLine}
                      className="text-text-soft-400 group-hover/menu-item:text-text-sub-600 !-mx-0 !size-4"
                    />
                    Export
                  </Button.Root>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "border-stroke-soft-200 bg-bg-white-0 z-1 flex items-center justify-between border-b px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className="flex">
          <Button.Root
            variant="neutral"
            mode="ghost"
            onClick={handleMenuClick}
            className="size-8 cursor-pointer rounded-lg p-0"
          >
            <Button.Icon
              as={RiMenu3Line}
              className="text-text-soft-400 size-5"
            />
          </Button.Root>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex">
            <Button.Root
              variant="neutral"
              mode="ghost"
              size="xxsmall"
              className="text-text-sub-600 h-5 cursor-pointer gap-1 p-0"
            >
              GPT-4
              <Button.Icon
                as={RiArrowDownSLine}
                className="text-text-soft-400 size-4"
              />
            </Button.Root>
          </div>
          <div className="text-label-xs text-text-soft-400">
            Design help project
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <Button.Root
          variant="neutral"
          mode="ghost"
          className="bg-green-alpha-10 size-8 cursor-pointer rounded-full p-0.5"
        >
          <Button.Icon as={RiAddLine} className="size-4.5 text-green-600" />
        </Button.Root>

        <Popover.Root open={isActionsOpen} onOpenChange={setIsActionsOpen}>
          <Popover.Trigger asChild>
            <Button.Root
              variant="neutral"
              mode="ghost"
              className={cn(
                "size-8 cursor-pointer p-0",
                isActionsOpen && "shadow-gray-shadow bg-bg-weak-50",
              )}
            >
              <Button.Icon
                as={RiMoreLine}
                className={cn(
                  "text-text-soft-400 hover:text-text-sub-600 group-hover:text-text-sub-600 size-5",
                  isActionsOpen && "text-text-sub-600",
                )}
              />
            </Button.Root>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              className="bg-bg-white-0 shadow-complex z-50 min-w-30 rounded-xl p-1"
              side="bottom"
              sideOffset={10}
              align="end"
              alignOffset={0}
              avoidCollisions={true}
            >
              <div className="flex flex-col gap-0.5">
                <Button.Root
                  variant="neutral"
                  mode="ghost"
                  size="small"
                  className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                >
                  <Button.Icon
                    as={RiShareLine}
                    className="text-text-soft-400 group-hover/menu-item:text-text-sub-600 !-mx-0 !size-4"
                  />
                  Share
                </Button.Root>

                <Button.Root
                  variant="neutral"
                  mode="ghost"
                  size="small"
                  className="group/menu-item text-text-sub-600 !h-auto cursor-pointer justify-start !gap-1.5 !p-1.5 text-xs font-medium"
                >
                  <Button.Icon
                    as={RiShareForwardBoxLine}
                    className="text-text-soft-400 group-hover/menu-item:text-text-sub-600 !-mx-0 !size-4"
                  />
                  Export
                </Button.Root>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </header>
  );
}
