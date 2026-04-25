"use client";

import ChatHeader from "@/components/layout/chat-header";
import ChatInput from "@/components/layout/chat-input";
import * as Button from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  RiFileCopyLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiAttachment2,
  RiArrowDownLine,
} from "@remixicon/react";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
  image?: string;
  hasImage?: boolean;
  file?: {
    name: string;
    type: string;
  };
  hasFile?: boolean;
}

const chatMessages: Message[] = [
  {
    id: 1,
    role: "user",
    content: "Hey Spectrum, I have a question for you.",
  },
  {
    id: 2,
    role: "assistant",
    content: "Of course, I'm listening, how can I help you?",
  },
  {
    id: 3,
    role: "user",
    content: "What's the difference between serif and sans-serif fonts?",
    image: "/images/ai-chat-image.png",
    hasImage: true,
  },
  {
    id: 4,
    role: "assistant",
    content:
      "Serif fonts have strokes (Times New Roman); sans-serif are clean (Arial). Serif feels traditional for print, sans-serif modern for screens.",
  },
  {
    id: 5,
    role: "user",
    content: "What's the difference between serif and sans-serif fonts?",
    file: {
      name: "license-agreement.pdf",
      type: "PDF",
    },
    hasFile: true,
  },
];

export default function ChatContent({ id }: { id: string }) {
  const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>(
    {},
  );

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const timer = setTimeout(() => {
      const { scrollHeight, clientHeight } = messagesContainer;

      if (scrollHeight > clientHeight) {
        messagesContainer.scrollTop = scrollHeight - clientHeight;
      }

      messagesContainer.classList.remove("opacity-0");
      messagesContainer.classList.add("opacity-100");
    }, 100);

    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setShowScrollButton(!isNearBottom && scrollHeight > clientHeight);
    };

    messagesContainer.addEventListener("scroll", handleScroll);
    return () => messagesContainer.removeEventListener("scroll", handleScroll);
  }, [id]);

  const scrollToBottom = () => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth",
    });
  };

  const toggleButton = (messageId: number, actionType: string) => {
    const key = `${messageId}_${actionType}`;
    setActiveButtons((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isButtonActive = (messageId: number, actionType: string) => {
    const key = `${messageId}_${actionType}`;
    return activeButtons[key] || false;
  };

  return (
    <div className="flex h-full flex-col lg:p-1.5 lg:pl-0">
      <div className="bg-bg-white-0 lg:border-stroke-soft-200 relative flex h-full flex-col justify-between pb-4 lg:rounded-3xl lg:border lg:py-4 lg:pr-4 lg:pl-5">
        <ChatHeader title="Design help" subtitle="Typography discussion" />

        <div
          ref={messagesContainerRef}
          className="-mt-4 -mb-5 flex w-full flex-1 justify-center overflow-y-auto opacity-0 transition-opacity duration-200 ease-in-out lg:-ml-5 lg:w-[calc(100%+36px)]"
        >
          <div className="flex w-full flex-col px-5 lg:w-175 lg:px-0">
            <div className="space-y-3.5 pt-30 pb-24">
              {chatMessages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  {message.role === "assistant" ? (
                    <div className="flex items-start">
                      <div className="flex-1 space-y-2">
                        <div className="text-text-strong-950 lg:tracking-spacing-tiny-3 tracking-spacing-tiny-2 px-1 text-[14px] leading-5 lg:text-[15px] lg:leading-6">
                          {message.content}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button.Root
                            variant="neutral"
                            mode="ghost"
                            onClick={() => toggleButton(message.id, "copy")}
                            className={cn(
                              "group size-6 cursor-pointer rounded-md p-0 transition-colors",
                              isButtonActive(message.id, "copy")
                                ? "shadow-gray-shadow bg-bg-weak-50"
                                : "bg-bg-white-0 hover:bg-bg-weak-50",
                            )}
                          >
                            <Button.Icon
                              as={RiFileCopyLine}
                              className={cn(
                                "size-4.5 duration-200",
                                isButtonActive(message.id, "copy")
                                  ? "text-text-sub-600"
                                  : "text-text-soft-400 group-hover:text-text-sub-600",
                              )}
                            />
                          </Button.Root>
                          <Button.Root
                            variant="neutral"
                            mode="ghost"
                            onClick={() => toggleButton(message.id, "thumbUp")}
                            className={cn(
                              "group size-6 cursor-pointer rounded-md p-0 transition-colors",
                              isButtonActive(message.id, "thumbUp")
                                ? "shadow-gray-shadow bg-bg-weak-50"
                                : "bg-bg-white-0 hover:bg-bg-weak-50",
                            )}
                          >
                            <Button.Icon
                              as={RiThumbUpLine}
                              className={cn(
                                "size-4.5 duration-200",
                                isButtonActive(message.id, "thumbUp")
                                  ? "text-text-sub-600"
                                  : "text-text-soft-400 group-hover:text-text-sub-600",
                              )}
                            />
                          </Button.Root>
                          <Button.Root
                            variant="neutral"
                            mode="ghost"
                            onClick={() =>
                              toggleButton(message.id, "thumbDown")
                            }
                            className={cn(
                              "group size-6 cursor-pointer rounded-md p-0 transition-colors",
                              isButtonActive(message.id, "thumbDown")
                                ? "shadow-gray-shadow bg-bg-weak-50"
                                : "bg-bg-white-0 hover:bg-bg-weak-50",
                            )}
                          >
                            <Button.Icon
                              as={RiThumbDownLine}
                              className={cn(
                                "size-4.5 duration-200",
                                isButtonActive(message.id, "thumbDown")
                                  ? "text-text-sub-600"
                                  : "text-text-soft-400 group-hover:text-text-sub-600",
                              )}
                            />
                          </Button.Root>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <div className="flex flex-col gap-1.5">
                        {message.hasImage && message.image && (
                          <div className="flex justify-end">
                            <Image
                              src={message.image}
                              alt="User uploaded image"
                              width={148}
                              height={148}
                              className="rounded-2xl"
                            />
                          </div>
                        )}
                        {message.hasFile && message.file && (
                          <div className="flex justify-end">
                            <div className="bg-bg-white-0 border-stroke-soft-200 flex items-center gap-3 rounded-2xl border py-2.5 pr-4 pl-3">
                              <div className="bg-bg-weak-50 flex size-9 items-center justify-center rounded-full">
                                <RiAttachment2 className="text-text-sub-600 size-5" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <div className="text-text-strong-950 tracking-spacing-tiny-2 text-sm font-medium">
                                  {message.file.name}
                                </div>
                                <div className="text-text-sub-600 text-xs font-medium">
                                  {message.file.type}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="bg-bg-soft-200 max-w-md rounded-[14px] rounded-br-[8px] px-3.5 py-2.5">
                          <div className="text-text-strong-950 lg:tracking-spacing-tiny-3 tracking-spacing-tiny-2 text-[14px] leading-5 lg:text-[15px] lg:leading-6">
                            {message.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          {showScrollButton && (
            <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2">
              <Button.Root
                variant="neutral"
                mode="ghost"
                size="small"
                onClick={scrollToBottom}
                className="bg-bg-white-0 hover:bg-bg-weak-50 shadow-complex flex size-8 cursor-pointer items-center rounded-full p-0"
              >
                <Button.Icon
                  as={RiArrowDownLine}
                  className="text-text-sub-600 size-5"
                />
              </Button.Root>
            </div>
          )}

          <ChatInput bottomText />
        </div>
      </div>
    </div>
  );
}
