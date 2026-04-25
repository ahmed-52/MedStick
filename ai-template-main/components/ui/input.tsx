// AlignUI Input v0.0.0

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import type { PolymorphicComponentProps } from "@/utils/polymorphic";
import { recursiveCloneChildren } from "@/utils/recursive-clone-children";
import { tv, type VariantProps } from "@/utils/tv";

const INPUT_ROOT_NAME = "InputRoot";
const INPUT_WRAPPER_NAME = "InputWrapper";
const INPUT_EL_NAME = "InputEl";
const INPUT_ICON_NAME = "InputIcon";
const INPUT_AFFIX_NAME = "InputAffixButton";
const INPUT_INLINE_AFFIX_NAME = "InputInlineAffixButton";

export const inputVariants = tv({
  slots: {
    root: [
      // base
      "group relative flex w-full overflow-hidden bg-bg-white-0 text-text-soft-400 shadow-gray-shadow-4",
      "transition duration-200 ease-out",
      // hover
      "hover:shadow-gray-shadow hover:bg-bg-weak-50",
      // focus
      "has-[input:focus]:shadow-gray-shadow-2",
      // disabled
      "has-[input:disabled]:shadow-none",
    ],
    wrapper: [
      // base
      "group/input-wrapper flex w-full cursor-text items-center bg-bg-white-0",
      "transition duration-200 ease-out",
      // hover
      "group-hover:bg-bg-weak-50 hover:bg-transparent group-hover:hover:bg-bg-weak-50",
      // focus
      "focus-within:bg-transparent focus-within:hover:bg-bg-white-0",
      // disabled
      "has-[input:disabled]:pointer-events-none has-[input:disabled]:bg-bg-weak-50",
    ],
    input: [
      // base
      "w-full bg-none text-sm font-medium text-text-sub-600 outline-none",
      "transition duration-200 ease-out",
      // placeholder
      "placeholder:select-none placeholder:text-text-soft-400 placeholder:transition placeholder:duration-200 placeholder:ease-out",
      // hover placeholder
      "group-hover:placeholder:text-text-soft-400 hover:placeholder:text-text-soft-400 group-hover:hover:placeholder:text-text-soft-400",
      // focus
      "focus:outline-none",
      // focus placeholder
      "focus:placeholder:text-text-sub-600",
      // disabled
      "disabled:text-text-disabled-300 disabled:placeholder:text-text-disabled-300",
    ],
    icon: [
      // base
      "flex size-5 shrink-0 select-none items-center justify-center text-text-disabled-300",
      "transition duration-200 ease-out",
      // hover states
      "group-hover:text-text-soft-400",
      // focus states
      "group-has-[input:focus]:text-green-600 group-focus-within:text-green-600",
      // disabled
      "group-has-[input:disabled]:text-text-disabled-300",
    ],
    affix: [
      // base
      "shrink-0 bg-bg-white-0 text-paragraph-sm text-text-sub-600",
      "flex items-center justify-center truncate",
      "transition duration-200 ease-out",
      // placeholder state
      "group-has-[:placeholder-shown]:text-text-soft-400",
      // focus state
      "group-has-[:placeholder-shown]:group-has-[input:focus]:text-text-sub-600",
    ],
    inlineAffix: [
      // base
      "text-paragraph-sm text-text-sub-600",
      // placeholder state
      "group-has-[:placeholder-shown]:text-text-soft-400",
      // focus state
      "group-has-[:placeholder-shown]:group-has-[input:focus]:text-text-sub-600",
    ],
  },
  variants: {
    size: {
      medium: {
        root: "rounded-10",
        wrapper: "gap-2 px-3",
        input: "h-10",
      },
      small: {
        root: "rounded-lg",
        wrapper: "gap-2 px-2.5",
        input: "h-9",
      },
      xsmall: {
        root: "rounded-lg",
        wrapper: "gap-1.5 px-2",
        input: "h-8",
      },
    },
    hasError: {
      true: {
        root: [
          // base
          "before:ring-error-base",
          // base
          "hover:before:ring-error-base hover:[&:not(&:has(input:focus)):has(>:only-child)]:before:ring-error-base",
          // focus
          "has-[input:focus]:shadow-button-error-focus has-[input:focus]:before:ring-error-base",
        ],
      },
      false: {
        root: [
          // hover
          "hover:[&:not(:has(input:focus)):has(>:only-child)]:before:ring-transparent",
        ],
      },
    },
  },
  compoundVariants: [
    //#region affix
    {
      size: "medium",
      class: {
        affix: "px-3",
      },
    },
    {
      size: ["small", "xsmall"],
      class: {
        affix: "px-2.5",
      },
    },
    //#endregion
  ],
  defaultVariants: {
    size: "medium",
  },
});

