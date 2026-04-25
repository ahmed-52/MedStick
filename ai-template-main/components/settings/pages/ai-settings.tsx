"use client";

import * as Label from "@/components/ui/label";
import * as Radio from "@/components/ui/radio";
import * as Switch from "@/components/ui/switch";
import * as Select from "@/components/ui/select";
import { useState } from "react";

interface RadioOption {
  id: string;
  value: string;
  label: string;
}

interface RadioGroup {
  id: string;
  label: string;
  description: string;
  options: RadioOption[];
  selected: string;
}

interface SwitchSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface SelectSetting {
  id: string;
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
}

interface Section {
  title: string;
  description: string;
}

interface AiSettingsPageData {
  sections: {
    responseBehavior: Section;
    contentPreferences: Section;
    modelSettings: Section;
  };
  responseBehavior: {
    responseLength: RadioGroup;
    creativityLevel: RadioGroup;
  };
  contentPreferences: {
    contentFiltering: SwitchSetting;
  };
  modelSettings: {
    aiModel: SelectSetting;
    autoSuggestions: SwitchSetting;
  };
}

const fakeAiSettingsData: AiSettingsPageData = {
  sections: {
    responseBehavior: {
      title: "Response behavior",
      description: "Customize AI response style and tone.",
    },
    contentPreferences: {
      title: "Content preferences",
      description: "Control AI content and filtering.",
    },
    modelSettings: {
      title: "Model settings",
      description: "AI model and performance options.",
    },
  },
  responseBehavior: {
    responseLength: {
      id: "response-length",
      label: "Response length",
      description: "Preferred length of AI responses",
      options: [
        { id: "short", value: "short", label: "Short" },
        { id: "balanced", value: "balanced", label: "Balanced" },
        { id: "detailed", value: "detailed", label: "Detailed" },
      ],
      selected: "short",
    },
    creativityLevel: {
      id: "creativity-level",
      label: "Creativity level",
      description: "How creative responses should be",
      options: [
        { id: "conservative", value: "conservative", label: "Conservative" },
        { id: "balanced", value: "balanced", label: "Balanced" },
        { id: "creative", value: "creative", label: "Creative" },
      ],
      selected: "balanced",
    },
  },
  contentPreferences: {
    contentFiltering: {
      id: "content-filtering",
      label: "Content filtering",
      description: "Filter inappropriate content",
      enabled: false,
    },
  },
  modelSettings: {
    aiModel: {
      id: "ai-model",
      label: "AI Model",
      description: "Choose your preferred AI model",
      value: "claude-v4",
      options: [
        { value: "claude-v4", label: "Claude V4" },
        { value: "gpt-4", label: "GPT-4" },
        { value: "gemini-pro", label: "Gemini Pro" },
      ],
    },
    autoSuggestions: {
      id: "auto-suggestions",
      label: "Auto-suggestions",
      description: "Show suggested follow-up questions",
      enabled: true,
    },
  },
};

