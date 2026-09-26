"use client"

// Magic UI "number-ticker" from https://magicui.design/r/number-ticker.json, adapted: framer-motion
// import, and a fixed-length ease-out tween instead of the spring. The spring's settle time depends on
// physics and frame rate (5+ s for large values on slow devices) and could stop a digit short
// (4,799 for 4,800); the tween always finishes on time and on the exact value.
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

  const format = (n: number) =>
    Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    }).format(Number(n.toFixed(decimalPlaces)))

  const from = direction === "down" ? value : startValue
  const to = direction === "down" ? startValue : value

  useEffect(() => {
    if (!isInView) return
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
      {format(from)}
    </span>
  )
}
