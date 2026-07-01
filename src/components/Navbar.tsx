import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-2xl font-bold">
        Memory<span className="text-[#FF6B57]">Pop</span>
      </Link>

      <div className="hidden gap-8 md:flex">
        <a href="#">Templates</a>
        <a href="#">Examples</a>
        <a href="#">Pricing</a>
      </div>

      <Link
        href="/create"
        className="rounded-full bg-[#FF6B57] px-5 py-3 text-sm font-semibold text-white transition hover:scale-105"
      >
        Start a MemoryPop
      </Link>
    </nav>
  );
}