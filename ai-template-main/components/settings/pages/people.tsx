import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";
import {
  RiSearchLine,
  RiMore2Line,
  RiMoreLine,
  RiCloseLine,
} from "@remixicon/react";

import * as Avatar from "@/components/ui/avatar";
import * as Select from "@/components/ui/select";
import { cn } from "@/utils/cn";
import { useState } from "react";

type Users = {
  image: string;
  color: React.ComponentPropsWithoutRef<typeof Avatar.Root>["color"];
  value: string;
  label: React.ReactNode;
}[];

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "Admin" | "Member";
  avatarColor: string;
  color: string;
}

interface TeamOverviewItem {
  id: string;
  label: string;
  value: string;
}

interface TeamOverview {
  teamName: string;
  teamCreatedDate: string;
  manageButtonText: string;
  teamCreatedLabel: string;
  items: TeamOverviewItem[];
}

interface Section {
  title: string;
  description: string;
}

interface SearchAndFilter {
  searchPlaceholder: string;
  selectPlaceholder: string;
}

interface PeoplePageData {
  teamOverview: TeamOverview;
  members: TeamMember[];
  sections: {
    teamOverview: Section;
    members: Section;
  };
  searchAndFilter: SearchAndFilter;
}

const Logo = ({ className }: { className?: string }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M17.92 0.00800058C30.784 0.147208 32 1.9985 32 15.9992L31.9904 17.9193C31.8512 30.7839 30 32 16 32L14.08 31.9904C1.8272 31.8576 0.1424 30.1727 0.00960007 17.9177L0 15.5048L0.00960007 14.0807C0.1456 1.52007 1.9136 0.0640032 15.0208 0L17.9184 0.00800058H17.92ZM10 7.9988H9.0672C8.8115 7.99865 8.56425 8.09032 8.37044 8.25712C8.17663 8.42392 8.04915 8.65477 8.0112 8.90765L8 9.06605V14.9319C8 15.468 8.3952 15.9112 8.9088 15.988L9.0672 15.9992H10C11.536 15.9991 13.0136 16.588 14.1283 17.6448C15.243 18.7015 15.9101 20.1456 15.992 21.6795L16 21.9995V22.9323C16 23.4684 16.3952 23.9116 16.9088 23.9884L17.0672 23.9996H22.9328C23.1885 23.9998 23.4358 23.9081 23.6296 23.7413C23.8234 23.5745 23.9508 23.3436 23.9888 23.0908L24 22.9323V21.9995C23.9999 18.3578 22.581 14.8595 20.0443 12.2468C17.5076 9.63404 14.0527 8.11258 10.4128 8.0052L10 7.9988Z"
      fill="currentColor"
    />
  </svg>
);

const users: Users = [
  {
    image: "/images/logo.svg",
    color: "yellow",
    value: "sophia-williams",
    label: (
      <div className="flex items-center gap-1 text-xs">
        Sophia Williams
        <span className="text-text-soft-400 text-xs group-has-[&]/trigger:hidden">
          @sophia
        </span>
      </div>
    ),
  },
  {
    image: "/images/logo.svg",
    color: "blue",
    value: "arthur-taylor",
    label: (
      <div className="flex items-center gap-1 text-xs">
        Arthur Taylor
        <span className="text-text-soft-400 text-xs group-has-[&]/trigger:hidden">
          @arthur
        </span>
      </div>
    ),
  },
  {
    image: "/images/logo.svg",
    color: "gray",
    value: "james-brown",
    label: (
      <div className="flex items-center gap-1 text-xs">
        James Brown
        <span className="text-text-soft-400 text-xs group-has-[&]/trigger:hidden">
          @james
        </span>
      </div>
    ),
  },
  {
    image: "/images/logo.svg",
    color: "sky",
    value: "emma-wright",
    label: (
      <div className="flex items-center gap-1 text-xs">
        Emma Wright
        <span className="text-text-soft-400 text-xs group-has-[&]/trigger:hidden">
          @emma
        </span>
      </div>
    ),
  },
  {
    image: "/images/logo.svg",
    color: "purple",
    value: "matthew-johnson",
    label: (
      <div className="flex items-center gap-1 text-xs">
        Matthew Johnson
        <span className="text-text-soft-400 text-xs group-has-[&]/trigger:hidden">
          @matthew
        </span>
      </div>
    ),
  },
  {
    image: "/images/logo.svg",
    color: "red",
    value: "laura-perez",
    label: (
      <div className="flex items-center gap-1 text-xs">
        Laura Perez
        <span className="text-text-soft-400 text-xs group-has-[&]/trigger:hidden">
          @laura
        </span>
      </div>
    ),
  },
];

