import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code,
  Coins,
  FlaskConical,
  GraduationCap,
  Languages,
  Palette,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

const features = [
  {
    title: "Read & study",
    body: "Books, articles, and video lessons across every topic that matters to you.",
    icon: BookOpen,
  },
  {
    title: "Quiz yourself",
    body: "Timed multiple-choice quizzes with instant, auto-graded feedback.",
    icon: GraduationCap,
  },
  {
    title: "Earn as you learn",
    body: "Points for every lesson and passed quiz — level up, climb the board.",
    icon: Coins,
  },
  {
    title: "Global leaderboard",
    body: "See how you stack up against thousands of learners worldwide.",
    icon: Trophy,
  },
];

const categories = [
  { name: "Programming", icon: Code, color: "from-blue-500/20 to-cyan-500/20" },
  { name: "Design", icon: Palette, color: "from-pink-500/20 to-rose-500/20" },
  { name: "Business", icon: Briefcase, color: "from-amber-500/20 to-orange-500/20" },
  { name: "Languages", icon: Languages, color: "from-emerald-500/20 to-teal-500/20" },
  { name: "Science", icon: FlaskConical, color: "from-violet-500/20 to-purple-500/20" },
];

const howItWorks = [
  {
    step: "01",
    title: "Pick a course",
    body: "Browse curated content across five growing categories. Filter by format, time, or category.",
    icon: Target,
  },
  {
    step: "02",
    title: "Study at your pace",
    body: "PDF, video, or markdown — read, watch, or skim. Your progress syncs across devices.",
    icon: Timer,
  },
  {
    step: "03",
    title: "Prove it with quizzes",
    body: "Timed, auto-graded. Pass to earn bonus points that count toward the leaderboard.",
    icon: Award,
  },
];

const audiences = [
  "Students (college & university)",
  "Teachers & lecturers",
  "Parents guiding kids",
  "Business owners",
  "Pastors & religious educators",
  "Anyone who wants to grow",
];

const stats = [
  { value: "5", label: "Categories" },
  { value: "∞", label: "Growing library" },
  { value: "24/7", label: "Learn anywhere" },
  { value: "100%", label: "Auto-graded" },
];

export default function LandingPage() {
  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-x-0 -top-40 -z-10 mx-auto h-[36rem] max-w-4xl rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl"
        />
        <div className="container flex flex-col items-center gap-6 py-20 text-center md:py-28">
          <Badge variant="secondary" className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            {SITE.tagline}
          </Badge>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            The learning platform that{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              rewards progress
            </span>
            , not perfection.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
            {SITE.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">
                Start learning free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            No credit card required · Earn points on your first lesson
          </p>
        </div>
      </section>

      {/* ─── Stats strip ──────────────────────────────────────────── */}
      <section className="border-y bg-muted/30">
        <div className="container grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Everything you need to learn and level up
          </h2>
          <p className="mt-3 text-muted-foreground">
            Built from the ground up to make learning stick — and make progress
            visible.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle>{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {f.body}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────── */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Learn across five growing categories
            </h2>
            <p className="mt-3 text-muted-foreground">
              From code to commerce, design to the sciences — and we&apos;re
              adding more.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.name}
                href="/courses"
                className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`absolute inset-0 -z-10 bg-gradient-to-br ${c.color} opacity-0 transition-opacity group-hover:opacity-100`}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <c.icon className="h-6 w-6" />
                </div>
                <div className="font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">
            Three simple steps. No friction, no fluff.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {howItWorks.map((h) => (
            <div
              key={h.step}
              className="relative rounded-xl border bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-primary">
                  {h.step}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <h.icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-lg font-semibold">{h.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Built for every kind of learner ─────────────────────── */}
      <section className="border-y bg-muted/30 py-20">
        <div className="container grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">
              Built for every kind of learner
            </h2>
            <p className="mt-3 text-muted-foreground">
              Whether you&apos;re cramming for finals, upskilling on the side,
              or running a Sunday school class — Knowlify fits around your
              life, not the other way around.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/signup">Create your free account</Link>
            </Button>
          </div>
          <ul className="space-y-3 rounded-xl border bg-card p-6">
            {audiences.map((a) => (
              <li key={a} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Bottom CTA ───────────────────────────────────────────── */}
      <section className="container py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold md:text-4xl">
            Start earning on your first lesson
          </h2>
          <p className="mt-3 text-muted-foreground">
            It takes 30 seconds to create an account. Your first 10 points are
            waiting.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
