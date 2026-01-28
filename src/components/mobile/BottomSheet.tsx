import * as React from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
  snapPoints?: (number | string)[];
  defaultSnap?: number | string;
  dismissible?: boolean;
  modal?: boolean;
}

const BottomSheet = ({
  open,
  onOpenChange,
  children,
  trigger,
  title,
  description,
  snapPoints,
  defaultSnap,
  dismissible = true,
  modal = true,
}: BottomSheetProps) => {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      activeSnapPoint={defaultSnap}
      dismissible={dismissible}
      modal={modal}
    >
      {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "bg-background rounded-t-2xl",
            "flex flex-col max-h-[96vh]",
            "focus:outline-none safe-area-bottom"
          )}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          
          {/* Header */}
          {(title || description) && (
            <div className="px-4 pb-3 border-b">
              {title && (
                <Drawer.Title className="text-lg font-semibold text-foreground">
                  {title}
                </Drawer.Title>
              )}
              {description && (
                <Drawer.Description className="text-sm text-muted-foreground mt-1">
                  {description}
                </Drawer.Description>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto momentum-scroll">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};

const BottomSheetTrigger = Drawer.Trigger;
const BottomSheetClose = Drawer.Close;

export { BottomSheet, BottomSheetTrigger, BottomSheetClose };
