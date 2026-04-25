"use client";

import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";
import * as Select from "@/components/ui/select";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  RiFolder2Fill,
  RiFolder2Line,
  RiSearchLine,
  RiAddLine,
  RiCloseLine,
  RiMore2Line,
  RiPushpinLine,
  RiPencilLine,
  RiDeleteBinLine,
  RiMenu3Line,
} from "@remixicon/react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/utils/cn";
import CreateProjectModal from "@/components/modals/create-project-modal";
import { useSidebar } from "@/contexts/sidebar-context";

interface Project {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
}

interface ProjectsPageData {
  header: {
    icon: string;
    title: string;
    description: string;
    createButtonText: string;
  };
  search: {
    placeholder: string;
  };
  filters: {
    sortLabel: string;
    sortOptions: string[];
    defaultSort: string;
  };
  projects: Project[];
}

const fakeProjectsData: ProjectsPageData = {
  header: {
    icon: "RiFolder2Fill",
    title: "Projects",
    description:
      "Easily manage and explore all your active projects in one place",
    createButtonText: "Create project",
  },
  search: {
    placeholder: "Search projects...",
  },
  filters: {
    sortLabel: "Sort by",
    sortOptions: ["Recent activity", "Oldest activity", "A-Z", "Z-A"],
    defaultSort: "Recent activity",
  },
  projects: [
    {
      id: "research-analysis",
      title: "Research & Analysis",
      description: "User research insights & data analysis",
      updatedAt: "Updated 12 days ago",
    },
    {
      id: "web-search",
      title: "Web Search",
      description: "Search functionality and SEO optimization",
      updatedAt: "Updated 12 days ago",
    },
    {
      id: "api-documentation",
      title: "API Documentation",
      description: "Rest API documentation and examples",
      updatedAt: "Updated 12 days ago",
    },
    {
      id: "feature-overview",
      title: "Feature Overview",
      description: "Product feature planning and specifications",
      updatedAt: "Updated 12 days ago",
    },
    {
      id: "knowledge-base",
      title: "Knowledge Base",
      description: "Key tips for effective project management",
      updatedAt: "Updated 12 days ago",
    },
    {
      id: "user-guide",
      title: "User Guide",
      description: "User onboarding and guide creation",
      updatedAt: "Updated 12 days ago",
    },
  ],
};

