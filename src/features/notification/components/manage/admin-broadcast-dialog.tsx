"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CustomDateTimePicker } from "@/components/ui/custom-datetime-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBroadcast } from "../../hooks";
import { isSafeRedirectUrl } from "../../schemas";

const AdminDispatchFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be 300 characters or fewer"),
  redirect_url: z
    .string()
    .max(255, "URL must be 255 characters or fewer")
    .refine(
      (val) => !val || isSafeRedirectUrl(val),
      "URL must be a relative path (e.g. /dashboard) or an HTTPS URL (https://...)",
    )
    .optional()
    .or(z.literal("")),
  expires_at: z.string().min(1, "Expiry date is required"),
});

type AdminDispatchFormValues = z.infer<typeof AdminDispatchFormSchema>;

interface AdminBroadcastDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdminBroadcastDialog({
  open,
  onOpenChange,
}: AdminBroadcastDialogProps) {
  const { mutate: create, isPending } = useCreateBroadcast();

  const form = useForm<AdminDispatchFormValues>({
    resolver: zodResolver(AdminDispatchFormSchema),
    defaultValues: {
      title: "",
      description: "",
      redirect_url: "",
      expires_at: "",
    },
  });

  const titleValue = form.watch("title") ?? "";
  const descValue = form.watch("description") ?? "";

  function onSubmit(values: AdminDispatchFormValues) {
    create(
      {
        title: values.title,
        description: values.description,
        url: values.redirect_url || undefined,
        expires_at: values.expires_at,
      },
      {
        onSuccess: () => {
          form.reset();
          onOpenChange(false);
        },
      },
    );
  }

  function handleOpenChange(next: boolean) {
    if (!next) form.reset();
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            <DialogTitle>Dispatch Admin Broadcast</DialogTitle>
          </div>
          <DialogDescription>
            Sends a platform-wide announcement to every active user as a global
            broadcast notification.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Title</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {titleValue.length}/100
                    </span>
                  </div>
                  <FormControl>
                    <Input
                      id="admin-broadcast-title"
                      placeholder="e.g. Platform Maintenance"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Description</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {descValue.length}/300
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      id="admin-broadcast-description"
                      placeholder="Full announcement text shown to users…"
                      rows={4}
                      maxLength={300}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Redirect URL */}
            <FormField
              control={form.control}
              name="redirect_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Redirect URL{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="admin-broadcast-redirect-url"
                      placeholder="https://mulearn.org/status"
                      maxLength={255}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Users navigate here when they tap the notification.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Expires at — date/time picker */}
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expires at</FormLabel>
                  <FormControl>
                    <CustomDateTimePicker
                      value={field.value ?? ""}
                      onChange={(val) => field.onChange(val)}
                      minDate={new Date()}
                    />
                  </FormControl>
                  <FormDescription>
                    Broadcast stops showing to users after this date and time.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Audience note */}
            <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Audience: </span>
                All active users — cannot be targeted to a subset.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Dispatching…" : "Dispatch broadcast"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
