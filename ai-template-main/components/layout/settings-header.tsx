import * as Button from "@/components/ui/button";
import { RiCloseLine } from "@remixicon/react";

interface SettingsHeaderProps {
  title: string;
  description: string;
  onClose?: () => void;
  className?: string;
}

export default function SettingsHeader({ title, description, onClose }: SettingsHeaderProps) {
  return (
    <div className="flex justify-between gap-4 px-0 lg:px-7 w-full"> 
    <div className="flex items-center justify-between w-full px-5 lg:px-0 pb-5 lg:pb-7 border-b border-stroke-soft-200">
      <div className="flex flex-col gap-1">
          <h2 className="text-text-strong-950 text-sm font-medium tracking-spacing-tiny-2">{title}</h2>
          <p className="text-text-soft-400 text-xs lg:text-sm font-medium tracking-spacing-tiny-2">{description}</p>
        </div>
        <Button.Root 
          size="small" 
          className="group bg-bg-white-0 hover:bg-bg-weak-50 cursor-pointer rounded-md size-6"
          onClick={onClose}
        >
          <Button.Icon as={RiCloseLine} className="text-text-soft-400 group-hover:text-text-sub-600 size-4.5 duration-200 ease" />
        </Button.Root>
    </div>
      
    </div>
  );
}
