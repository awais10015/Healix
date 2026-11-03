"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClassName =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

type PasswordInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "autoComplete"
> & {
  autoComplete?: React.ComponentProps<"input">["autoComplete"];
};

function PasswordInput({
  className,
  id,
  autoComplete,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  const textRef = React.useRef<HTMLInputElement>(null);
  const baseClass = cn(inputClassName, "pr-10", className);

  const toggleVisible = () => {
    setVisible((prev) => {
      const next = !prev;

      if (next && passwordRef.current && props.onChange) {
        const nativeValue = passwordRef.current.value;
        props.onChange({
          target: { value: nativeValue },
          currentTarget: { value: nativeValue },
        } as React.ChangeEvent<HTMLInputElement>);
      }

      requestAnimationFrame(() => {
        const el = next ? textRef.current : passwordRef.current;
        el?.focus();
        const len = el?.value.length ?? 0;
        el?.setSelectionRange(len, len);
      });
      return next;
    });
  };

  return (
    <div className="relative">
      <input
        ref={passwordRef}
        {...props}
        id={!visible ? id : undefined}
        type="password"
        autoComplete={autoComplete}
        data-slot="input"
        className={cn(baseClass, visible && "hidden")}
        aria-hidden={visible}
        tabIndex={visible ? -1 : undefined}
      />
      <input
        ref={textRef}
        {...props}
        id={visible ? id : undefined}
        type="text"
        autoComplete="off"
        data-slot="input"
        data-1p-ignore
        data-lpignore="true"
        className={cn(baseClass, !visible && "hidden")}
        aria-hidden={!visible}
        tabIndex={visible ? undefined : -1}
      />
      <button
        type="button"
        className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onMouseDown={(e) => {
          e.preventDefault();
        }}
        onClick={toggleVisible}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
