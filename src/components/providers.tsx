"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { CartDrawer } from "@/components/cart/cart-drawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" forcedTheme="dark" enableSystem={false}>
      <TooltipProvider delay={150}>
        {children}
        <CartDrawer />
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
