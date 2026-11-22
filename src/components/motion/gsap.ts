"use client"

import { gsap } from "gsap"
import { Flip } from "gsap/Flip"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP)
	gsap.defaults({ ease: "expo.out", duration: 1 })
}

export const prefersReducedMotion = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches

export { gsap, Flip, ScrollTrigger, SplitText, useGSAP }
