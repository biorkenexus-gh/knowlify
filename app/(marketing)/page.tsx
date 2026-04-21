import Link from "next/link";
import { BookOpen, Coins, GraduationCap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SITE } from "@/lib/constants";

const features = [
  {
    title: "Read & study",
    body: "Books, articles, and video lessons across every category that matters to you.",
    icon: BookOpen,
  },
  {
    title: "Quiz yourself",
    body: "Timed multiple-choice quizzes with instant, auto-graded feedback.",
    icon: GraduationCap,
  },
  {
    title: "Earn as you learn",
    body: "Points for every lesson and quiz — level up, climb the board, redeem rewards.",
    icon: Coins,
  },
  {
    title: "Leaderboard",
    body: "See how you stack up against thousands of learners worldwide.",
    icon: Trophy,
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="container flex flex-col items-center gap-6 py-24 text-center">
        <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          {SITE.tagline}
        </div>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          The learning platform that rewards progress, not perfection.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          {SITE.description}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/signup">Start learning free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>
      </section>

      <section className="container pb-24">
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

      <section className="border-t bg-muted/30 py-20">
        <div className="container flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold">Built for every kind of learner</h2>
          <p className="max-w-xl text-muted-foreground">
            Students, teachers, parents, business owners, pastors — if you
            want to grow, Knowlify is for you.
          </p>
          <Button asChild className="mt-4">
            <Link href="/signup">Create your free account</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
