"use client";

import * as Button from "@/components/ui/button";
import * as Switch from "@/components/ui/switch";
import { RiCloseLine } from "@remixicon/react";
import { useState } from "react";
import Image from "next/image";

interface AccountSecuritySetting {
  id: string;
  label: string;
  description: string;
  type: "button" | "switch";
  buttonText?: string;
  enabled?: boolean;
}

interface ActiveSession {
  id: string;
  browser: string;
  location: string;
  ipAddress: string;
  icon: string;
}

interface Section {
  title: string;
  description: string;
}

interface SecurityPageData {
  sections: {
    accountSecurity: Section;
    accessControl: Section;
  };
  accountSecurity: AccountSecuritySetting[];
  accessControl: {
    activeSessions: {
      label: string;
      description: string;
      buttonText: string;
      sessions: ActiveSession[];
    };
  };
}

const fakeSecurityData: SecurityPageData = {
  sections: {
    accountSecurity: {
      title: "Account security",
      description: "Password & login security settings.",
    },
    accessControl: {
      title: "Access control",
      description: "Manage device access & sessions.",
    },
  },
  accountSecurity: [
    {
      id: "password",
      label: "Password",
      description: "Last changed 3 months ago",
      type: "button",
      buttonText: "Change",
    },
    {
      id: "two-factor-auth",
      label: "Two-factor authentication",
      description: "Add an extra layer of security to your account",
      type: "button",
      buttonText: "Enable 2FA",
    },
    {
      id: "login-notifications",
      label: "Login notifications",
      description: "Get notified of new sign-ins",
      type: "switch",
      enabled: true,
    },
    {
      id: "password-recovery",
      label: "Password recovery",
      description: "Update your recovery email address",
      type: "button",
      buttonText: "Update",
    },
  ],
  accessControl: {
    activeSessions: {
      label: "Active sessions",
      description: "Manage your logged-in devices",
      buttonText: "View all",
      sessions: [
        {
          id: "1",
          browser: "Google Chrome",
          location: "New York, US",
          ipAddress: "108.62.8.33",
          icon: "chrome",
        },
        {
          id: "2",
          browser: "Arch",
          location: "Los Angeles, US",
          ipAddress: "173.13.91.22",
          icon: "arch",
        },
        {
          id: "3",
          browser: "Mozilla Firefox",
          location: "London, UK",
          ipAddress: "81.12.69.144",
          icon: "firefox",
        },
        {
          id: "4",
          browser: "Safari",
          location: "Toronto, Canada",
          ipAddress: "206.14.2.89",
          icon: "safari",
        },
      ],
    },
  },
};

export default function Security() {
  const [accountSecurity, setAccountSecurity] = useState(() => {
    const initialSecurity: { [key: string]: boolean } = {};
    fakeSecurityData.accountSecurity.forEach((setting) => {
      if (setting.type === "switch" && setting.enabled !== undefined) {
        initialSecurity[setting.id] = setting.enabled;
      }
    });
    return initialSecurity;
  });

  const [activeSessions, setActiveSessions] = useState(
    fakeSecurityData.accessControl.activeSessions.sessions,
  );

  const handleAccountSecurityChange = (id: string, checked: boolean) => {
    setAccountSecurity((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleRemoveSession = (sessionId: string) => {
    setActiveSessions((prev) =>
      prev.filter((session) => session.id !== sessionId),
    );
  };

  const getBrowserIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      chrome: "/icons/icon-google.svg",
      arch: "/icons/icon-arc.svg",
      firefox: "/icons/icon-mozilla-firefox.svg",
      safari: "/icons/icon-safari.svg",
    };

    return iconMap[icon] || "/icons/icon-google.svg";
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-5 px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeSecurityData.sections.accountSecurity.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeSecurityData.sections.accountSecurity.description}
          </p>
        </div>

        <div className="border-stroke-soft-200 flex w-full flex-col gap-5 border-t pt-4 lg:gap-4 lg:border-t-0 lg:pt-0">
          {fakeSecurityData.accountSecurity.map((setting) => (
            <div
              key={setting.id}
              className={`flex ${setting.type === "button" ? "flex-col items-start gap-4 lg:flex-row lg:items-center" : "items-center"} justify-between`}
            >
              <div className="flex flex-col gap-1">
                <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                  {setting.label}
                </div>
                <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                  {setting.description}
                </div>
              </div>

              {setting.type === "button" && (
                <Button.Root
                  size="xsmall"
                  variant="neutral"
                  mode="stroke"
                  className="text-text-sub-600 !rounded-10 w-full cursor-pointer px-3 text-sm font-medium lg:w-fit"
                >
                  {setting.buttonText}
                </Button.Root>
              )}

              {setting.type === "switch" && (
                <Switch.Root
                  checked={accountSecurity[setting.id]}
                  onCheckedChange={(checked) => {
                    handleAccountSecurityChange(setting.id, checked);
                  }}
                  className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-5 border-t px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeSecurityData.sections.accessControl.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeSecurityData.sections.accessControl.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeSecurityData.accessControl.activeSessions.label}
              </div>
              <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                {fakeSecurityData.accessControl.activeSessions.description}
              </div>
            </div>
            <Button.Root
              size="xsmall"
              variant="neutral"
              mode="stroke"
              className="text-text-sub-600 !rounded-10 w-full cursor-pointer px-3 text-sm font-medium lg:w-fit"
            >
              {fakeSecurityData.accessControl.activeSessions.buttonText}
            </Button.Root>
          </div>

          <div className="border-stroke-soft-200 flex flex-col gap-5 border-t pt-5">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between gap-2.5"
              >
                <div className="flex w-[37%] items-center gap-2">
                  <Image
                    src={getBrowserIcon(session.icon)}
                    alt={session.browser}
                    width={20}
                    height={20}
                    className="h-4.5 w-4.5"
                  />
                  <div className="text-text-sub-600 tracking-spacing-tiny-2 text-sm font-medium">
                    {session.browser}
                  </div>
                </div>
                <div className="text-text-soft-400 w-[33%] text-xs font-medium lg:text-sm">
                  {session.location}
                </div>
                <div className="text-text-soft-400 w-[19%] text-xs font-medium lg:text-sm">
                  {session.ipAddress}
                </div>
                <Button.Root
                  size="xsmall"
                  variant="neutral"
                  mode="ghost"
                  className="hover:bg-bg-weak-50 size-5 cursor-pointer rounded-sm p-0 transition-colors"
                  onClick={() => handleRemoveSession(session.id)}
                >
                  <RiCloseLine className="text-text-soft-400 size-5" />
                </Button.Root>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
