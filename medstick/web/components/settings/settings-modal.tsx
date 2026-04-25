import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import SettingsSidebar from "@/components/settings/settings-sidebar";
import SettingsHeader from "@/components/layout/settings-header";
import Workspace from "@/components/settings/pages/workspace";
import People from "@/components/settings/pages/people";
import Billing from "@/components/settings/pages/billing";
import Profile from "@/components/settings/pages/profile";
import Preferences from "@/components/settings/pages/preferences";
import Appearance from "@/components/settings/pages/appearance";
import Security from "@/components/settings/pages/security";
import Privacy from "@/components/settings/pages/privacy";
import AiSettings from "@/components/settings/pages/ai-settings";
import Integrations from "@/components/settings/pages/integrations";
import Advanced from "@/components/settings/pages/advanced";

const pageConfig = {
  "workspace-main": {
    component: Workspace,
    title: "Workspace overview",
    description: "Manage your workspace ownership and settings.",
  },
  people: {
    component: People,
    title: "Team members",
    description: "Manage workspace members, roles and permissions.",
  },
  "plans-billing": {
    component: Billing,
    title: "Plans & Billing",
    description: "Manage subscription and billing settings.",
  },
  "profile-account": {
    component: Profile,
    title: "Profile",
    description: "Manage your personal account settings.",
  },
  preferences: {
    component: Preferences,
    title: "Preferences",
    description: "Customize your workspace experience.",
  },
  appearance: {
    component: Appearance,
    title: "Appearance",
    description: "Customize visual settings and interface.",
  },
  "security-settings": {
    component: Security,
    title: "Security",
    description: "Manage account security and access control.",
  },
  "privacy-data": {
    component: Privacy,
    title: "Privacy & Data",
    description: "Control your data privacy and usage preferences.",
  },
  "ai-settings": {
    component: AiSettings,
    title: "AI settings",
    description: "Customize AI behavior and response preferences.",
  },
  integrations: {
    component: Integrations,
    title: "Integrations",
    description: "Connect external apps and manage API access.",
  },
  advanced: {
    component: Advanced,
    title: "Advanced",
    description: "Developer tools and experimental features.",
  },
};

export default function SettingsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activePage, setActivePage] = useState("workspace-main");
  const [showMobileContent, setShowMobileContent] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPageAnimating, setIsPageAnimating] = useState(false);

  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    setShowMobileContent(isDesktop);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const currentPage = pageConfig[activePage as keyof typeof pageConfig];
  const PageComponent = currentPage?.component || Workspace;

  const handlePageChange = (pageId: string) => {
    setActivePage(pageId);
    if (window.innerWidth < 1024) {
      setIsPageAnimating(true);
      setTimeout(() => {
        setShowMobileContent(true);
      }, 10);
    } else {
      setShowMobileContent(true);
    }
  };

  const handleContentClose = () => {
    if (window.innerWidth < 1024) {
      setIsPageAnimating(false);
      setTimeout(() => {
        setShowMobileContent(false);
      }, 400);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setActivePage("workspace-main");
      const isDesktop = window.innerWidth >= 1024;
      setShowMobileContent(isDesktop);
      onClose();
    }, 400);
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-62 flex h-full w-full items-end justify-center transition-all duration-400 lg:items-center",
        isAnimating ? "bg-overlay-gray" : "bg-transparent",
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          "modal-wrapper lg:shadow-complex lg:bg-bg-white-0 flex w-full items-end overflow-hidden transition-transform duration-400 ease-out lg:h-180 lg:max-h-[80vh] lg:w-229.5 lg:items-center lg:gap-1.5 lg:rounded-[28px] lg:p-1.5 xl:h-180 xl:w-289.5",
          isAnimating
            ? "translate-y-0"
            : "translate-y-full lg:translate-y-0 lg:opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <SettingsSidebar
          activePage={activePage}
          onPageChange={handlePageChange}
          onClose={handleClose}
          isMobileContentShown={showMobileContent}
        />

        <div
          className={cn(
            "bg-overlay-gray lg:left-unset lg:top-unset absolute top-0 left-0 flex h-full w-full flex-1 items-end transition-all duration-400 lg:pointer-events-auto lg:relative lg:h-full lg:bg-transparent lg:opacity-100",
            showMobileContent ? "visible opacity-100" : "invisible opacity-0",
          )}
          onClick={handleContentClose}
        >
          <div
            className={cn(
              "shadow-custom-input bg-bg-white-0 flex h-[calc(100dvh-32px)] w-full shrink-0 flex-col rounded-t-3xl pt-5 transition-transform duration-400 ease-out lg:h-full lg:rounded-3xl lg:bg-transparent lg:pt-5.5 lg:pb-7",
              isPageAnimating
                ? "translate-y-0"
                : "translate-y-full lg:translate-y-0",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <SettingsHeader
              title={currentPage?.title || "Settings"}
              description={currentPage?.description || "Manage your settings"}
              onClose={handleContentClose}
            />
            <PageComponent />
          </div>
        </div>
      </div>
    </div>
  );
}
