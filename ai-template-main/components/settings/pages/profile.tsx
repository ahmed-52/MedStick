import * as Button from "@/components/ui/button";
import {
  RiUser6Fill,
  RiMailFill,
  RiTimeFill,
  RiGlobalFill,
} from "@remixicon/react";

interface ProfilePicture {
  initials: string;
  hasImage: boolean;
  imageUrl?: string;
  uploadText: string;
  uploadInstructions: string;
  buttonText: string;
}

interface PersonalInfoItem {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface PersonalInfo {
  fullName: string;
  memberSince: string;
  memberSinceLabel: string;
  items: PersonalInfoItem[];
  editButtonText: string;
}

interface Section {
  title: string;
  description: string;
}

interface ProfilePageData {
  profilePicture: ProfilePicture;
  personalInfo: PersonalInfo;
  sections: {
    profilePicture: Section;
    personalInfo: Section;
  };
}

const fakeProfileData: ProfilePageData = {
  profilePicture: {
    initials: "JB",
    hasImage: false,
    imageUrl: undefined,
    uploadText: "Upload image",
    uploadInstructions: "Min 400x400px, PNG or JPEG formats.",
    buttonText: "Upload",
  },
  personalInfo: {
    fullName: "James Brown",
    memberSince: "May 16, 2025",
    memberSinceLabel: "Member since",
    editButtonText: "Edit profile",
    items: [
      {
        id: "fullName",
        label: "Full name",
        value: "James Brown",
        icon: RiUser6Fill,
      },
      {
        id: "email",
        label: "Email address",
        value: "james@alignui.com",
        icon: RiMailFill,
      },
      {
        id: "timeZone",
        label: "Time zone",
        value: "UTC-05:00 (Eastern Time)",
        icon: RiTimeFill,
      },
      {
        id: "language",
        label: "Language",
        value: "English",
        icon: RiGlobalFill,
      },
    ],
  },
  sections: {
    profilePicture: {
      title: "Profile picture",
      description: "Update your avatar image.",
    },
    personalInfo: {
      title: "Personal information",
      description: "Edit your account details.",
    },
  },
};

export default function Profile() {
  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-5 px-5 pt-5 lg:flex-row lg:gap-4 lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeProfileData.sections.profilePicture.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeProfileData.sections.profilePicture.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-row gap-4 lg:flex-col">
            <div className="text-text-static-black tracking-spacing-tiny-4 flex size-10 items-center justify-center rounded-full bg-neutral-200 text-base font-medium lg:size-8 xl:size-10">
              {fakeProfileData.profilePicture.initials}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeProfileData.profilePicture.uploadText}
              </div>
              <div className="text-text-soft-400 text-xs font-medium">
                {fakeProfileData.profilePicture.uploadInstructions}
              </div>
            </div>
          </div>
          <Button.Root
            size="xsmall"
            variant="neutral"
            mode="stroke"
            className="text-text-sub-600 ml-13 w-[calc(100%-52px)] cursor-pointer px-3 text-sm font-medium lg:ml-0 lg:w-fit"
          >
            {fakeProfileData.profilePicture.buttonText}
          </Button.Root>
        </div>
      </div>

      <div className="border-stroke-soft-200 flex flex-col gap-4 border-t px-5 pt-5 lg:flex-row lg:px-0 lg:pt-7">
        <div className="flex flex-col gap-1 lg:max-w-50 lg:min-w-50 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeProfileData.sections.personalInfo.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeProfileData.sections.personalInfo.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5">
          <div className="border-stroke-soft-200 flex items-center justify-between border-t pt-5 lg:border-t-0 lg:pt-0">
            <div className="flex flex-col gap-1">
              <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                {fakeProfileData.personalInfo.fullName}
              </div>
              <div className="text-text-soft-400 text-xs font-medium">
                {fakeProfileData.personalInfo.memberSinceLabel}{" "}
                <span className="text-text-strong-950">
                  {fakeProfileData.personalInfo.memberSince}
                </span>
              </div>
            </div>
            <Button.Root
              size="xsmall"
              variant="neutral"
              mode="stroke"
              className="text-text-sub-600 !rounded-10 w-fit cursor-pointer px-3 text-sm font-medium"
            >
              {fakeProfileData.personalInfo.editButtonText}
            </Button.Root>
          </div>

          <div className="border-stroke-soft-200 flex flex-col gap-5 border-t pt-5">
            {fakeProfileData.personalInfo.items.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex w-2/5 items-center gap-2">
                    <IconComponent className="text-text-disabled-300 size-5" />
                    <span className="text-text-soft-400 tracking-spacing-tiny-2 text-sm font-medium">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-text-sub-600 tracking-spacing-tiny-2 text-sm font-medium">
                    {item.id === "timeZone" ? (
                      <>
                        {item.value.split(" (")[0]}{" "}
                        <span className="text-text-soft-400">
                          ({item.value.split(" (")[1]}
                        </span>
                      </>
                    ) : (
                      item.value
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
