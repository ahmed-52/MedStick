import * as Button from "@/components/ui/button";
import { useRef, useEffect, useState } from "react";

interface OverviewUser {
  initials: string;
  name: string;
  email: string;
  memberSince: string;
  memberSinceLabel: string;
}

interface OverviewItem {
  id: string;
  label: string;
  value: string;
}

interface OverviewSectionData {
  user: OverviewUser;
  items: OverviewItem[];
  manageButtonText: string;
}

interface ActivityItem {
  id: string;
  label: string;
  value: number;
  unit?: string;
}

interface ActivitySectionData {
  items: ActivityItem[];
}

interface PlanUsageItem {
  label: string;
  value: number;
  colorClass: string;
}

interface PlanUsageSectionData {
  items: PlanUsageItem[];
}

interface Section {
  title: string;
  description: string;
}

interface WorkspacePageData {
  overview: OverviewSectionData;
  activity: ActivitySectionData;
  planUsage: PlanUsageSectionData;
  sections: {
    overview: Section;
    activity: Section;
    planUsage: Section;
  };
}

const fakeWorkspaceData: WorkspacePageData = {
  overview: {
    user: {
      initials: "JB",
      name: "James Brown",
      email: "(james@gmail.com)",
      memberSince: "May 16, 2025",
      memberSinceLabel: "Member since",
    },
    items: [
      {
        id: "workspace",
        label: "Workspace",
        value: "Spectrum™",
      },
      {
        id: "yourRole",
        label: "Your role",
        value: "Admin",
      },
      {
        id: "teamMembers",
        label: "Team members",
        value: "3/10 seats",
      },
      {
        id: "planRenewal",
        label: "Plan renewal",
        value: "June 20, 2025",
      },
    ],
    manageButtonText: "Manage",
  },
  activity: {
    items: [
      {
        id: "conversations",
        label: "Conversations",
        value: 2847,
      },
      {
        id: "activeProjects",
        label: "Active projects",
        value: 59,
      },
      {
        id: "filesUploaded",
        label: "Files uploaded",
        value: 156,
      },
      {
        id: "storageUsed",
        label: "Storage used",
        value: 24,
        unit: "%",
      },
    ],
  },
  planUsage: {
    items: [
      { label: "Team seats", value: 60, colorClass: "bg-purple-500" },
      { label: "Storage", value: 8, colorClass: "bg-teal-500" },
      { label: "API", value: 25, colorClass: "bg-orange-500" },
    ],
  },
  sections: {
    overview: {
      title: "Overview",
      description: "Workspace summary and details.",
    },
    activity: {
      title: "Activity",
      description: "Usage analytics and metrics.",
    },
    planUsage: {
      title: "Plan usage",
      description: "Usage limits and current consumption.",
    },
  },
};

export default function Workspace() {
  const [containerWidth, setContainerWidth] = useState(200);

  const progressContainerRef = (node: HTMLDivElement | null) => {
    if (node) {
      setContainerWidth(node.offsetWidth);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const containers = document.querySelectorAll(".progressContainer");
      if (containers.length > 0) {
        const firstContainer = containers[0] as HTMLDivElement;
        setContainerWidth(firstContainer.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-5 pt-5 lg:flex-row lg:gap-4 lg:pt-7">
        <div className="flex flex-col gap-1 px-5 lg:max-w-50 lg:min-w-50 lg:px-0 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeWorkspaceData.sections.overview.title}
          </h3>
          <p className="text-text-soft-400 lg:tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeWorkspaceData.sections.overview.description}
          </p>
        </div>

        <div className="flex w-full flex-col">
          <div className="flex flex-col items-start justify-between px-5 lg:flex-row lg:items-center lg:px-0">
            <div className="mb-3 flex items-center gap-3 lg:mb-0">
              <div className="text-stroke-strong-950 tracking-spacing-tiny-4 flex size-10 items-center justify-center rounded-full bg-neutral-200 text-base font-medium lg:size-8 lg:text-sm xl:size-10 xl:text-base">
                {fakeWorkspaceData.overview.user.initials}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                    {fakeWorkspaceData.overview.user.name}
                  </div>
                  <div className="text-text-soft-400 tracking-spacing-tiny-2 text-sm font-medium">
                    {fakeWorkspaceData.overview.user.email}
                  </div>
                </div>
                <div className="text-text-disabled-300 text-xs font-medium">
                  {fakeWorkspaceData.overview.user.memberSinceLabel}{" "}
                  <span className="text-text-sub-600">
                    {fakeWorkspaceData.overview.user.memberSince}
                  </span>
                </div>
              </div>
            </div>
            <Button.Root
              size="xsmall"
              variant="neutral"
              mode="stroke"
              className="text-text-sub-600 !rounded-10 ml-13 w-[calc(100%-52px)] cursor-pointer px-3 text-sm font-medium lg:ml-0 lg:w-fit"
            >
              {fakeWorkspaceData.overview.manageButtonText}
            </Button.Root>
          </div>
          <div className="border-stroke-soft-200 mt-5 flex flex-col gap-3.5 border-t px-5 pt-5 lg:px-0">
            {fakeWorkspaceData.overview.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-text-soft-400 tracking-spacing-tiny-2 w-3/5 text-sm font-medium lg:w-2/5">
                  {item.label}
                </span>
                <span className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-5 border-t px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeWorkspaceData.sections.activity.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeWorkspaceData.sections.activity.description}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-4">
          {fakeWorkspaceData.activity.items.map((item, index) => (
            <div
              key={item.id}
              className={`flex flex-col ${index === 0 || index === 2 ? "max-w-3/5 min-w-3/5 lg:max-w-2/5 lg:min-w-2/5" : ""}`}
            >
              <span className="text-text-soft-400 tracking-spacing-tiny-2 text-sm font-medium">
                {item.label}
              </span>
              <span className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {item.unit === "%"
                  ? item.value + item.unit
                  : item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-5 border-t px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeWorkspaceData.sections.planUsage.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeWorkspaceData.sections.planUsage.description}
          </p>
        </div>

        <div className="planUseWrapper flex w-full flex-col gap-3.5 overflow-hidden">
          {fakeWorkspaceData.planUsage.items.map((item) => {
            const segmentWidth = 4;
            const gapWidth = 3;

            const totalSegments = Math.max(
              1,
              Math.floor(
                (containerWidth + gapWidth) / (segmentWidth + gapWidth),
              ),
            );

            const filledSegments = Math.round(
              (item.value / 100) * totalSegments,
            );

            return (
              <div
                key={item.label}
                className="flex items-center gap-2 lg:gap-4"
              >
                <span className="text-text-soft-400 tracking-spacing-tiny-2 flex w-2/5 flex-shrink-0 text-sm font-medium lg:max-w-2/5 lg:min-w-2/5">
                  {item.label}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-2 lg:gap-4">
                  <div
                    ref={progressContainerRef}
                    className="progressContainer flex min-w-0 flex-1 gap-0.75"
                  >
                    {Array.from({ length: totalSegments }, (_, index) => (
                      <div
                        key={index}
                        className={`h-3 w-1 flex-shrink-0 rounded-[0.8px] ${
                          index < filledSegments
                            ? item.colorClass
                            : "bg-bg-weak-50"
                        }`}
                      ></div>
                    ))}
                  </div>
                  <span className="text-text-soft-400 w-8 flex-shrink-0 text-right text-xs font-medium lg:min-w-10">
                    {item.value}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
