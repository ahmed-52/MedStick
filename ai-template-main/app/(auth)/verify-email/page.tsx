'use client';
import * as React from 'react';
import Image from 'next/image'
import Link from 'next/link';

import * as Button from "@/components/ui/button";
import * as DigitInput from '@/components/ui/digit-input';


export default function VerifyEmailPage() {
  const [digitInputValue, setDigitInputValue] = React.useState('');
  return (
    <div className='flex flex-col items-center w-full md:w-[540px] lg:w-[380px]'>
      <div className='flex flex-col items-center w-full px-5 lg:px-0'>
        <div className='flex justify-center items-center p-3 border border-neutral-100 rounded-full w-14 h-14 mb-4'>
          <Image
              src="/icons/icon-mail.svg"
              width={32}
              height={32}
              alt="Login icon"
              />
        </div>
        <div className="text-text-strong-950 text-lg/snug font-medium tracking-spacing-tiny-1 mb-1">Verify your email</div>
        <div className="text-text-soft-400 text-sm font-medium tracking-spacing-tiny-2 mb-6">We've sent a 6-digit code to <span className='text-text-sub-600'>james@alignui.com</span></div>
      </div>
      
      <div className='flex flex-col gap-3 p-6 shadow-none md:shadow-complex w-full border-t border-l border-r md:border-t-0 md:border-l-0 md:border-r-0 border-faded-lighter rounded-3xl mb-6'>
        <DigitInput.Root
        numInputs={6}
        onChange={(value) => setDigitInputValue(value)}
        value={digitInputValue}
        className='justify-center [&>input]:aspect-square [&>input]:w-auto'
        />
        <Button.Root size='small' variant='neutral' mode='filled' className='w-full bg-green-600 text-white text-sm font-medium tracking-spacing-tiny-2 hover:bg-green-500 focus:shadow-button-green-focus cursor-pointer'>Verify</Button.Root>
        <div className='flex items-center flex-col w-full my-2 text-text-soft-400 text-xs font-medium gap-1.5'>
          Didn't receive the code?
          <span className='text-text-sub-600'>44 seconds</span>
        </div>
      </div>
      <div className='text-text-soft-400 text-sm font-medium tracking-spacing-tiny-2 flex-wrap flex flex-col justify-center items-center gap-1'>Check your spam folder or try resending the code <br /><Link href="/login" className='text-text-sub-600 text-sm font-medium tracking-spacing-tiny-2 underline underline-offset-3 hover:no-underline'>Can't find the email?</Link></div>
    </div>
  );
}