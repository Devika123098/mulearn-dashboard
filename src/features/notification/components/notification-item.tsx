"use client";

import { formatDistanceToNow } from "date-fns";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NotificationItem as NotificationItemData } from "../schemas";

interface NotificationItemProps {
  item: NotificationItemData;
  isDeleting?: boolean;
  isMarkingRead?: boolean;
  onDelete?: (id: string) => void;
  onMarkRead?: (id: string) => void;
}

export function NotificationItem({
  item,
  isDeleting,
  isMarkingRead,
  onDelete,
  onMarkRead,
}: NotificationItemProps) {
  const isPending = isDeleting || isMarkingRead;
  const isExternal =
    (item.redirect_url?.startsWith("http") ||
      item.redirect_url?.startsWith("//")) ??
    false;

  function handleClick() {
    if (!item.is_read && onMarkRead) {
      onMarkRead(item.id);
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full flex-col gap-1 rounded-lg border border-border p-3 text-left text-sm transition-all hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        item.is_read ? "bg-card" : "bg-primary/5 border-primary/20",
        isPending && "pointer-events-none opacity-50",
      )}
      onClick={handleClick}
      disabled={isPending}
      aria-label={item.title}
    >
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {/* Unread indicator dot */}
          {!item.is_read && (
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
          <p className="truncate font-medium leading-snug">{item.title}</p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          {!item.is_read && onMarkRead && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(item.id);
              }}
              disabled={isPending}
              aria-label="Mark as read"
              title="Mark as read"
            >
              <Check className="h-3 w-3" />
            </Button>
          )}

          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              disabled={isPending}
              aria-label="Delete notification"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <p className="line-clamp-2 pl-3.5 text-xs leading-snug text-muted-foreground">
        {item.description}
      </p>

      <div className="mt-1 flex items-center justify-between pl-3.5">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
        </span>

        {item.redirect_url && (
          <Link
            href={item.redirect_url}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            View
            <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
    </button>
  );
}
