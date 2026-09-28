import * as React from "react";
import { ArrowRight } from "lucide-react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { site } from "@/lib/site";
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
  "transition-[background-color,color,border-color,box-shadow,transform] duration-250 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.98] " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-apricot motion-reduce:transition-none";

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-[0.7rem]",
  md: "min-h-12 px-6 text-[0.75rem]",
  lg: "min-h-14 px-8 text-[0.8rem]",
};

// Background and text change together in one short transition, so the label is never
// half-over the old colour (the earlier left-to-right sweep left a lagging sliver).
const variants: Record<Variant, Record<Tone, string>> = {
  primary: {
    dark: "bg-apricot text-apricot-ink shadow-lg shadow-apricot/20 hover:bg-apricot-bright hover:shadow-apricot/35",
    light: "bg-apricot text-apricot-ink shadow-lg shadow-apricot/20 hover:bg-apricot-bright hover:shadow-apricot/35",
  },
  outline: {
    dark: "border border-cream/45 text-cream hover:border-cream hover:bg-cream hover:text-ink",
    light: "border border-pine/45 text-pine hover:border-pine hover:bg-pine hover:text-cream",
  },
  solid: {
    dark: "bg-cream text-ink hover:bg-white",
    light: "bg-pine text-cream shadow-lg shadow-pine/20 hover:bg-night",
  },
};

/**
 * The site's call-to-action button. Clean rectangle with small radius and spaced capitals;
 * on hover the colours change together, the button lifts 1px and the arrow nudges forward.
 * Renders an <a> when `href` is given, otherwise a <button>.
 */
export function CtaButton(props: AsLink | AsButton) {
  const { variant = "primary", tone = "dark", size = "md", shine = false, icon, arrow = false, className, children, ...rest } = props;
  const classes = cn(base, sizes[size], variants[variant][tone], className);

  const inner = (
    <>
      {shine && (
        <ShineBorder
          borderWidth={1.5}
          duration={8}
          shineColor={variant === "primary" ? [site.colors.shine, site.colors.apricot, site.colors.shine] : [site.colors.apricot, site.colors.cream, site.colors.apricot]}
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
