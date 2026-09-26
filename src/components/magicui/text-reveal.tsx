"use client"

// Magic UI "text-reveal" from https://magicui.design/r/text-reveal.json, unmodified except the framer-motion import; colours follow the parent text colour instead of black/white; one copy per word plus an sr-only sentence for accessibility.
import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react"
import { motion, MotionValue, useScroll, useTransform } from "framer-motion"

import { cn } from "@/lib/utils"

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
}

export const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
  })

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string")
  }

  const words = children.split(" ")

  return (
    <div ref={sectionRef} className={cn("relative z-0 h-[200vh]", className)}>
      <div
        className={
          "sticky top-0 mx-auto flex h-[50%] max-w-4xl items-center bg-transparent px-4 py-20"
        }
      >
        {/* Read once by assistive tech; the animated words below are decorative */}
        <span className="sr-only">{children}</span>
        <span
          aria-hidden
          className={
            "flex flex-wrap p-5 text-2xl font-bold md:p-8 md:text-3xl lg:p-10 lg:text-4xl xl:text-5xl"
          }
        >
          {words.map((word, i) => {
            const start = i / words.length
            const end = start + 1 / words.length
            return (
              <Word key={i} progress={scrollYProgress} range={[start, end]}>
                {word}
              </Word>
            )
          })}
        </span>
      </div>
    </div>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
}

const DIM = 0.3

const Word: FC<WordProps> = ({ children, progress, range }) => {
  // One copy per word (dim -> full) instead of a dim copy stacked under a fading one, so the HTML has
  // no duplicated words. The full 0..1 input range is spelled out: framer maps scroll-linked opacity
  // onto the native ScrollTimeline, where a partial range reverses after its last stop.
  const [start, end] = range
  const input = [0, start, end, 1].filter((v, i, a) => i === 0 || v > a[i - 1])
  const output = input.map((v) => (v <= start ? DIM : 1))
  const opacity = useTransform(progress, input, output)
  return (
    <motion.span style={{ opacity }} className="relative mx-1 text-current lg:mx-1.5">
      {children}
    </motion.span>
  )
}
