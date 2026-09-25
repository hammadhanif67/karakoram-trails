import * as React from "react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "solid";
type Tone = "dark" | "light";
type Size = "md" | "lg";

type CommonProps = {
  variant?: Variant;
  /** Background the button sits on; sets outline colours. */
  tone?: Tone;
  size?: Size;
  /** Adds Magic UI's animated Shine Border around the button. */
  shine?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

type AsLink = CommonProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string };
type AsButton = CommonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

const base =
  "group/skew relative isolate inline-flex -skew-x-12 cursor-pointer items-center justify-center overflow-hidden rounded-[3px] " +
  "text-center font-medium tracking-wide select-none " +
  "transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "hover:translate-x-1 active:translate-x-0 active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-apricot " +
  "motion-reduce:transition-none motion-reduce:hover:translate-x-0";

const sizes: Record<Size, string> = {
  md: "min-h-12 px-6 py-2 text-sm sm:px-7",
  lg: "min-h-14 px-6 py-2.5 text-[0.95rem] sm:px-9",
};

const variants: Record<Variant, Record<Tone, string>> = {
  primary: {
    dark: "bg-apricot text-apricot-ink shadow-lg shadow-apricot/25 hover:bg-[#dc9a4f] hover:shadow-apricot/40",
    light: "bg-apricot text-apricot-ink shadow-lg shadow-apricot/25 hover:bg-[#dc9a4f] hover:shadow-apricot/40",
  },
  outline: {
    dark: "border border-cream/55 text-cream hover:border-cream hover:bg-cream hover:text-ink",
    light: "border border-pine/60 text-pine hover:border-pine hover:bg-pine hover:text-cream",
  },
  solid: {
    dark: "bg-cream text-ink hover:bg-white",
    light: "bg-pine text-cream shadow-lg shadow-pine/20 hover:bg-night",
  },
};

/**
 * Skewed (parallelogram) button. The shape leans via -skew-x-12 while the label is
 * counter-skewed so text stays upright. Hover: a small slide right plus a light sweep.
 * Renders an <a> when `href` is given, otherwise a <button>.
 */
export function SkewButton(props: AsLink | AsButton) {
  const { variant = "primary", tone = "dark", size = "md", shine = false, icon, className, children, ...rest } = props;

  const classes = cn(base, sizes[size], variants[variant][tone], className);

  const inner = (
    <>
      {/* Light sweep on hover (skipped under reduced motion) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 transition-[left,opacity] duration-700 ease-out group-hover/skew:left-[120%] group-hover/skew:opacity-100 motion-reduce:hidden"
      />
      {shine && (
        <ShineBorder
          borderWidth={1.5}
          duration={8}
          shineColor={variant === "primary" ? ["#fff6e6", "#d08a3c", "#fff6e6"] : ["#d08a3c", "#f6f1e7", "#d08a3c"]}
        />
      )}
      <span className="inline-flex skew-x-12 items-center justify-center gap-2.5">
        {icon}
        {children}
      </span>
    </>
  );

  if (rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {inner}
      </a>
    );
  }
  const { type = "button", ...buttonRest } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} {...buttonRest}>
      {inner}
    </button>
  );
}