const fakePeopleData: PeoplePageData = {
  teamOverview: {
    teamName: "Spectrum™",
    teamCreatedDate: "May 18, 2025",
    manageButtonText: "Manage",
    teamCreatedLabel: "Team created date",
    items: [
      {
        id: "usedSeats",
        label: "Used seats",
        value: "3/10 seats",
      },
      {
        id: "admins",
        label: "Admins",
        value: "2 members",
      },
      {
        id: "pendingInvites",
        label: "Pending invites",
        value: "1 invite",
      },
      {
        id: "activeToday",
        label: "Active today",
        value: "3 members",
      },
    ],
  },
  members: [
    {
      id: "1",
      name: "Sophia Williams",
      email: "sophia@gmail.com",
      initials: "S",
      role: "Admin",
      avatarColor: "bg-yellow-200",
      color: "text-yellow-950",
    },
    {
      id: "2",
      name: "James Brown",
      email: "james@gmail.com",
      initials: "J",
      role: "Admin",
      avatarColor: "bg-gray-200",
      color: "text-static-black",
    },
    {
      id: "3",
      name: "Arthur Taylor",
      email: "arthur@gmail.com",
      initials: "A",
      role: "Member",
      avatarColor: "bg-blue-200",
      color: "text-blue-950",
    },
    {
      id: "4",
      name: "Emma Wright",
      email: "sophia@gmail.com",
      initials: "E",
      role: "Member",
      avatarColor: "bg-sky-200",
      color: "text-sky-950",
    },
  ],
  sections: {
    teamOverview: {
      title: "Team overview",
      description: "Workspace statistics & details.",
    },
    members: {
      title: "Members",
      description: "User roles and permissions.",
    },
  },
  searchAndFilter: {
    searchPlaceholder: "Search team members...",
    selectPlaceholder: "All roles",
  },
};

export default function People() {
  const [searchValue, setSearchValue] = useState("");

  const handleClearSearch = () => {
    setSearchValue("");
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-5 pt-5 lg:flex-row lg:gap-4 lg:pt-7">
        <div className="flex flex-col gap-1 px-5 lg:max-w-50 lg:min-w-50 lg:px-0 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakePeopleData.sections.teamOverview.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakePeopleData.sections.teamOverview.description}
          </p>
        </div>

        <div className="flex w-full flex-col">
          <div className="flex flex-col justify-between px-5 lg:flex-row lg:items-center lg:px-0">
            <div className="mb-3 flex items-center gap-3 lg:mb-0">
              <div className="bg-bg-white-0 border-stroke-soft-200 flex size-10 items-center justify-center rounded-full border font-medium lg:size-8 xl:size-10">
                <Logo className="size-5 text-green-600" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                  {fakePeopleData.teamOverview.teamName}
                </div>
                <div className="text-text-soft-400 text-xs font-medium">
                  {fakePeopleData.teamOverview.teamCreatedLabel}{" "}
                  <span className="text-text-sub-600">
                    {fakePeopleData.teamOverview.teamCreatedDate}
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
              {fakePeopleData.teamOverview.manageButtonText}
            </Button.Root>
          </div>
          <div className="border-stroke-soft-200 mt-5 flex flex-col gap-3.5 border-t px-5 pt-5 lg:px-0">
            {fakePeopleData.teamOverview.items.map((item) => (
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

      <div className="border-stroke-soft-200 flex flex-col gap-4 border-t px-5 pt-5 lg:flex-row lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakePeopleData.sections.members.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakePeopleData.sections.members.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 lg:gap-4">
          <div className="flex items-center gap-3">
            <Input.Root
              size="xsmall"
              className="hover:bg-bg-weak-50 shadow-custom-input"
            >
              <Input.Wrapper className="px-2.5">
                <Input.Icon as={RiSearchLine} className="text-text-soft-400" />
                <Input.Input
                  type="text"
                  placeholder={fakePeopleData.searchAndFilter.searchPlaceholder}
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
            <Select.Root size="xsmall">
              <Select.Trigger className="text-text-sub-600 w-auto text-sm">
                <Select.Value
                  placeholder={fakePeopleData.searchAndFilter.selectPlaceholder}
                />
              </Select.Trigger>
              <Select.Content className="z-62">
                {users.map((item) => (
                  <Select.Item key={item.value} value={item.value}>
                    <Select.ItemIcon
                      as={Avatar.Root}
                      size="20"
                      color={item.color}
                    >
                      <Avatar.Image src={item.image} />
                    </Select.ItemIcon>
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>

          <div className="border-stroke-soft-200 flex flex-col gap-5 border-t pt-5">
            {fakePeopleData.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-2.5 overflow-x-auto lg:overflow-x-hidden"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="lg:min-w-unset flex min-w-[60%] items-center gap-2 lg:w-[37%]">
                  <div
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full text-xs font-medium",
                      member.avatarColor,
                      member.color,
                    )}
                  >
                    {member.initials}
                  </div>
                  <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                    {member.name}
                  </div>
                </div>
                <div className="text-text-soft-400 lg:min-w-unset min-w-[50%] text-sm font-medium lg:w-[33%]">
                  {member.email}
                </div>
                <div className="lg:min-w-unset min-w-[20%] lg:w-[19%]">
                  <span
                    className={cn(
                      "w-fit rounded-md px-1.5 py-0.5 text-xs font-medium",
                      member.role === "Admin"
                        ? "bg-green-alpha-10 text-green-600"
                        : "bg-faded-lighter text-faded-base",
                    )}
                  >
                    {member.role}
                  </span>
                </div>
                <Button.Root
                  size="xsmall"
                  variant="neutral"
                  mode="ghost"
                  className="hover:bg-bg-weak-50 size-5 cursor-pointer rounded-sm p-0 transition-colors"
                >
                  <RiMore2Line className="text-text-soft-400 size-5" />
                </Button.Root>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
