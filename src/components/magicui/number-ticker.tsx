"use client"

// Magic UI "number-ticker" from https://magicui.design/r/number-ticker.json, adapted:
// - framer-motion import;
// - the static HTML contains the FINAL value, so crawlers, link previews and no-JS visitors see the
//   real number; after hydration, a ticker that is still below the fold is reset to `startValue` and
//   counts up when it scrolls into view (one already on screen at load keeps its final value);
// - prefers-reduced-motion keeps the final value and never animates;
// - a fixed-length ease-out tween instead of the spring, which could take 5+ s or stop a digit short.
import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { animate, useInView } from "framer-motion"

import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
  /** Seconds. */
  duration?: number
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  duration = 2,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "0px" })
  // Decided once after hydration: animate only if the ticker starts off-screen and motion is allowed.
  const shouldAnimate = useRef<boolean | null>(null)

  const format = (n: number) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(n.toFixed(decimalPlaces)))

  const from = direction === "down" ? value : startValue
  const to = direction === "down" ? startValue : value

  useEffect(() => {
    const el = ref.current
    if (!el || shouldAnimate.current !== null) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const rect = el.getBoundingClientRect()
    const onScreen = rect.top < window.innerHeight && rect.bottom > 0
    shouldAnimate.current = !reduce && !onScreen
    if (shouldAnimate.current) el.textContent = format(from)
    // Runs once after hydration; format/from are stable for a given ticker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isInView || !shouldAnimate.current) return
    const controls = animate(from, to, {
      delay,
      duration,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo: fast start, gentle landing
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = format(latest)
      },
      onComplete: () => {
        if (ref.current) ref.current.textContent = format(to)
      },
    })
    return () => controls.stop()
    // format depends only on decimalPlaces
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, from, to, delay, duration, decimalPlaces])

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tracking-wider text-black tabular-nums dark:text-white",
        className
      )}
      {...props}
    >
      {format(to)}
    </span>
  )
}
