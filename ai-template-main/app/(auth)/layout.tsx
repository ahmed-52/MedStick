'use client';
import Link from "next/link";
import * as Button from "@/components/ui/button";
import { RiCloseLine } from "@remixicon/react";
import { usePathname } from "next/navigation";

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


export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    const pathname = usePathname();
    const showSignInMessage = pathname === '/verify-email' || pathname === '/reset-password';
    
    return (
      <div  className="h-screen max-h-screen  w-full bg-bg-white-0 flex flex-col items-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="hidden lg:flex absolute w-0.25 h-full bg-faded-lighter left-[20%] z-1"></div>
          <div className="hidden lg:flex absolute w-0.25 h-full bg-faded-lighter right-[20%] z-1"></div>
          <div className="hidden lg:flex justify-center items-center absolute left-[calc(20%-5.5px)] top-[70.5px] z-3 w-3 h-3 rounded-full bg-bg-white-0">
            <div className="bg-bg-weak-50 rounded-full w-2 h-2"></div>
          </div>
          <div className="hidden lg:flex justify-center items-center absolute right-[calc(20%-5.5px)] top-[70.5px] z-3 w-3 h-3 rounded-full bg-bg-white-0">
            <div className="bg-bg-weak-50 rounded-full w-2 h-2"></div>
          </div>
          <div className="hidden lg:flex justify-center items-center absolute left-[calc(20%-5.5px)] bottom-[62.5px] z-3 w-3 h-3 rounded-full bg-bg-white-0">
            <div className="bg-bg-weak-50 rounded-full w-2 h-2"></div>
          </div>
          <div className="hidden lg:flex justify-center items-center absolute right-[calc(20%-5.5px)] bottom-[62.5px] z-3 w-3 h-3 rounded-full bg-bg-white-0">
            <div className="bg-bg-weak-50 rounded-full w-2 h-2"></div>
          </div>
          <div className="hidden lg:flex animated-line absolute w-0.25 h-[25%] bg-gradient-to-br from-neutral-50 to-green-600 left-[20%] top-[-25%] z-2"></div>
          <div className="hidden lg:flex animated-line-reverse absolute w-0.25 h-[25%] bg-gradient-to-tl from-green-600 to-neutral-50 right-[20%] bottom-[-25%] z-2"></div>
        </div>
        <div className="flex items-center px-6 py-4.5 lg:py-6 w-full border-b border-faded-lighter">
            <div className="flex">
                <Logo className="size-7 text-green-600 transition-opacity duration-200 group-hover:hidden" />
            </div>
            <div className="flex flex-1 justify-end mr-2 lg:mr-6">
                {showSignInMessage && (
                  <p className="text-text-soft-400 text-sm">Changed your mind? <Link href="/login" className="text-text-sub-600 text-sm underline-offset-3 font-medium hover:underline">Sign in</Link></p>
                )}
            </div>
            <div className="flex">
              <Button.Root variant="neutral" mode="ghost" size="xsmall" className="group size-8 lg:size-6 p-0.75 cursor-pointer rounded-md">
                <Button.Icon
                    as={RiCloseLine}
                    className="text-text-soft-400 hover:text-text-sub-600 group-hover:text-text-sub-600 w-full h-full"
                />
              </Button.Root>
            </div>
        </div>
            
          <div className="flex-1 flex justify-center items-center z-10 w-full">
          {children}
          </div>

          <div className="flex justify-center py-5 lg:py-6.5 w-full border-t border-faded-lighter text-text-soft-400 text-xs">
            All rights reserved © 2025 Spectrum
          </div>
      </div>
    );
  }