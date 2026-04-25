"use client";
import { usePathname } from "next/navigation";
import SettingsHeader from "@/components/layout/settings-header";
import {
  RiFileUserFill,
  RiBankCardFill,
  RiUser3Fill,
  RiSettings4Fill,
  RiEyeFill,
  RiLock2Fill,
  RiShieldUserFill,
  RiBrainFill,
  RiEqualizerFill,
  RiQuillPenAiFill,
  RiArrowRightSLine,
} from "@remixicon/react";

interface BaseItem {
  id: string;
  label: string;
  href: string;
}

interface RegularItem extends BaseItem {
  icon: React.ComponentType<{ className?: string }>;
  isUserItem?: false;
}

interface UserItem extends BaseItem {
  icon: null;
  isUserItem: true;
}

type SidebarItem = RegularItem | UserItem;

interface Section {
  id: string;
  title: string;
  items: SidebarItem[];
}

interface SettingsData {
  user: {
    name: string;
    isPro: boolean;
  };
  sections: Section[];
}

function isUserItem(item: SidebarItem): item is UserItem {
  return item.isUserItem === true;
}

function isRegularItem(item: SidebarItem): item is RegularItem {
  return item.isUserItem !== true;
}

const settingsData: SettingsData = {
  user: {
    name: "James Brown",
    isPro: true,
  },
  sections: [
    {
      id: "workspace",
      title: "Workspace",
      items: [
        {
          id: "workspace-main",
          label: "James Brown",
          icon: null,
          href: "/settings",
          isUserItem: true,
        },
        {
          id: "people",
          label: "People",
          icon: RiFileUserFill,
          href: "/settings/people",
        },
        {
          id: "plans-billing",
          label: "Plans & Billing",
          icon: RiBankCardFill,
          href: "/settings/plans-billing",
        },
      ],
    },
    {
      id: "account",
      title: "Account",
      items: [
        {
          id: "profile-account",
          label: "Profile",
          icon: RiUser3Fill,
          href: "/settings/profile",
        },
        {
          id: "preferences",
          label: "Preferences",
          icon: RiSettings4Fill,
          href: "/settings/preferences",
        },
        {
          id: "appearance",
          label: "Appearance",
          icon: RiEyeFill,
          href: "/settings/appearance",
        },
      ],
    },
    {
      id: "security",
      title: "Security",
      items: [
        {
          id: "security-settings",
          label: "Security",
          icon: RiLock2Fill,
          href: "/settings/security",
        },
        {
          id: "privacy-data",
          label: "Privacy & Data",
          icon: RiShieldUserFill,
          href: "/settings/privacy-data",
        },
      ],
    },
    {
      id: "features",
      title: "Features",
      items: [
        {
          id: "ai-settings",
          label: "AI Settings",
          icon: RiBrainFill,
          href: "/settings/ai-settings",
        },
        {
          id: "integrations",
          label: "Integrations",
          icon: RiEqualizerFill,
          href: "/settings/integrations",
        },
        {
          id: "advanced",
          label: "Advanced",
          icon: RiQuillPenAiFill,
          href: "/settings/advanced",
        },
      ],
    },
  ],
};

interface SettingsSidebarProps {
  activePage?: string;
  onPageChange?: (pageId: string) => void;
  onClose?: () => void;
  isMobileContentShown?: boolean;
}

export default function SettingsSidebar({
  activePage,
  onPageChange,
  onClose,
  isMobileContentShown,
}: SettingsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="bg-bg-white-0 flex h-dvh w-full flex-col rounded-t-3xl py-4 lg:h-full lg:min-h-full lg:w-1/5 lg:min-w-60 lg:rounded-none lg:p-3.5">
      <div className="flex w-full flex-shrink-0 lg:hidden">
        <SettingsHeader
          title={"Settings"}
          description={"Manage your workspace ownership and settings."}
          onClose={onClose}
        />
      </div>
      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto lg:gap-3">
        {settingsData.sections.map((section, sectionIndex) => (
          <div
            key={section.id}
            className={`border-stroke-soft-200 flex flex-col gap-1 border-t pt-4 lg:border-none lg:pt-0 ${sectionIndex === 0 ? "border-t-0" : ""} ${sectionIndex === settingsData.sections.length - 1 ? "pb-3" : ""}`}
          >
            <div className="text-text-soft-400 px-7 py-1 text-xs font-medium lg:px-2">
              {section.title}
            </div>

            <div className="flex flex-col gap-1 px-4 lg:px-0">
              {section.items.map((item) => {
                const isActive =
                  isMobileContentShown === false
                    ? false
                    : activePage
                      ? activePage === item.id
                      : pathname === item.href;

                const handleClick = () => {
                  if (onPageChange) {
                    onPageChange(item.id);
                  }
                };

                return (
                  <div
                    key={item.id}
                    onClick={handleClick}
                    className={`group rounded-10 flex cursor-pointer items-center gap-2 p-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "bg-bg-weak-50 text-text-strong-950"
                        : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-sub-600"
                    }`}
                  >
                    {isUserItem(item) ? (
                      <>
                        <div className="ease flex size-5 items-center justify-center rounded-full bg-gray-200 transition duration-200">
                          <div className="text-static-black text-xs font-medium">
                            {settingsData.user.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className={`ease text-sm font-medium transition duration-200 ${
                              isActive
                                ? "text-text-strong-950"
                                : "text-text-sub-600"
                            }`}
                          >
                            {settingsData.user.name}
                          </div>
                          {settingsData.user.isPro && (
                            <div className="text-feature-base text-2xs bg-feature-lighter rounded-[5px] px-1.5 py-0.5 font-semibold uppercase">
                              PRO
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        {isRegularItem(item) && (
                          <item.icon
                            className={`ease size-5 transition duration-200 ${
                              isActive
                                ? "text-green-600"
                                : "text-text-disabled-300 group-hover:text-text-soft-400"
                            }`}
                          />
                        )}
                        {item.label}
                      </>
                    )}
                    {isActive && (
                      <RiArrowRightSLine className="text-text-soft-400 ml-auto size-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
