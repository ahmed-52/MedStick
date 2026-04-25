"use client";

import * as Button from "@/components/ui/button";
import * as Switch from "@/components/ui/switch";
import { useState } from "react";

interface SwitchSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface ButtonSetting {
  id: string;
  label: string;
  description: string;
  buttonText: string;
}

interface Section {
  title: string;
  description: string;
}

interface AdvancedPageData {
  sections: {
    developerSettings: Section;
    system: Section;
  };
  developerSettings: SwitchSetting[];
  system: ButtonSetting[];
}

const fakeAdvancedData: AdvancedPageData = {
  sections: {
    developerSettings: {
      title: "Developer settings",
      description: "Advanced developer and debug options.",
    },
    system: {
      title: "System",
      description: "Advanced system configuration.",
    },
  },
  developerSettings: [
    {
      id: "debug-mode",
      label: "Debug mode",
      description: "Enable detailed debugging information",
      enabled: false,
    },
    {
      id: "console-logs",
      label: "Console logs",
      description: "Show technical logs in browser console",
      enabled: false,
    },
    {
      id: "error-reporting",
      label: "Error reporting",
      description: "Send detailed error reports to developers",
      enabled: true,
    },
  ],
  system: [
    {
      id: "cache-management",
      label: "Cache management",
      description: "Clear application cache and temporary files",
      buttonText: "Clear",
    },
    {
      id: "export-settings",
      label: "Export settings",
      description: "Download your configuration as JSON file",
      buttonText: "Export",
    },
    {
      id: "import-settings",
      label: "Import settings",
      description: "Restore configuration from backup file",
      buttonText: "Import",
    },
  ],
};

export default function Advanced() {
  const [developerSettings, setDeveloperSettings] = useState(() => {
    const initialSettings: { [key: string]: boolean } = {};
    fakeAdvancedData.developerSettings.forEach((setting) => {
      initialSettings[setting.id] = setting.enabled;
    });
    return initialSettings;
  });

  const handleDeveloperSettingChange = (id: string, checked: boolean) => {
    setDeveloperSettings((prev) => ({
      ...prev,
      [id]: checked,
    }));
  };

  const handleSystemButtonClick = (id: string) => {};

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-4 px-5 pt-5 lg:flex-row lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeAdvancedData.sections.developerSettings.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeAdvancedData.sections.developerSettings.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5">
          {fakeAdvancedData.developerSettings.map((setting) => (
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
                checked={developerSettings[setting.id]}
                onCheckedChange={(checked) => {
                  handleDeveloperSettingChange(setting.id, checked);
                }}
                className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-4 border-t px-5 pt-5 lg:flex-row lg:border-t-0 lg:px-0 lg:pt-7">
        <div className="flex max-w-75 min-w-75 flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeAdvancedData.sections.system.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeAdvancedData.sections.system.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5">
          {fakeAdvancedData.system.map((setting) => (
            <div
              key={setting.id}
              className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center"
            >
              <div className="flex flex-col gap-1">
                <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                  {setting.label}
                </div>
                <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                  {setting.description}
                </div>
              </div>
              <Button.Root
                size="xsmall"
                variant="neutral"
                mode="stroke"
                onClick={() => handleSystemButtonClick(setting.id)}
                className="text-text-sub-600 !rounded-10 w-full cursor-pointer px-3 text-sm font-medium lg:w-fit"
              >
                {setting.buttonText}
              </Button.Root>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
