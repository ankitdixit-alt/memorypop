import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf5] text-[#241812]">
      <Navbar />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium shadow-sm">
            🎂 Birthday-first, made for every celebration
          </p>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Make every celebration unforgettable.
          </h1>

          <p className="mt-6 text-lg leading-8 text-[#6b5b52]">
            Create beautiful digital memory pages with photos, videos, voice
            notes and AI-crafted messages for birthdays, weddings,
            anniversaries, babies, graduations, farewells and every milestone
            worth celebrating.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/create"
              className="rounded-full bg-[#ff6b4a] px-7 py-4 text-center font-semibold text-white shadow-lg transition hover:scale-105"
            >
              Start a MemoryPop
            </Link>

            <Link
              href="/create"
              className="rounded-full border border-[#e8d8cc] bg-white px-7 py-4 text-center font-semibold transition hover:bg-gray-50"
            >
              View Demo
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-2xl">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-[#ffe1d6] via-[#fff3c7] to-[#e5d4ff] p-8">
            <p className="text-sm font-semibold">A MemoryPop for</p>

            <h2 className="mt-2 text-4xl font-bold">
              Aarav’s Birthday 🎉
            </h2>

            <p className="mt-6 text-[#6b5b52]">
              "You make every room brighter. Here are some memories from the
              people who love you most."
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="h-28 rounded-2xl bg-white/70" />
              <div className="h-28 rounded-2xl bg-white/70" />
              <div className="h-28 rounded-2xl bg-white/70" />
            </div>

            <Link
              href="/create"
              className="mt-8 block w-full rounded-full bg-[#241812] py-4 text-center font-semibold text-white transition hover:opacity-90"
            >
              Start Creating
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold">
          For every moment that matters
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[
            "🎂 Birthday",
            "❤️ Anniversary",
            "💍 Wedding",
            "👶 New Baby",
            "🎓 Graduation",
            "👋 Farewell",
            "🎄 Christmas",
            "✨ Just Because",
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-[#f0ded2] bg-white p-6 font-semibold shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}