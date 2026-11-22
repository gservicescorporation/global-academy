"use client"

import { Children, useRef, type ReactNode } from "react"
import { gsap, useGSAP } from "./gsap"

/**
 * Desktop (≥1024px, com movimento): a secção fica fixa e os itens deslizam na horizontal com o scroll.
 * Mobile/tablet: os itens empilham-se em cartões sticky.
 * Nenhum antepassado pode ter overflow-hidden (quebra o sticky); usar overflow-clip.
 */
export default function HorizontalPin({
	intro,
	outro,
	children,
	className = "",
}: {
	intro: ReactNode
	outro?: ReactNode
	children: ReactNode
	className?: string
}) {
	const section = useRef<HTMLElement>(null)
	const track = useRef<HTMLDivElement>(null)
	const items = Children.toArray(children)

	useGSAP(
		() => {
			const mm = gsap.matchMedia()
			mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
				const el = track.current
				if (!el) return
				const distance = () => Math.max(0, el.scrollWidth - window.innerWidth)
				const tween = gsap.to(el, {
					x: () => -distance(),
					ease: "none",
					scrollTrigger: {
						trigger: section.current,
						start: "top top",
						end: () => `+=${distance()}`,
						pin: true,
						scrub: 1,
						invalidateOnRefresh: true,
						anticipatePin: 1,
					},
				})
				// Barra de progresso ligada ao mesmo scroll.
				gsap.fromTo(
					"[data-hpin-progress]",
					{ scaleX: 0 },
					{ scaleX: 1, ease: "none", scrollTrigger: { trigger: section.current, start: "top top", end: () => `+=${distance()}`, scrub: true } }
				)
				return () => tween.kill()
			})
			return () => mm.revert()
		},
		{ scope: section }
	)

	return (
		<section ref={section} className={`relative overflow-clip ${className}`}>
			<div className="lg:flex lg:h-[100svh] lg:flex-col lg:justify-center">
				<div ref={track} className="container-x lg:flex lg:w-max lg:max-w-none lg:items-stretch lg:gap-8 lg:pr-[var(--gutter)]">
					<div className="lg:flex lg:w-[min(36rem,40vw)] lg:shrink-0 lg:flex-col lg:justify-center lg:pr-8">{intro}</div>
					<ul className="mt-12 flex flex-col gap-6 lg:mt-0 lg:flex-row lg:gap-8">
						{items.map((child, i) => (
							<li
								key={i}
								className="sticky lg:static lg:w-[min(27rem,32vw)] lg:shrink-0"
								style={{ top: `${6 + i * 1.25}rem` }}
							>
								{child}
							</li>
						))}
						{outro && <li className="lg:flex lg:w-[min(24rem,28vw)] lg:shrink-0 lg:items-center">{outro}</li>}
					</ul>
				</div>
				<div className="container-x mt-10 hidden lg:block" aria-hidden>
					<div className="h-px w-full bg-current/15">
						<div data-hpin-progress className="h-px origin-left scale-x-0 bg-accent" />
					</div>
				</div>
			</div>
		</section>
	)
}
