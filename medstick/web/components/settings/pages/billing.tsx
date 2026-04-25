import * as Button from "@/components/ui/button";
import * as Input from "@/components/ui/input";
import {
  RiSearchLine,
  RiMore2Line,
  RiCloseLine,
  RiVipCrownLine,
  RiCheckLine,
} from "@remixicon/react";
import * as Select from "@/components/ui/select";
import { useState } from "react";

interface BillingInvoice {
  id: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
}

interface CurrentPlanItem {
  id: string;
  label: string;
  value: string;
}

interface CurrentPlan {
  planName: string;
  description: string;
  price: string;
  priceDetails: string;
  manageButtonText: string;
  items: CurrentPlanItem[];
}

interface Section {
  title: string;
  description: string;
}

interface SearchAndFilter {
  searchPlaceholder: string;
  selectPlaceholder: string;
  selectOptions: {
    all: string;
    paid: string;
    pending: string;
    failed: string;
  };
}

interface BillingPageData {
  currentPlan: CurrentPlan;
  invoices: BillingInvoice[];
  sections: {
    currentPlan: Section;
    billingHistory: Section;
  };
  searchAndFilter: SearchAndFilter;
}

const fakeBillingData: BillingPageData = {
  currentPlan: {
    planName: "Professional Plan",
    description: "Team plan for up to 10 members",
    price: "$49",
    priceDetails: "/ month",
    manageButtonText: "Manage",
    items: [
      {
        id: "usedSeats",
        label: "Used seats",
        value: "3/10 seats",
      },
      {
        id: "planRenewal",
        label: "Plan renewal",
        value: "June 20, 2025",
      },
      {
        id: "status",
        label: "Status",
        value: "Active",
      },
      {
        id: "activeToday",
        label: "Active today",
        value: "3 members",
      },
    ],
  },
  invoices: [
    {
      id: "1",
      date: "April 15, 2024",
      amount: "$49",
      status: "Paid",
    },
    {
      id: "2",
      date: "May 15, 2024",
      amount: "$49",
      status: "Paid",
    },
    {
      id: "3",
      date: "Jun 15, 2024",
      amount: "$49",
      status: "Paid",
    },
    {
      id: "4",
      date: "July 15, 2024",
      amount: "$49",
      status: "Paid",
    },
    {
      id: "5",
      date: "Aug 15, 2024",
      amount: "$49",
      status: "Paid",
    },
  ],
  sections: {
    currentPlan: {
      title: "Current plan",
      description: "Plan details and usage overview.",
    },
    billingHistory: {
      title: "Billing history",
      description: "Invoice history and payments.",
    },
  },
  searchAndFilter: {
    searchPlaceholder: "Search invoices...",
    selectPlaceholder: "All status",
    selectOptions: {
      all: "All status",
      paid: "Paid",
      pending: "Pending",
      failed: "Failed",
    },
  },
};

