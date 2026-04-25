'use client';
import * as React from 'react';
import Image from 'next/image'
import * as Button from "@/components/ui/button";
import Link from 'next/link';
import { RiMailFill, RiInformationFill } from '@remixicon/react';
 
import * as Hint from '@/components/ui/hint';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';

export default function ResetPasswordPage() {
  return (
    <div className='flex flex-col items-center w-full md:w-[540px] lg:w-[380px]'>
      <div className='flex flex-col items-center w-full px-5 lg:px-0'>
        <div className='flex justify-center items-center p-3 border border-neutral-100 rounded-full w-14 h-14 mb-4'>
          <Image
              src="/icons/icon-lock.svg"
              width={32}
              height={32}
              alt="Login icon"
              />
        </div>
        <div className="text-text-strong-950 text-lg/snug font-medium tracking-spacing-tiny-1 mb-1">Reset your password</div>
        <div className="text-text-soft-400 text-sm font-medium tracking-spacing-tiny-2 mb-6">Enter your email to reset your password</div>
      </div>
      
      <div className='flex flex-col gap-3 p-6 shadow-none md:shadow-complex w-full border-t border-l border-r md:border-t-0 md:border-l-0 md:border-r-0 border-faded-lighter rounded-3xl mb-6'>
        <div className='group flex flex-col gap-1'>
          <Label.Root htmlFor='email'>
            Email Address
            <Label.Asterisk />
          </Label.Root>
  
          <Input.Root>
            <Input.Wrapper>
               <Input.Icon as={RiMailFill} />
              <Input.Input
                id='email'
                type='email'
                placeholder='hello@alignui.com'
              />
            </Input.Wrapper>
          </Input.Root>
        </div>
        <Hint.Root className='flex items-center w-full mb-2'>
            <Hint.Icon as={RiInformationFill}/>
            Enter the email with which you've registered.
        </Hint.Root>
        <Button.Root size='small' variant='neutral' mode='filled' className='w-full bg-green-600 text-white text-sm font-medium tracking-spacing-tiny-2 hover:bg-green-500 focus:shadow-button-green-focus cursor-pointer'>Reset password</Button.Root>
      </div>
      <div className='text-text-soft-400 text-sm font-medium tracking-spacing-tiny-2 flex-wrap flex flex-col justify-center items-center gap-1'>Don’t have access anymore? <br /><Link href="/login" className='text-text-sub-600 text-sm font-medium tracking-spacing-tiny-2 underline underline-offset-3 hover:no-underline'>Try another method</Link></div>
    </div>
  );
}