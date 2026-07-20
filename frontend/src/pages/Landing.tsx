import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useMotionValue, useTransform, useSpring } from "motion/react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { ArrowRight, Waves, GitBranch, Zap, Users, MousePointerClick, ListChecks, Rocket } from "lucide-react"
import { useLenis } from "@/hooks/useLenis"

gsap.registerPlugin(ScrollTrigger)

const FLOW_STAGES = [
  { key: "todo", label: "To do", color: "var(--color-paper-dim)" },
  { key: "progress", label: "In progress", color: "var(--color-progress)" },
  { key: "done", label: "Done", color: "var(--color-done)" },
]

const FEATURES = [
  {
    icon: GitBranch,
    title: "Branch-aware boards",
    body: "Tasks link straight to the PR that closes them, so status updates itself as work ships.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    body: "Keyboard-first everywhere. Create, assign, and move a task without touching the mouse.",
  },
  {
    icon: Users,
    title: "Made for teams",
    body: "See exactly who's holding what, and where things are actually stuck — not just what's overdue.",
  },
]

const STEPS = [
  { icon: MousePointerClick, title: "Drop in a task", body: "Type a title, set a priority — it lands in To do instantly." },
  { icon: ListChecks, title: "Move it as it moves", body: "Drag it forward, tick it off, or link it to the PR that closes it." },
  { icon: Rocket, title: "Watch the board stay honest", body: "No status meeting required — the board already tells the story." },
]

const MARQUEE_WORDS = ["To do", "In progress", "Done", "Shipped", "Reviewed", "Merged", "Blocked", "Backlog"]

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 25 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 25 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      data-feature
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="clay clay-hover bg-ink-raised p-6"
    >
      {children}
    </motion.div>
  )
}