export default function Billing() {
  const [searchValue, setSearchValue] = useState("");

  const handleClearSearch = () => {
    setSearchValue("");
  };

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto px-0 pb-8 lg:gap-7 lg:px-7 lg:pb-0">
      <div className="flex flex-col gap-5 pt-5 lg:flex-row lg:gap-4 lg:pt-7">
        <div className="flex flex-col gap-1 px-5 lg:max-w-50 lg:min-w-50 lg:px-0 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeBillingData.sections.currentPlan.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeBillingData.sections.currentPlan.description}
          </p>
        </div>

        <div className="flex w-full flex-col">
          <div className="flex flex-col items-start justify-between gap-3 px-5 lg:flex-row lg:items-center lg:gap-4 lg:px-0 xl:gap-6">
            <div className="flex w-full items-center justify-start gap-3 lg:justify-between lg:gap-2 xl:gap-3">
              <div className="flex items-center gap-3 lg:gap-2 xl:gap-3">
                <div className="bg-bg-white-0 border-stroke-soft-200 flex size-10 items-center justify-center rounded-full border lg:size-8 xl:size-10">
                  <RiVipCrownLine className="size-5 text-green-600" />
                </div>
                <div className="flex flex-col gap-1 lg:gap-0.5 xl:gap-1">
                  <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                    {fakeBillingData.currentPlan.planName}
                  </div>
                  <div className="text-text-soft-400 text-xs font-medium">
                    {fakeBillingData.currentPlan.description}
                  </div>
                </div>
              </div>
              <div className="text-text-strong-950 lg:flex-unset flex-1 text-end text-base font-medium -tracking-widest lg:text-left lg:text-xs xl:text-base">
                {fakeBillingData.currentPlan.price}
                <span className="text-text-soft-400 lg:text-2xs tracking-spacing-tiny-2 ml-1 text-sm font-medium xl:text-sm">
                  {fakeBillingData.currentPlan.priceDetails}
                </span>
              </div>
            </div>
            <Button.Root
              size="xsmall"
              variant="neutral"
              mode="stroke"
              className="text-text-sub-600 !rounded-10 ml-13 w-[calc(100%-52px)] cursor-pointer px-3 text-sm font-medium lg:ml-0 lg:w-fit"
            >
              {fakeBillingData.currentPlan.manageButtonText}
            </Button.Root>
          </div>
          <div className="border-stroke-soft-200 mt-5 flex flex-col gap-3.5 border-t px-5 pt-5 lg:px-0">
            {fakeBillingData.currentPlan.items.map((item) => (
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

      <div className="border-stroke-soft-200 flex flex-col gap-4 border-t pt-5 lg:flex-row lg:pt-7">
        <div className="flex flex-col gap-1 px-5 lg:max-w-50 lg:min-w-50 lg:px-0 xl:max-w-75 xl:min-w-75">
          <h3 className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
            {fakeBillingData.sections.billingHistory.title}
          </h3>
          <p className="text-text-soft-400 tracking-spacing-tiny-2 text-xs font-medium lg:text-sm">
            {fakeBillingData.sections.billingHistory.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-5 px-5 lg:px-0">
          <div className="flex items-center gap-3">
            <Input.Root
              size="xsmall"
              className="hover:bg-bg-weak-50 shadow-custom-input"
            >
              <Input.Wrapper className="px-2.5">
                <Input.Icon as={RiSearchLine} className="text-text-soft-400" />
                <Input.Input
                  type="text"
                  placeholder={
                    fakeBillingData.searchAndFilter.searchPlaceholder
                  }
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
                    <RiCloseLine className="size-5" />
                  </button>
                )}
              </Input.Wrapper>
            </Input.Root>
            <Select.Root size="xsmall">
              <Select.Trigger className="text-text-sub-600 w-auto text-sm">
                <Select.Value
                  placeholder={
                    fakeBillingData.searchAndFilter.selectPlaceholder
                  }
                />
              </Select.Trigger>
              <Select.Content className="z-62">
                <Select.Item value="all">
                  {fakeBillingData.searchAndFilter.selectOptions.all}
                </Select.Item>
                <Select.Item value="paid">
                  {fakeBillingData.searchAndFilter.selectOptions.paid}
                </Select.Item>
                <Select.Item value="pending">
                  {fakeBillingData.searchAndFilter.selectOptions.pending}
                </Select.Item>
                <Select.Item value="failed">
                  {fakeBillingData.searchAndFilter.selectOptions.failed}
                </Select.Item>
              </Select.Content>
            </Select.Root>
          </div>

          <div className="border-stroke-soft-200 flex flex-col gap-5 border-t pt-5">
            {fakeBillingData.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-2.5"
              >
                <div className="text-text-soft-400 tracking-spacing-tiny-2 w-[37%] text-sm font-medium">
                  {invoice.date}
                </div>
                <div className="text-text-sub-600 tracking-spacing-tiny-2 w-[33%] text-sm font-medium">
                  {invoice.amount}
                </div>
                <div className="w-[19%]">
                  <div className="flex items-center gap-2">
                    <div className="size-3 rounded-full bg-green-600">
                      <RiCheckLine className="size-3 text-white" />
                    </div>
                    <span className="text-text-sub-600 tracking-spacing-tiny-2 text-sm font-medium">
                      {invoice.status}
                    </span>
                  </div>
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