type InputSharedProps = VariantProps<typeof inputVariants>;

function InputRoot({
  className,
  children,
  size,
  hasError,
  asChild,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> &
  InputSharedProps & {
    asChild?: boolean;
  }) {
  const uniqueId = React.useId();
  const Component = asChild ? Slot : "div";

  const { root } = inputVariants({
    size,
    hasError,
  });

  const sharedProps: InputSharedProps = {
    size,
    hasError,
  };

  const extendedChildren = recursiveCloneChildren(
    children as React.ReactElement[],
    sharedProps,
    [
      INPUT_WRAPPER_NAME,
      INPUT_EL_NAME,
      INPUT_ICON_NAME,
      INPUT_AFFIX_NAME,
      INPUT_INLINE_AFFIX_NAME,
    ],
    uniqueId,
    asChild,
  );

  return (
    <Component className={root({ class: className })} {...rest}>
      {extendedChildren}
    </Component>
  );
}
InputRoot.displayName = INPUT_ROOT_NAME;

function InputWrapper({
  className,
  children,
  size,
  hasError,
  asChild,
  ...rest
}: React.HTMLAttributes<HTMLLabelElement> &
  InputSharedProps & {
    asChild?: boolean;
  }) {
  const Component = asChild ? Slot : "label";

  const { wrapper } = inputVariants({
    size,
    hasError,
  });

  return (
    <Component className={wrapper({ class: className })} {...rest}>
      {children}
    </Component>
  );
}
InputWrapper.displayName = INPUT_WRAPPER_NAME;

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> &
    InputSharedProps & {
      asChild?: boolean;
    }
>(
  (
    { className, type = "text", size, hasError, asChild, ...rest },
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : "input";

    const { input } = inputVariants({
      size,
      hasError,
    });

    return (
      <Component
        type={type}
        className={input({ class: className })}
        ref={forwardedRef}
        {...rest}
      />
    );
  },
);
Input.displayName = INPUT_EL_NAME;

function InputIcon<T extends React.ElementType = "div">({
  size,
  hasError,
  as,
  className,
  ...rest
}: PolymorphicComponentProps<T, InputSharedProps>) {
  const Component = as || "div";
  const { icon } = inputVariants({ size, hasError });

  return <Component className={icon({ class: className })} {...rest} />;
}
InputIcon.displayName = INPUT_ICON_NAME;

function InputAffix({
  className,
  children,
  size,
  hasError,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & InputSharedProps) {
  const { affix } = inputVariants({
    size,
    hasError,
  });

  return (
    <div className={affix({ class: className })} {...rest}>
      {children}
    </div>
  );
}
InputAffix.displayName = INPUT_AFFIX_NAME;

function InputInlineAffix({
  className,
  children,
  size,
  hasError,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & InputSharedProps) {
  const { inlineAffix } = inputVariants({
    size,
    hasError,
  });

  return (
    <span className={inlineAffix({ class: className })} {...rest}>
      {children}
    </span>
  );
}
InputInlineAffix.displayName = INPUT_INLINE_AFFIX_NAME;

export {
  InputRoot as Root,
  InputWrapper as Wrapper,
  Input,
  InputIcon as Icon,
  InputAffix as Affix,
  InputInlineAffix as InlineAffix,
};
