"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import trackThemeContext from "@/app/context/trackThemeContext";
import { cn } from "@/lib/utils";

type ModeToggleProps = {
  className?: string;
  buttonVariant?: "outline" | "ghost";
};

export function ModeToggle({
  className,
  buttonVariant = "outline",
}: ModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { setSelectedTheme } = React.useContext(trackThemeContext);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const current =
      theme === "system" ? resolvedTheme : theme ?? resolvedTheme;
    const next = current === "dark" ? "light" : "dark";
    setSelectedTheme(next);
    setTheme(next);
  };

  if (!mounted) {
    return (
      <Button
        variant={buttonVariant}
        size="icon"
        className={cn(
          "relative shrink-0 border-sidebar-border bg-sidebar",
          className
        )}
        aria-label="Toggle theme"
        disabled
      />
    );
  }

  return (
    <Button
      type="button"
      variant={buttonVariant}
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative shrink-0 border-sidebar-border bg-sidebar hover:cursor-pointer",
        className
      )}
      aria-label="Toggle light and dark theme"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
