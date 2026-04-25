"use client";

import * as Button from "@/components/ui/button";
import * as Switch from "@/components/ui/switch";
import { useState } from "react";

interface PrivacySetting {
  id: string;
  label: string;
  description: string;
  type: "switch" | "button";
  enabled?: boolean;
  buttonText?: string;
}

interface Section {
  title: string;
  description: string;
}

interface PrivacyPageData {
  sections: {
    dataCollection: Section;
    dataUsage: Section;
    dataRights: Section;
  };
  settings: {
    dataCollection: PrivacySetting[];
    dataUsage: PrivacySetting[];
    dataRights: PrivacySetting[];
  };
}

const fakePrivacyData: PrivacyPageData = {
  sections: {
    dataCollection: {
      title: "Data collection",
      description: "Control what data we collect and how.",
    },
    dataUsage: {
      title: "Data usage",
      description: "Manage how your data is used.",
    },
    dataRights: {
      title: "Data rights",
      description: "Your privacy rights and data control.",
    },
  },
  settings: {
    dataCollection: [
      {
        id: "crash-reports",
        label: "Crash reports",
        description: "Automatically send error reports to help fix bugs",
        type: "switch",
        enabled: true,
      },
      {
        id: "analytics-tracking",
        label: "Analytics tracking",
        description: "Get notified of new sign-ins",
        type: "switch",
        enabled: true,
      },
    ],
    dataUsage: [
      {
        id: "personalization",
        label: "Personalization",
        description: "Use your data to personalize your experience",
        type: "switch",
        enabled: true,
      },
      {
        id: "ai-training",
        label: "AI training",
        description: "Use conversations to improve AI responses",
        type: "switch",
        enabled: false,
      },
    ],
    dataRights: [
      {
        id: "download-data",
        label: "Download your data",
        description: "Export all your conversations and account data",
        type: "button",
        buttonText: "Download",
      },
      {
        id: "delete-account",
        label: "Delete account",
        description: "Permanently delete your account and all data",
        type: "button",
        buttonText: "Delete",
      },
    ],
  },
};

export default function Privacy() {
  const [switchStates, setSwitchStates] = useState(() => {
    const initialStates: { [key: string]: boolean } = {};
    Object.values(fakePrivacyData.settings).forEach((sectionSettings) => {
      sectionSettings.forEach((setting) => {
        if (setting.type === "switch" && setting.enabled !== undefined) {
          initialStates[setting.id] = setting.enabled;
        }
      });
    });
    return initialStates;
  });

  const handleSwitchChange = (settingId: string) => {
    setSwitchStates((prev) => ({
      ...prev,
      [settingId]: !prev[settingId],
    }));
  };

  const handleButtonClick = (settingId: string) => {};

  const renderSetting = (setting: PrivacySetting) => {
    if (setting.type === "switch") {
      return (
        <Switch.Root
          checked={switchStates[setting.id]}
          onCheckedChange={() => handleSwitchChange(setting.id)}
          className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
        />
      );
    } else {
      if (setting.id === "download-data") {
        return (
          <Button.Root
            size="xsmall"
            variant="neutral"
            mode="stroke"
            onClick={() => handleButtonClick(setting.id)}
            className="text-text-sub-600 !rounded-10 w-full cursor-pointer px-3 text-sm font-medium lg:w-fit"
          >
            {setting.buttonText}
          </Button.Root>
        );
      }
      if (setting.id === "delete-account") {
        return (
          <Button.Root
            size="xsmall"
            variant="error"
            mode="lighter"
            onClick={() => handleButtonClick(setting.id)}
            className="!rounded-10 w-full cursor-pointer px-3 text-sm font-medium lg:w-fit"
          >
            {setting.buttonText}
          </Button.Root>
        );
      }
      return (
        <Button.Root
          size="xsmall"
          variant="neutral"
          mode="stroke"
          onClick={() => handleButtonClick(setting.id)}
          className="text-text-sub-600 !rounded-10 w-full cursor-pointer px-3 text-sm font-medium lg:w-fit"
        >
          {setting.buttonText}
        </Button.Root>
      );
    }
  };

  const renderSection = (sectionKey: keyof typeof fakePrivacyData.settings) => {
    const sectionData = fakePrivacyData.sections[sectionKey];
    const sectionSettings = fakePrivacyData.settings[sectionKey];

    return (
      <div
        key={sectionKey}
        className={`border-stroke-soft-200 flex flex-col gap-5 border-t px-5 pt-5 lg:flex-row lg:gap-4 lg:border-t-0 lg:px-0 lg:pt-7 ${sectionKey === "dataCollection" ? "border-t-0" : ""} `}
      >
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {sectionData.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {sectionData.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 lg:gap-5">
          {sectionSettings.map((setting) => (
            <div
              key={setting.id}
              className={`flex ${setting.type === "button" ? "flex-col items-start gap-4 lg:flex-row lg:items-center" : "items-center"} justify-between`}
            >
              <div className="flex flex-col gap-1">
                <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                  {setting.label}
                </div>
                <div className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
                  {setting.description}
                </div>
              </div>
              {renderSetting(setting)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-4 lg:px-7 lg:pb-0">
      {renderSection("dataCollection")}
      {renderSection("dataUsage")}
      {renderSection("dataRights")}
    </div>
  );
}
