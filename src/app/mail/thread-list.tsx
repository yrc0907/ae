"use client"
/*eslint-disable*/
import React, { type ComponentProps } from "react"
import DOMPurify from 'dompurify';
// import { motion, AnimatePresence } from 'framer-motion'
import { formatDistanceToNow } from "date-fns"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
// import { useThread } from "@/app/mail/use-thread"
import { api, type RouterOutputs } from "@/trpc/react"
import { useAtom } from "jotai"
// import useVim from "./kbar/use-vim"
// import { useAutoAnimate } from "@formkit/auto-animate/react"
import { useLocalStorage } from "usehooks-ts"

// import { isSearchingAtom } from "./search-bar"

import { format } from "date-fns";
import useThreads from "@/hooks/use-thread";

export function ThreadList() {
  const { threads,setThreadId } = useThreads();

  // const [threadId, setThreadId] = useThread();
  // const [parent] = useAutoAnimate(/* optional config */);
  // const { selectedThreadIds, visualMode } = useVim();

  const groupedThreads = threads?.reduce((acc, thread) => {
    // const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");
    const date = format(thread.emails[0]?.sentAt ?? new Date(), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(thread);
    return acc;
  }, {} as Record<string, typeof threads>);

  return (
    <div className="max-w-full overflow-y-scroll max-h-[calc(100vh-120px)]">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {Object.entries(groupedThreads ?? {}).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="text-xs font-medium text-muted-foreground mt-4 first:mt-0">
              {format(new Date(date), "MMMM d, yyyy")}
            </div>
            {threads.map((thread) => (
              <button
                id={`thread-${thread.id}`}
                key={thread.id}
                // className={cn(
                //   "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all relative",
                //   visualMode &&
                //   selectedThreadIds.includes(thread.id) &&
                //   "bg-blue-200 dark:bg-blue-900"
                // )}
                onClick={() => {
                  setThreadId(thread.id);
                }}
              >
                {/* {thread.id === thread.id && (
                  <motion.div
                    className="absolute inset-0 dark:bg-white/20 bg-black/10 z-[-1] rounded-lg"
                    layoutId="thread-list-item"
                    transition={{
                      duration: 0.1,
                      ease: "easeInOut",
                    }}
                  />
                )} */}
                <div className="flex flex-col w-full gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        {thread.emails.at(-1)?.from?.name}
                      </div>
                    </div>
                    <div
                      // className={cn(
                      //   "ml-auto text-xs",
                      //   threadId === thread.id
                      //     ? "text-foreground"
                      //     : "text-muted-foreground"
                      // )}
                    >
                      {formatDistanceToNow(thread.emails.at(-1)?.sentAt ?? new Date(), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="text-xs font-medium">{thread.subject}</div>
                </div>
                <div
                  className="text-xs line-clamp-2 text-muted-foreground"
                  dangerouslySetInnerHTML={ {
                    __html: DOMPurify.sanitize(thread.emails.at(-1)?.bodySnippet ?? "", {
                      USE_PROFILES: { html: true }
                    })
                  }}
                ></div>
                {thread.emails[0]?.sysLabels.length ? (
                  <div className="flex items-center gap-2">
                    {thread.emails.at(0)?.sysLabels.map((label) => (
                      <Badge
                        key={label}
                        variant={getBadgeVariantFromLabel(label)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
