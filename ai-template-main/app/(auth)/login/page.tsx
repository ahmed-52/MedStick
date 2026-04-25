"use client";
import * as React from "react";
import Image from "next/image";
import * as Button from "@/components/ui/button";
import Link from "next/link";
import {
  RiMailFill,
  RiEyeLine,
  RiEyeOffLine,
  RiLock2Fill,
} from "@remixicon/react";

import * as Input from "@/components/ui/input";
import * as Label from "@/components/ui/label";
import * as Checkbox from "@/components/ui/checkbox";

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false);
  const uniqueId = React.useId();
  return (
    <div className="flex w-full flex-col items-center md:w-[540px] lg:w-[380px]">
      <div className="flex w-full flex-col items-center px-5 lg:px-0">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-neutral-100 p-3">
          <Image
            src="/icons/icon-login.svg"
            width={32}
            height={32}
            alt="Login icon"
          />
        </div>
        <div className="text-text-strong-950 tracking-spacing-tiny-1 mb-1 text-lg/snug font-medium">
          Sign in to your account
        </div>
        <div className="text-text-soft-400 tracking-spacing-tiny-2 mb-6 text-sm font-medium">
          Enter your details to login.
        </div>
        <div className="mb-4 flex w-full max-w-sm gap-3">
          <Button.Root
            className="tracking-spacing-tiny-2 text-text-soft-400 shadow-gray-shadow-4 hover:!shadow-gray-shadow hover:!text-text-soft-400 h-9 w-full cursor-pointer gap-0 text-sm font-medium ring-0"
            variant="neutral"
            mode="stroke"
          >
            <Button.Icon className="mr-2 size-5">
              <Image
                src="/icons/icon-apple.svg"
                alt="Apple"
                width={20}
                height={20}
              />
            </Button.Icon>
            <span className="hidden lg:inline">Sign in with</span>
            <span className="lg:hidden">Sign in w/</span>
            <span className="text-text-sub-600 ml-1">Apple</span>
          </Button.Root>
          <Button.Root
            className="tracking-spacing-tiny-2 text-text-soft-400 shadow-gray-shadow-4 hover:!shadow-gray-shadow hover:!text-text-soft-400 h-9 w-full cursor-pointer gap-0 text-sm font-medium ring-0"
            variant="neutral"
            mode="stroke"
          >
            <Button.Icon className="mr-2 size-5">
              <Image
                src="/icons/icon-google.svg"
                alt="Google"
                width={20}
                height={20}
              />
            </Button.Icon>
            <span className="hidden lg:inline">Sign in with</span>
            <span className="lg:hidden">Sign in w/</span>
            <span className="text-text-sub-600 ml-1">Google</span>
          </Button.Root>
        </div>
      </div>

      <div className="md:shadow-complex border-faded-lighter mb-6 flex w-full flex-col gap-3 rounded-3xl border-t border-r border-l p-6 shadow-none md:border-t-0 md:border-r-0 md:border-l-0">
        <div className="group flex flex-col gap-1">
          <Label.Root htmlFor="email">
            Email Address
            <Label.Asterisk />
          </Label.Root>

          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiMailFill} />
              <Input.Input
                id="email"
                type="email"
                placeholder="hello@alignui.com"
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className="group flex flex-col gap-1">
          <Label.Root htmlFor="password1">
            Password
            <Label.Asterisk />
          </Label.Root>

          <Input.Root>
            <Input.Wrapper>
              <Input.Icon as={RiLock2Fill} />
              <Input.Input
                id="password1"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="text-text-disabled-300 group-hover:text-text-soft-400 group-focus-within:text-text-soft-400 flex items-center justify-center transition-colors duration-200"
              >
                {showPassword ? (
                  <RiEyeOffLine className="size-5" />
                ) : (
                  <RiEyeLine className="size-5" />
                )}
              </button>
            </Input.Wrapper>
          </Input.Root>
        </div>
        <div className="my-2 flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Checkbox.Root id={`${uniqueId}-c1`} />
            <Label.Root
              className="tracking-spacing-tiny-2 text-text-sub-600 text-sm font-medium"
              htmlFor={`${uniqueId}-c1`}
            >
              Keep me logged in
            </Label.Root>
          </div>
          <Link
            href="/reset-password"
            className="text-text-soft-400 tracking-spacing-tiny-2 hover:text-text-sub-600 text-sm font-medium transition-colors duration-200"
          >
            Forgot password?
          </Link>
        </div>
        <Button.Root
          size="small"
          variant="neutral"
          mode="filled"
          className="tracking-spacing-tiny-2 focus:shadow-button-green-focus w-full cursor-pointer bg-green-600 text-sm font-medium text-white hover:bg-green-500"
        >
          Sign in
        </Button.Root>
      </div>
      <div className="text-text-soft-400 tracking-spacing-tiny-2 flex flex-wrap items-center justify-center gap-1 text-sm font-medium">
        Don’t have an account?{" "}
        <Link
          href="/register"
          className="text-text-sub-600 tracking-spacing-tiny-2 text-sm font-medium underline underline-offset-3 hover:no-underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