export default function AiSettings() {
  const [settings, setSettings] = useState(() => ({
    responseLength: fakeAiSettingsData.responseBehavior.responseLength.selected,
    creativityLevel:
      fakeAiSettingsData.responseBehavior.creativityLevel.selected,
    contentFiltering:
      fakeAiSettingsData.contentPreferences.contentFiltering.enabled,
    aiModel: fakeAiSettingsData.modelSettings.aiModel.value,
    autoSuggestions: fakeAiSettingsData.modelSettings.autoSuggestions.enabled,
  }));

  const handleSettingChange = (
    key: keyof typeof settings,
    value: string | boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-5 px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeAiSettingsData.sections.responseBehavior.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeAiSettingsData.sections.responseBehavior.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 lg:gap-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeAiSettingsData.responseBehavior.responseLength.label}
              </div>
              <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                {fakeAiSettingsData.responseBehavior.responseLength.description}
              </div>
            </div>
            <div className="flex">
              <Radio.Group
                value={settings.responseLength}
                onValueChange={(value) =>
                  handleSettingChange("responseLength", value)
                }
                className="flex gap-6"
              >
                {fakeAiSettingsData.responseBehavior.responseLength.options.map(
                  (option) => (
                    <div
                      key={option.id}
                      className="group/radio flex items-center gap-1.5"
                    >
                      <Radio.Item value={option.value} id={option.id} />
                      <Label.Root
                        htmlFor={option.id}
                        className="text-text-sub-600 group-has-[[data-state=checked]]/radio:text-text-sub-600 cursor-pointer text-sm font-medium"
                      >
                        {option.label}
                      </Label.Root>
                    </div>
                  ),
                )}
              </Radio.Group>
            </div>
          </div>

          <div className="border-stroke-soft-200 flex flex-col gap-5 border-t pt-5">
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeAiSettingsData.responseBehavior.creativityLevel.label}
              </div>
              <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                {
                  fakeAiSettingsData.responseBehavior.creativityLevel
                    .description
                }
              </div>
            </div>
            <div className="flex">
              <Radio.Group
                value={settings.creativityLevel}
                onValueChange={(value) =>
                  handleSettingChange("creativityLevel", value)
                }
                className="flex gap-6"
              >
                {fakeAiSettingsData.responseBehavior.creativityLevel.options.map(
                  (option) => (
                    <div
                      key={option.id}
                      className="group/radio flex items-center gap-1.5"
                    >
                      <Radio.Item value={option.value} id={option.id} />
                      <Label.Root
                        htmlFor={option.id}
                        className="text-text-sub-600 group-has-[[data-state=checked]]/radio:text-text-sub-600 cursor-pointer text-sm font-medium"
                      >
                        {option.label}
                      </Label.Root>
                    </div>
                  ),
                )}
              </Radio.Group>
            </div>
          </div>
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-5 border-t px-5 pt-5 lg:flex-row lg:gap-4 lg:border-t-0 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeAiSettingsData.sections.contentPreferences.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeAiSettingsData.sections.contentPreferences.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 lg:gap-5">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeAiSettingsData.contentPreferences.contentFiltering.label}
              </div>
              <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                {
                  fakeAiSettingsData.contentPreferences.contentFiltering
                    .description
                }
              </div>
            </div>
            <Switch.Root
              checked={settings.contentFiltering}
              onCheckedChange={(checked) =>
                handleSettingChange("contentFiltering", checked)
              }
              className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-5 border-t px-5 pt-5 lg:flex-row lg:gap-4 lg:border-t-0 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeAiSettingsData.sections.modelSettings.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeAiSettingsData.sections.modelSettings.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 lg:gap-5">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeAiSettingsData.modelSettings.aiModel.label}
              </div>
              <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                {fakeAiSettingsData.modelSettings.aiModel.description}
              </div>
            </div>
            <Select.Root
              size="xsmall"
              value={settings.aiModel}
              onValueChange={(value) => handleSettingChange("aiModel", value)}
            >
              <Select.Trigger className="text-text-sub-600 w-full text-sm lg:w-auto">
                <Select.Value placeholder={settings.aiModel} />
              </Select.Trigger>
              <Select.Content className="z-62">
                {fakeAiSettingsData.modelSettings.aiModel.options.map(
                  (option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ),
                )}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="border-stroke-soft-200 flex items-center justify-between border-t pt-5">
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeAiSettingsData.modelSettings.autoSuggestions.label}
              </div>
              <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                {fakeAiSettingsData.modelSettings.autoSuggestions.description}
              </div>
            </div>
            <Switch.Root
              checked={settings.autoSuggestions}
              onCheckedChange={(checked) =>
                handleSettingChange("autoSuggestions", checked)
              }
              className="[&>div]:group-data-[state=checked]/switch:!bg-success-base [&>div]:group-hover:data-[state=checked]/switch:!bg-success-base cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
