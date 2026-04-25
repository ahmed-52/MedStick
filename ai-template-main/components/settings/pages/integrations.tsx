"use client";

import * as Button from "@/components/ui/button";
import { useState } from "react";
import { RiFileCopyLine } from "@remixicon/react";
import Image from "next/image";

interface ConnectedApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  isConnected: boolean;
}

interface ApiSetting {
  id: string;
  label: string;
  description: string;
  buttonText: string;
  value?: string;
  showCopy?: boolean;
}

interface Section {
  title: string;
  description: string;
}

interface IntegrationsPageData {
  sections: {
    connectedApps: Section;
    apiAccess: Section;
  };
  connectedApps: ConnectedApp[];
  apiAccess: ApiSetting[];
}

const fakeIntegrationsData: IntegrationsPageData = {
  sections: {
    connectedApps: {
      title: "Connected apps",
      description: "Manage third-party app connections.",
    },
    apiAccess: {
      title: "API Access",
      description: "Developer tools and API settings.",
    },
  },
  connectedApps: [
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Access and sync your files",
      icon: "google-drive",
      isConnected: true,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Send messages & notifications",
      icon: "slack",
      isConnected: true,
    },
    {
      id: "notion",
      name: "Notion",
      description: "Create and update pages",
      icon: "notion",
      isConnected: false,
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Create and update pages",
      icon: "dropbox",
      isConnected: false,
    },
    {
      id: "trello",
      name: "Trello",
      description: "Create and update pages",
      icon: "trello",
      isConnected: false,
    },
  ],
  apiAccess: [
    {
      id: "api-key",
      label: "API Key",
      description: "Your personal API key for external integrations",
      buttonText: "Generate key",
      value: "sk-ant-api03-********************-abc123",
      showCopy: true,
    },
    {
      id: "webhooks",
      label: "Webhooks",
      description: "Configure webhook endpoints for real-time updates",
      buttonText: "Manage",
    },
  ],
};

export default function Integrations() {
  const [appConnectionStates, setAppConnectionStates] = useState(() => {
    const initialStates: { [key: string]: boolean } = {};
    fakeIntegrationsData.connectedApps.forEach((app) => {
      initialStates[app.id] = app.isConnected;
    });
    return initialStates;
  });

  const handleAppConnection = (appId: string) => {
    setAppConnectionStates((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }));
  };

  const handleApiAction = (actionId: string) => {};

  const handleCopyApiKey = async () => {
    const apiKeySetting = fakeIntegrationsData.apiAccess.find(
      (setting) => setting.id === "api-key",
    );
    if (!apiKeySetting?.value) return;

    try {
      await navigator.clipboard.writeText(apiKeySetting.value);
    } catch (err) {}
  };

  const getAppIcon = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      "google-drive": "/icons/icon-google-drive.svg",
      slack: "/icons/icon-slack.svg",
      notion: "/icons/icon-notion.svg",
      dropbox: "/icons/icon-dropbox.svg",
      trello: "/icons/icon-trello.svg",
    };
    return iconMap[iconName] || "/icons/icon-info.svg";
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-5 px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeIntegrationsData.sections.connectedApps.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeIntegrationsData.sections.connectedApps.description}
          </p>
        </div>

        <div className="border-stroke-soft-200 flex w-full flex-col gap-5 border-t pt-4 lg:gap-4 lg:border-t-0 lg:pt-0">
          {fakeIntegrationsData.connectedApps.map((app) => {
            const isConnected = appConnectionStates[app.id];

            return (
              <div
                key={app.id}
                className="flex items-center justify-between gap-2.5"
              >
                <div className="flex gap-2.5 lg:items-center">
                  <Image
                    src={getAppIcon(app.icon)}
                    alt={app.name}
                    width={18}
                    height={18}
                    className="mt-0.75 size-4.5 lg:mt-0"
                  />
                  <div className="flex flex-col gap-2 lg:flex-row lg:gap-2.5">
                    <div className="text-text-sub-600 tracking-spacing-tiny-2 text-sm font-medium">
                      {app.name}
                    </div>
                    <div className="text-text-soft-400 text-xs font-medium lg:text-sm">
                      {app.description}
                    </div>
                  </div>
                </div>
                <Button.Root
                  size="xxsmall"
                  variant="neutral"
                  mode="lighter"
                  onClick={() => handleAppConnection(app.id)}
                  className={`!rounded-10 w-fit cursor-pointer px-2.5 text-sm font-medium ${
                    isConnected
                      ? "border border-transparent bg-green-600/10 text-green-600 shadow-none hover:border-green-600 hover:bg-transparent hover:text-green-600"
                      : "text-text-sub-600"
                  }`}
                >
                  {isConnected ? "Connected" : "Connect"}
                </Button.Root>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-4 border-t px-5 pt-5 lg:flex-row lg:border-t-0 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeIntegrationsData.sections.apiAccess.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeIntegrationsData.sections.apiAccess.description}
          </p>
        </div>

        <div className="border-stroke-soft-200 flex w-full flex-col gap-5 border-t pt-4 lg:border-t-0 lg:pt-0">
          {fakeIntegrationsData.apiAccess.map((setting) => (
            <div
              key={setting.id}
              className={`flex flex-col gap-5 lg:gap-3 ${setting.id === "webhooks" ? "border-stroke-soft-200 border-t pt-5 lg:border-t-0 lg:pt-0" : ""}`}
            >
              <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
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
                  onClick={() => handleApiAction(setting.id)}
                  className="text-text-sub-600 !rounded-10 w-full cursor-pointer px-3 text-sm font-medium lg:w-fit"
                >
                  {setting.buttonText}
                </Button.Root>
              </div>

              {setting.showCopy && setting.value && (
                <div className="bg-bg-weak-50 shadow-custom-input flex items-center gap-3 rounded-xl px-4 py-3 lg:p-3">
                  <div className="text-text-sub-600 max-w-[calc(100%-32px)] flex-1 overflow-hidden text-sm font-medium whitespace-nowrap">
                    {setting.value}
                  </div>
                  <button
                    onClick={handleCopyApiKey}
                    className="flex cursor-pointer items-center justify-center p-0 transition-colors"
                  >
                    <RiFileCopyLine className="text-text-soft-400 hover:text-text-sub-600 size-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
