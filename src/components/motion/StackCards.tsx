"use client"

import { Children, useRef, type ReactNode } from "react"
import { gsap, useGSAP } from "./gsap"

/**
 * Cartões sticky que se empilham ao descer; os de trás encolhem e escurecem.
 * Cada filho deve ter fundo opaco.
 */
export default function StackCards({ children, offset = 7 }: { children: ReactNode; offset?: number }) {
	const root = useRef<HTMLDivElement>(null)
	const items = Children.toArray(children)

	useGSAP(
		() => {
			const mm = gsap.matchMedia()
			mm.add("(prefers-reduced-motion: no-preference)", () => {
				const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]")
				cards.forEach((card, i) => {
					if (i === cards.length - 1) return
					gsap.to(card, {
						scale: 0.9 + i * 0.02,
						filter: "brightness(0.75)",
						ease: "none",
						scrollTrigger: { trigger: cards[i + 1], start: "top 85%", end: "top 30%", scrub: true },
					})
				})
			})
			return () => mm.revert()
		},
		{ scope: root }
	)

	return (
		<div ref={root} className="flex flex-col gap-6">
			{items.map((child, i) => (
				<div key={i} data-stack-card className="sticky origin-top" style={{ top: `${offset + i * 1.5}rem` }}>
					{child}
				</div>
			))}
		</div>
	)
}
