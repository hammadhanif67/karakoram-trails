import * as React from "react";
import { ArrowRight } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "solid";
type Tone = "dark" | "light";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  /** Background the button sits on; sets outline colours. */
  tone?: Tone;
  size?: Size;
  /** Adds Magic UI's animated Shine Border around the button. */
  shine?: boolean;
  /** Leading icon. */
  icon?: React.ReactNode;
  /** Trailing arrow that nudges forward on hover. */
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type AsLink = CommonProps & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & { href: string };
type AsButton = CommonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

const base =
  "group/cta relative isolate inline-flex cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-[4px] " +
  "text-center font-medium tracking-[0.14em] uppercase select-none " +
  "transition-[color,border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-apricot motion-reduce:transition-none";

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-[0.7rem]",
  md: "min-h-12 px-6 text-[0.75rem]",
  lg: "min-h-14 px-8 text-[0.8rem]",
};

// `fill` is the colour that sweeps in from the left on hover.
const variants: Record<Variant, Record<Tone, { idle: string; fill: string }>> = {
  primary: {
    dark: { idle: "bg-apricot text-apricot-ink shadow-lg shadow-apricot/20", fill: "bg-[#e3a45e]" },
    light: { idle: "bg-apricot text-apricot-ink shadow-lg shadow-apricot/20", fill: "bg-[#e3a45e]" },
  },
  outline: {
    dark: { idle: "border border-cream/45 text-cream hover:border-cream hover:text-ink", fill: "bg-cream" },
    light: { idle: "border border-pine/45 text-pine hover:border-pine hover:text-cream", fill: "bg-pine" },
  },
  solid: {
    dark: { idle: "bg-cream text-ink", fill: "bg-white" },
    light: { idle: "bg-pine text-cream shadow-lg shadow-pine/20", fill: "bg-night" },
  },
};

/**
 * The site's call-to-action button. Clean rectangle with small radius and spaced capitals;
 * on hover a fill sweeps in from the left and the arrow nudges forward.
 * Renders an <a> when `href` is given, otherwise a <button>.
 */
export function CtaButton(props: AsLink | AsButton) {
  const { variant = "primary", tone = "dark", size = "md", shine = false, icon, arrow = false, className, children, ...rest } = props;
  const v = variants[variant][tone];
  const classes = cn(base, sizes[size], v.idle, className);

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cta:scale-x-100 motion-reduce:transition-none",
          v.fill,
        )}
      />
      {shine && (
        <ShineBorder
          borderWidth={1.5}
          duration={8}
          shineColor={variant === "primary" ? ["#fff6e6", "#d08a3c", "#fff6e6"] : ["#d08a3c", "#f6f1e7", "#d08a3c"]}
        />
      )}
      {icon}
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden
          className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1 motion-reduce:transition-none"
        />
      )}
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
