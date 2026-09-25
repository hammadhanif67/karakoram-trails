"use client"

// Magic UI "number-ticker" from https://magicui.design/r/number-ticker.json, unmodified except the framer-motion import; the spring is lighter (counts in ~2.5 s) and snaps to the exact value at the end.
import { useEffect, useRef, type ComponentPropsWithoutRef } from "react"
import { useInView, useMotionValue, useSpring } from "framer-motion"

import { cn } from "@/lib/utils"

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number
  startValue?: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
}

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : startValue)
  const springValue = useSpring(motionValue, {
    // Lighter than Magic UI's default (damping 60), which took 5+ seconds to reach large values.
    damping: 30,
    stiffness: 90,
    // Settle once within half of the last shown digit instead of crawling the last fraction.
    restDelta: 0.5 * 10 ** -decimalPlaces,
    restSpeed: 10 ** -decimalPlaces,
  })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null

    if (isInView) {
      timer = setTimeout(() => {
        motionValue.set(direction === "down" ? startValue : value)
      }, delay * 1000)
    }

    return () => {
      if (timer !== null) {
        clearTimeout(timer)
      }
    }
  }, [motionValue, isInView, delay, value, direction, startValue])

  useEffect(() => {
    const format = (n: number) =>
      Intl.NumberFormat("en-US", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      }).format(Number(n.toFixed(decimalPlaces)))
    const halfStep = 0.5 * 10 ** -decimalPlaces
    return springValue.on("change", (latest) => {
      if (!ref.current) return
      // Land exactly on the target instead of stopping a hair short (e.g. 4,799 for 4,800).
      const target = motionValue.get()
      ref.current.textContent = format(Math.abs(target - latest) < halfStep * 2 ? target : latest)
    })
  }, [springValue, motionValue, decimalPlaces])

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block tracking-wider text-black tabular-nums dark:text-white",
        className
      )}
      {...props}
    >
      {startValue}
    </span>
  )
}
