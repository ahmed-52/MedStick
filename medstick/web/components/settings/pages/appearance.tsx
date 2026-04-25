"use client";

import * as Label from "@/components/ui/label";
import * as Radio from "@/components/ui/radio";
import * as Switch from "@/components/ui/switch";
import * as Select from "@/components/ui/select";
import { useState } from "react";
import { useTheme } from "next-themes";

interface ThemeOption {
  id: string;
  value: string;
  label: string;
}

interface DisplaySetting {
  id: string;
  label: string;
  description: string;
  type: "select" | "switch";
  value?: string | boolean;
  options?: { value: string; label: string }[];
}

interface AccessibilitySetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface Section {
  title: string;
  description: string;
}

interface AppearancePageData {
  sections: {
    theme: Section;
    display: Section;
    accessibility: Section;
  };
  theme: {
    options: ThemeOption[];
    selected: string;
    colorThemeLabel: string;
    colorThemeDescription: string;
  };
  display: DisplaySetting[];
  accessibility: AccessibilitySetting[];
}

const fakeAppearanceData: AppearancePageData = {
  sections: {
    theme: {
      title: "Theme",
      description: "Color scheme and visual style.",
    },
    display: {
      title: "Display",
      description: "Layout and typography options.",
    },
    accessibility: {
      title: "Accessibility",
      description: "Accessibility and readability options.",
    },
  },
  theme: {
    options: [
      { id: "light", value: "light", label: "Light" },
      { id: "dark", value: "dark", label: "Dark" },
      { id: "system", value: "system", label: "System" },
    ],
    selected: "light",
    colorThemeLabel: "Color theme",
    colorThemeDescription: "Choose your preferred color scheme",
  },
  display: [
    {
      id: "font-size",
      label: "Font size",
      description: "Adjust text size for better readability",
      type: "select",
      value: "medium",
      options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "xlarge", label: "Extra Large" },
      ],
    },
    {
      id: "compact-mode",
      label: "Compact mode",
      description: "Reduce spacing for more content on screen",
      type: "switch",
      value: false,
    },
    {
      id: "animations",
      label: "Animations",
      description: "Enable smooth transitions and effects",
      type: "switch",
      value: true,
    },
  ],
  accessibility: [
    {
      id: "high-contrast",
      label: "High contrast",
      description: "Increase contrast for better visibility",
      enabled: false,
    },
    {
      id: "reduce-motion",
      label: "Reduce motion",
      description: "Minimize animations and transitions",
      enabled: true,
    },
    {
      id: "focus-indicators",
      label: "Focus indicators",
      description: "Enhanced keyboard navigation",
      enabled: true,
    },
  ],
};

export default function Appearance() {
  const { theme, setTheme } = useTheme();

  const [display, setDisplay] = useState(() => {
    const initialDisplay: { [key: string]: boolean | string } = {};
    fakeAppearanceData.display.forEach((setting) => {
      if (setting.type === "switch") {
        initialDisplay[setting.id] = setting.value as boolean;
      } else if (setting.type === "select") {
        initialDisplay[setting.id] = setting.value as string;
      }
    });
    return initialDisplay;
  });

  const [accessibility, setAccessibility] = useState(() => {
    const initialAccessibility: { [key: string]: boolean } = {};
    fakeAppearanceData.accessibility.forEach((setting) => {
      initialAccessibility[setting.id] = setting.enabled;
    });
    return initialAccessibility;
  });

  const handleSettingChange = (
    section: "theme" | "display" | "accessibility",
    id: string,
    value: string | boolean,
  ) => {
    if (section === "theme") {
      setTheme(value as string);
    } else if (section === "display") {
      setDisplay((prev) => ({ ...prev, [id]: value }));
    } else if (section === "accessibility") {
      setAccessibility((prev) => ({ ...prev, [id]: value as boolean }));
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-4 px-5 pt-5 lg:flex-row lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeAppearanceData.sections.theme.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeAppearanceData.sections.theme.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col items-start justify-between gap-5">
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeAppearanceData.theme.colorThemeLabel}
              </div>
              <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                {fakeAppearanceData.theme.colorThemeDescription}
              </div>
            </div>
            <div className="flex">
              <Radio.Group
                value={theme || "system"}
                onValueChange={(value) =>
                  handleSettingChange("theme", "", value)
                }
                className="flex gap-6"
              >
                {fakeAppearanceData.theme.options.map((option) => (
                  <div
                    key={option.id}
                    className="group/radio flex items-center gap-1.5"
                  >
                    <Radio.Item
                      value={option.value}
                      id={option.id}
                      className="data-[state=checked]:"
                    />
                    <Label.Root
                      htmlFor={option.id}
                      className="text-text-sub-600 group-has-[[data-state=checked]]/radio:text-text-sub-600 cursor-pointer text-sm font-medium"
                    >
                      {option.label}
                    </Label.Root>
                  </div>
                ))}
              </Radio.Group>
            </div>
          </div>
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-5 border-t px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeAppearanceData.sections.display.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeAppearanceData.sections.display.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 lg:gap-4">
          {fakeAppearanceData.display.map((setting) => (
            <div
              key={setting.id}
              className={`flex ${setting.type === "select" ? "flex-col items-start gap-4 lg:flex-row lg:items-center" : "items-center"} justify-between gap-2`}
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
                  checked={display[setting.id] as boolean}
                  onCheckedChange={(checked) => {
                    handleSettingChange("display", setting.id, checked);
                  }}
                  className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
                />
              )}

              {setting.type === "select" && setting.options && (
                <Select.Root
                  size="xsmall"
                  value={display[setting.id] as string}
                  onValueChange={(value) => {
                    handleSettingChange("display", setting.id, value);
                  }}
                >
                  <Select.Trigger className="text-text-sub-600 w-full text-sm lg:w-auto">
                    <Select.Value placeholder={display[setting.id] as string} />
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
            </div>
          ))}
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-5 border-t px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeAppearanceData.sections.accessibility.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeAppearanceData.sections.accessibility.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          {fakeAppearanceData.accessibility.map((setting) => (
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
                checked={accessibility[setting.id]}
                onCheckedChange={(checked) => {
                  handleSettingChange("accessibility", setting.id, checked);
                }}
                className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
