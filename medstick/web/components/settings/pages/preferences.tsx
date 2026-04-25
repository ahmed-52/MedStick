"use client";

import { RiAddLine, RiSubtractLine } from "@remixicon/react";
import * as Button from "@/components/ui/button";
import * as Switch from "@/components/ui/switch";
import * as Select from "@/components/ui/select";
import { useState } from "react";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface BehaviorSetting {
  id: string;
  label: string;
  description: string;
  type: "switch" | "select" | "counter";
  enabled?: boolean;
  value?: string | number;
  options?: { value: string; label: string }[];
  minValue?: number;
  maxValue?: number;
}

interface Section {
  title: string;
  description: string;
}

interface PreferencesPageData {
  sections: {
    notifications: Section;
    behavior: Section;
  };
  notifications: NotificationSetting[];
  behavior: BehaviorSetting[];
}

const fakePreferencesData: PreferencesPageData = {
  sections: {
    notifications: {
      title: "Notifications",
      description: "Email and push notification settings.",
    },
    behavior: {
      title: "Behavior",
      description: "Default actions and shortcuts.",
    },
  },
  notifications: [
    {
      id: "email-notifications",
      label: "Email notifications",
      description: "Receive updates via email",
      enabled: true,
    },
    {
      id: "desktop-notifications",
      label: "Desktop notifications",
      description: "Show browser notifications",
      enabled: false,
    },
    {
      id: "sound-alerts",
      label: "Sound alerts",
      description: "Play notification sounds",
      enabled: true,
    },
  ],
  behavior: [
    {
      id: "auto-save-conversations",
      label: "Auto-save conversations",
      description: "Automatically save chat history",
      type: "switch",
      enabled: true,
    },
    {
      id: "enter-to-send",
      label: "Enter to send",
      description: "Send messages with Enter key",
      type: "switch",
      enabled: false,
    },
    {
      id: "show-typing-indicator",
      label: "Show typing indicator",
      description: "Display when AI is responding",
      type: "switch",
      enabled: true,
    },
    {
      id: "default-export-format",
      label: "Default export format",
      description: "Preferred file format for exports",
      type: "select",
      value: "PDF",
      options: [
        { value: "PDF", label: "PDF" },
        { value: "DOCX", label: "DOCX" },
        { value: "TXT", label: "TXT" },
        { value: "MD", label: "Markdown" },
      ],
    },
    {
      id: "session-timeout",
      label: "Session timeout",
      description: "Auto-logout after inactivity (minutes)",
      type: "counter",
      value: 30,
      minValue: 5,
      maxValue: 120,
    },
  ],
};

export default function Preferences() {
  const [notifications, setNotifications] = useState(() => {
    const initialNotifications: { [key: string]: boolean } = {};
    fakePreferencesData.notifications.forEach((setting) => {
      initialNotifications[setting.id] = setting.enabled;
    });
    return initialNotifications;
  });

  const [behavior, setBehavior] = useState(() => {
    const initialBehavior: { [key: string]: boolean | string | number } = {};
    fakePreferencesData.behavior.forEach((setting) => {
      if (setting.type === "switch") {
        initialBehavior[setting.id] = setting.enabled || false;
      } else if (setting.type === "select") {
        initialBehavior[setting.id] = setting.value || "";
      } else if (setting.type === "counter") {
        initialBehavior[setting.id] = setting.value || 0;
      }
    });
    return initialBehavior;
  });

  const handleNotificationChange = (id: string, checked: boolean) => {
    setNotifications((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleBehaviorChange = (
    id: string,
    value: boolean | string | number,
  ) => {
    setBehavior((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-4 px-5 pt-5 lg:flex-row lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakePreferencesData.sections.notifications.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakePreferencesData.sections.notifications.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 lg:gap-4">
          {fakePreferencesData.notifications.map((setting) => (
            <div key={setting.id} className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                  {setting.label}
                </div>
                <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                  {setting.description}
                </div>
              </div>
              <Switch.Root
                checked={
                  notifications[setting.id as keyof typeof notifications]
                }
                onCheckedChange={(checked) => {
                  handleNotificationChange(setting.id, checked);
                }}
                className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-4 border-t px-5 pt-5 lg:flex-row lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakePreferencesData.sections.behavior.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakePreferencesData.sections.behavior.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 lg:gap-4">
          {fakePreferencesData.behavior.map((setting) => (
            <div
              key={setting.id}
              className={`flex ${setting.type === "counter" || setting.type === "select" ? "flex-col items-start gap-4 lg:flex-row lg:items-center" : "items-center"} justify-between gap-2`}
            >
              <div className="flex flex-col gap-1">
                <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                  {setting.label}
                </div>
                <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                  {setting.description}
                </div>
              </div>

              {setting.type === "switch" && (
                <Switch.Root
                  checked={behavior[setting.id] as boolean}
                  onCheckedChange={(checked) => {
                    handleBehaviorChange(setting.id, checked);
                  }}
                  className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
                />
              )}

              {setting.type === "select" && setting.options && (
                <Select.Root
                  size="xsmall"
                  value={behavior[setting.id] as string}
                  onValueChange={(value) => {
                    handleBehaviorChange(setting.id, value);
                  }}
                >
                  <Select.Trigger className="text-text-sub-600 w-full text-sm lg:w-auto">
                    <Select.Value
                      placeholder={behavior[setting.id] as string}
                    />
                  </Select.Trigger>
                  <Select.Content className="z-62">
                    {setting.options.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}

              {setting.type === "counter" && (
                <div className="w-full pb-2 lg:max-w-[120px] lg:min-w-[90px] lg:pb-0">
                  <div className="bg-bg-white-0 rounded-10 shadow-custom-input flex items-center gap-2.5 p-1.5">
                    <Button.Root
                      size="xsmall"
                      variant="neutral"
                      mode="ghost"
                      className="hover:bg-bg-weak-50 size-5 cursor-pointer rounded-sm p-0"
                      onClick={() => {
                        const currentValue = behavior[setting.id] as number;
                        const newValue = Math.max(
                          setting.minValue || 5,
                          currentValue - 1,
                        );
                        handleBehaviorChange(setting.id, newValue);
                      }}
                    >
                      <RiSubtractLine className="text-text-soft-400 size-5 shrink-0" />
                    </Button.Root>
                    <div className="text-text-sub-600 min-w-0 flex-1 text-center text-sm font-medium">
                      {behavior[setting.id]}
                    </div>
                    <Button.Root
                      size="xsmall"
                      variant="neutral"
                      mode="ghost"
                      className="hover:bg-bg-weak-50 size-5 shrink-0 cursor-pointer rounded-sm p-0"
                      onClick={() => {
                        const currentValue = behavior[setting.id] as number;
                        const newValue = Math.min(
                          setting.maxValue || 120,
                          currentValue + 1,
                        );
                        handleBehaviorChange(setting.id, newValue);
                      }}
                    >
                      <RiAddLine className="text-text-soft-400 size-5" />
                    </Button.Root>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