export default function ProjectsPage() {
  const { onMenuClick } = useSidebar();
  const [searchValue, setSearchValue] = useState("");
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClearSearch = () => {
    setSearchValue("");
  };

  const handleCreateProject = (projectName: string) => {
    setIsCreateModalOpen(false);
  };

  const filteredProjects = fakeProjectsData.projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchValue.toLowerCase()) ||
      project.description.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col lg:p-1.5 lg:pl-0">
      <div className="border-stroke-soft-200 flex items-center justify-between border-b px-5 py-4 pl-4 lg:hidden">
        <Button.Root
          variant="neutral"
          mode="ghost"
          onClick={onMenuClick}
          className="size-8 cursor-pointer rounded-lg p-0"
        >
          <Button.Icon as={RiMenu3Line} className="text-text-soft-400 size-5" />
        </Button.Root>
        <Button.Root
          variant="neutral"
          mode="filled"
          size="xsmall"
          className="bg-bg-surface-800 hover:bg-stroke-strong-950 !rounded-10 flex cursor-pointer gap-1.5 pr-3 pl-2 text-sm"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Button.Icon as={RiAddLine} className="flex size-5 flex-shrink-0" />
          {fakeProjectsData.header.createButtonText}
        </Button.Root>
      </div>
      <div
        className="bg-bg-white-0 lg:border-stroke-soft-200 flex h-full flex-col overflow-auto px-5 py-7 lg:rounded-3xl lg:border lg:p-18"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="mx-auto w-full lg:max-w-175 lg:min-w-175">
          <div className="mb-7 flex flex-col items-center gap-5 lg:mb-5 lg:items-start">
            <div className="border-faded-lighter flex size-12 items-center justify-center rounded-full border">
              <RiFolder2Fill className="size-7 text-green-600/56" />
            </div>
            <div className="flex w-full items-center justify-center lg:justify-between">
              <div className="flex flex-col items-center gap-1.5 lg:items-start">
                <h1 className="text-text-strong-950 tracking-spacing-tiny-1 text-lg/snug font-medium">
                  {fakeProjectsData.header.title}
                </h1>
                <p className="text-text-soft-400 tracking-spacing-tiny-2 text-center text-sm font-medium lg:text-left">
                  {fakeProjectsData.header.description}
                </p>
              </div>
              <Button.Root
                variant="neutral"
                mode="filled"
                size="xsmall"
                className="bg-bg-surface-800 hover:bg-stroke-strong-950 !rounded-10 hidden cursor-pointer gap-1.5 pr-3 pl-2 text-sm lg:flex"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Button.Icon
                  as={RiAddLine}
                  className="flex size-5 flex-shrink-0"
                />
                {fakeProjectsData.header.createButtonText}
              </Button.Root>
            </div>
          </div>

          <div className="mb-6 lg:mb-7">
            <Input.Root
              size="medium"
              className="hover:bg-bg-weak-50 shadow-custom-input"
            >
              <Input.Wrapper className="px-2.5">
                <Input.Icon as={RiSearchLine} className="text-text-soft-400" />
                <Input.Input
                  type="text"
                  placeholder={fakeProjectsData.search.placeholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="placeholder:text-text-soft-400 group-hover:hover:placeholder:text-text-sub-600"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="text-text-soft-400 hover:text-text-sub-600 flex items-center justify-center transition-colors duration-200"
                  >
                    <RiCloseLine className="size-4" />
                  </button>
                )}
              </Input.Wrapper>
            </Input.Root>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="text-text-soft-400 tracking-spacing-tiny-2 text-sm font-medium">
              {searchValue
                ? `Search results (${filteredProjects.length})`
                : `All projects (${fakeProjectsData.projects.length})`}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-text-soft-400 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeProjectsData.filters.sortLabel}
              </span>
              <Select.Root size="xsmall">
                <Select.Trigger className="text-text-sub-600 h-5 min-h-0 w-auto cursor-pointer p-0 text-sm !shadow-none hover:bg-transparent">
                  <Select.Value
                    placeholder={fakeProjectsData.filters.defaultSort}
                  />
                </Select.Trigger>
                <Select.Content>
                  {fakeProjectsData.filters.sortOptions.map((item) => (
                    <Select.Item key={item} value={item}>
                      {item}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  "bg-bg-white-0 shadow-custom-input group rounded-20 hover:bg-bg-weak-50 relative flex flex-col transition-all duration-200 hover:shadow-none",
                  openPopoverId === project.id && "bg-bg-weak-50 shadow-none",
                )}
              >
                <Popover.Root
                  open={openPopoverId === project.id}
                  onOpenChange={(open) =>
                    setOpenPopoverId(open ? project.id : null)
                  }
                >
                  <Popover.Trigger asChild>
                    <Button.Root
                      variant="neutral"
                      mode="ghost"
                      className={cn(
                        "group absolute top-5 right-5 size-7 cursor-pointer rounded-md p-0 transition-all duration-200 group-hover:opacity-100 data-[state=open]:opacity-100 lg:opacity-0",
                        openPopoverId === project.id &&
                          "bg-transparent shadow-none",
                      )}
                    >
                      <Button.Icon
                        as={RiMore2Line}
                        className={cn(
                          "text-text-soft-400 hover:text-text-sub-600 group-hover:text-text-sub-600 size-5 transition-transform duration-400",
                          openPopoverId === project.id && "text-text-sub-600",
                        )}
                      />
                    </Button.Root>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      className="bg-bg-white-0 shadow-complex z-50 min-w-30 rounded-xl p-1"
                      side={isMobile ? "left" : "bottom"}
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
                <Link
                  href={`/projects/${project.id}`}
                  className="flex flex-col gap-5 p-5 lg:gap-6 lg:p-6"
                >
                  <div className="flex items-center">
                    <RiFolder2Line
                      className={cn(
                        "text-text-soft-400 size-6 transition-all duration-200 group-hover:hidden",
                        openPopoverId === project.id && "hidden",
                      )}
                    />
                    <RiFolder2Fill
                      className={cn(
                        "hidden size-6 text-green-600 transition-all duration-200 group-hover:block",
                        openPopoverId === project.id && "block",
                      )}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-text-strong-950 tracking-spacing-tiny-4: text-sm font-medium lg:text-base">
                      {project.title}
                    </h3>
                    <p className="text-text-soft-400 tracking-spacing-tiny-2 text-sm font-medium">
                      {project.description}
                    </p>
                  </div>
                  <div className="text-text-soft-400 text-xs font-medium">
                    {project.updatedAt}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}