export default function Landing() {
  useLenis()
  const heroRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const nodesRef = useRef<(HTMLDivElement | null)[]>([])
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const blobRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const glowX = useMotionValue(50)
  const glowY = useMotionValue(30)

  function handleHeroMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    glowX.set(((e.clientX - rect.left) / rect.width) * 100)
    glowY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const ctx = gsap.context(() => {
      // --- Scroll progress bar ---
      if (progressRef.current) {
        gsap.to(progressRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
        })
      }

      // --- Headline reveal: word-by-word rise on load ---
      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll("[data-word]")
        gsap.from(words, {
          opacity: 0,
          y: prefersReducedMotion ? 0 : 28,
          rotateX: prefersReducedMotion ? 0 : -40,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.15,
        })
      }

      // --- Ambient clay blobs drift slowly, parallax on scroll ---
      if (blobRef.current && !prefersReducedMotion) {
        const blobs = blobRef.current.querySelectorAll("[data-blob]")
        blobs.forEach((blob, i) => {
          gsap.to(blob, {
            y: i % 2 === 0 ? -40 : 40,
            x: i % 2 === 0 ? 30 : -30,
            duration: 7 + i,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })
          gsap.to(blob, {
            y: `+=${100 + i * 30}`,
            ease: "none",
            scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
          })
        })
      }

      // --- Flow-line hero: path draws in, nodes pulse along it ---
      if (pathRef.current && !prefersReducedMotion) {
        const length = pathRef.current.getTotalLength()
        gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: "power2.inOut",
          delay: 0.5,
        })

        nodesRef.current.forEach((node, i) => {
          if (!node) return
          gsap.from(node, {
            opacity: 0,
            scale: 0.4,
            duration: 0.5,
            delay: 0.7 + i * 0.35,
            ease: "back.out(2.4)",
          })
        })
      } else {
        nodesRef.current.forEach((node) => node && gsap.set(node, { opacity: 1, scale: 1 }))
      }

      // --- Feature cards: staggered scroll reveal ---
      if (featuresRef.current) {
        const cards = featuresRef.current.querySelectorAll("[data-feature]")
        gsap.from(cards, {
          opacity: 0,
          y: prefersReducedMotion ? 0 : 32,
          duration: 0.6,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: featuresRef.current, start: "top 75%" },
        })
      }

      // --- Steps: sequential draw with connecting line ---
      if (stepsRef.current) {
        const items = stepsRef.current.querySelectorAll("[data-step]")
        gsap.from(items, {
          opacity: 0,
          scale: 0.85,
          y: prefersReducedMotion ? 0 : 24,
          duration: 0.5,
          stagger: 0.2,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: stepsRef.current, start: "top 70%" },
        })
      }
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={heroRef} className="relative overflow-hidden bg-ink text-paper">
      {/* Scroll progress bar */}
      <div
        ref={progressRef}
        className="fixed left-0 top-0 z-50 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-flow via-clay-sky to-clay-peach"
      />

      {/* Ambient clay blobs */}
      <div ref={blobRef} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div data-blob className="blob-morph absolute -left-24 top-10 h-80 w-80 bg-flow/25 blur-3xl" />
        <div data-blob className="blob-morph absolute right-0 top-40 h-96 w-96 bg-clay-sky/25 blur-3xl" style={{ animationDelay: "2s" }} />
        <div data-blob className="blob-morph absolute left-1/3 top-[38rem] h-72 w-72 bg-clay-peach/25 blur-3xl" style={{ animationDelay: "4s" }} />
        <div data-blob className="blob-morph absolute right-10 top-[70rem] h-64 w-64 bg-done/20 blur-3xl" style={{ animationDelay: "1s" }} />
      </div>

      {/* Nav */}
      <header className="sticky top-4 z-40 px-4">
        <div className="clay mx-auto flex h-16 max-w-6xl items-center justify-between bg-ink-raised px-6">
          <div className="flex items-center gap-2">
            <span className="clay-sm flex h-8 w-8 items-center justify-center bg-flow">
              <Waves className="h-4 w-4 text-ink-raised" />
            </span>
            <span className="font-display text-sm font-medium">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm text-paper-dim transition-colors hover:text-paper">
              Sign in
            </Link>
            <Link to="/register" className="clay-sm clay-hover clay-press bg-flow px-4 py-2 text-sm font-medium text-ink-raised">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        onMouseMove={handleHeroMouseMove}
        className="relative px-6 pt-20 pb-32 sm:pt-28"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([lx, ly]: number[]) =>
                `radial-gradient(600px circle at ${lx}% ${ly}%, color-mix(in srgb, var(--color-flow) 14%, transparent), transparent 60%)`
            ),
          }}
        />

        <div className="mx-auto max-w-4xl text-center">
          <span className="clay-sm mx-auto mb-6 inline-flex items-center gap-2 bg-ink-raised px-4 py-1.5 text-xs font-medium text-paper-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-done" />
            Built by a 3-person team, in the open
          </span>
          <h1
            ref={headlineRef}
            style={{ perspective: 600 }}
            className="font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl"
          >
            <span data-word className="inline-block">Work</span>{" "}
            <span data-word className="inline-block">that</span>{" "}
            <span data-word className="gradient-text inline-block">moves</span>{" "}
            <span data-word className="inline-block">as</span>{" "}
            <span data-word className="inline-block">fast</span>
            <br />
            <span data-word className="inline-block">as</span>{" "}
            <span data-word className="inline-block">your</span>{" "}
            <span data-word className="inline-block">team</span>{" "}
            <span data-word className="inline-block">does.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-paper-dim sm:text-lg">
            TaskFlow tracks every task as it moves from idea to done —
            no stale boards, no status meetings, just a board that stays honest.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="group clay-sm clay-hover clay-press flex items-center gap-2 bg-flow px-5 py-2.5 text-sm font-medium text-ink-raised"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/login" className="clay-sm clay-hover clay-press bg-ink-raised px-5 py-2.5 text-sm font-medium text-paper">
              Sign in
            </Link>
          </div>
        </div>

        {/* Signature flow-line animation */}
        <div className="relative mx-auto mt-20 max-w-3xl">
          <svg viewBox="0 0 720 160" className="w-full" role="img" aria-label="Diagram showing a task moving through to-do, in-progress, and done stages">
            <path
              ref={pathRef}
              d="M 60 120 C 200 120, 220 40, 360 40 C 500 40, 520 120, 660 120"
              fill="none"
              stroke="var(--color-ink-line)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-6 sm:px-10">
            {FLOW_STAGES.map((stage, i) => (
              <div
                key={stage.key}
                ref={(el) => { nodesRef.current[i] = el }}
                className="flex flex-col items-center gap-2"
                style={{ marginTop: i === 1 ? "-4.5rem" : "0.5rem" }}
              >
                <div className="clay-sm flex h-8 w-8 items-center justify-center" style={{ backgroundColor: stage.color }}>
                  <div className="h-2.5 w-2.5 rounded-full bg-ink-raised/80" />
                </div>
                <span className="font-mono text-xs text-paper-dim">{stage.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div className="clay-inset overflow-hidden bg-ink-raised/40 py-4">
        <div className="marquee-track">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
            <span key={i} className="mx-4 shrink-0 font-mono text-sm text-paper-dim/70">
              {word} <span className="ml-4 text-clay-sky">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section ref={featuresRef} className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-xl">
            <h2 className="font-display text-2xl font-medium sm:text-3xl">Everything a small team actually needs.</h2>
            <p className="mt-3 text-paper-dim">
              No workflow automation you'll never configure. No permissions matrix.
              Just a board your team will actually keep updated.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <TiltCard key={feature.title}>
                <span className="clay-sm flex h-10 w-10 items-center justify-center bg-flow/15">
                  <feature.icon className="h-5 w-5 text-flow" />
                </span>
                <h3 className="mt-4 font-display text-base font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm text-paper-dim">{feature.body}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section ref={stepsRef} className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-xl">
            <h2 className="font-display text-2xl font-medium sm:text-3xl">Three steps. That's the whole workflow.</h2>
          </div>
          <div className="relative grid gap-6 sm:grid-cols-3">
            <div className="absolute left-0 right-0 top-8 hidden h-0.5 bg-ink-line sm:block" aria-hidden />
            {STEPS.map((step, i) => (
              <div key={step.title} data-step className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="clay relative z-10 flex h-16 w-16 items-center justify-center bg-ink-raised">
                  <step.icon className="h-6 w-6 text-flow" />
                </span>
                <span className="mt-4 font-mono text-xs text-paper-dim">Step {i + 1}</span>
                <h3 className="mt-1 font-display text-base font-medium">{step.title}</h3>
                <p className="mt-2 text-sm text-paper-dim">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <div className="clay-lg relative mx-auto max-w-2xl overflow-hidden bg-ink-raised px-8 py-16">
          <div className="blob-morph pointer-events-none absolute -right-10 -top-10 h-40 w-40 bg-clay-peach/30 blur-2xl" aria-hidden />
          <h2 className="font-display text-2xl font-medium sm:text-3xl">Set up your board in under a minute.</h2>
          <Link
            to="/register"
            className="clay-sm clay-hover clay-press mt-6 inline-flex items-center gap-2 bg-flow px-5 py-2.5 text-sm font-medium text-ink-raised"
          >
            Create your workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-paper-dim">
          <span>TaskFlow</span>
          <span>Built for teams that ship.</span>
        </div>
      </footer>
    </div>
  )
}
