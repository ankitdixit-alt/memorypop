"use client";

import Link from "next/link";

export default function PlusPage() {
  const features = {
    availableToday: [
      {
        icon: "📸",
        title: "Unlimited Photos",
        description: "Add as many photos as you want. No limits for milestone celebrations.",
      },
      {
        icon: "⚡",
        title: "Priority Support",
        description: "Get help faster when you need it. Direct access to our support team.",
      },
      {
        icon: "✨",
        title: "Founding Member Badge",
        description: "Show your support as one of our earliest members. Exclusive badge.",
      },
    ],
    comingSoon: [
      { icon: "🤖", title: "AI Celebration Story", desc: "AI-generated narrative from all memories" },
      { icon: "🎨", title: "Premium Themes", desc: "Beautiful designs for every occasion" },
      { icon: "⏰", title: "Scheduled Reveal", desc: "Set exact reveal date and time" },
      { icon: "📄", title: "PDF Keepsake", desc: "Download and print your celebration" },
      { icon: "🔗", title: "Custom URL", desc: "Personalized link for your celebration" },
      { icon: "🎤", title: "Voice Notes", desc: "Add audio messages to memories" },
      { icon: "🎥", title: "Video Memories", desc: "Upload video clips alongside photos" },
    ],
  };

  const faqs = [
    {
      question: "Is this a one-time payment or subscription?",
      answer: "One-time payment per MemoryPop. No recurring charges. You only pay once to upgrade a specific celebration to Plus.",
    },
    {
      question: "What is the founding member price?",
      answer: "€4.99 is our special founding member price (33% off the future €7.99 price). This discount rewards our earliest supporters who believe in MemoryPop.",
    },
    {
      question: "Will I get the future features?",
      answer: "Yes! All features marked \"Included as They Launch\" will be automatically available to you at no extra cost. Your one-time payment covers all future Plus features.",
    },
    {
      question: "Can I still use MemoryPop for free?",
      answer: "Absolutely! MemoryPop's core experience remains free. Plus is an optional upgrade for users who want unlimited photos and premium features.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fff8ef] px-6 py-12 text-[#3a241e]">
      <div className="mx-auto max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1e6] px-4 py-2 mb-4">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-bold text-[#ef6a57]">FOUNDING MEMBER PRICE</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">MemoryPop Plus</h1>

          <p className="text-xl text-[#856b5f] max-w-2xl mx-auto">
            Upgrade your celebration with unlimited photos, premium features, and support the future of MemoryPop.
          </p>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg mb-16 border-2 border-[#FFD700]">
          <div className="text-center">
            <p className="text-[#856b5f] mb-2">One-time payment per MemoryPop</p>
            <div className="flex items-baseline justify-center gap-2 mb-4">
              <span className="text-5xl font-bold text-[#3a241e]">€4.99</span>
              <span className="text-[#856b5f] line-through">€7.99</span>
            </div>
            <p className="text-sm font-bold text-[#ef6a57] mb-6">33% off for founding members</p>

            <p className="text-xs text-[#856b5f] mt-4 mb-6">
              To upgrade, create your MemoryPop first, then upgrade from the dashboard
            </p>

            <Link
              href="/"
              className="inline-block w-full rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47]"
            >
              Create Your MemoryPop
            </Link>

            <p className="text-xs text-[#856b5f] mt-4">Secure payment powered by Stripe</p>
          </div>
        </div>

        {/* Available Today Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Available Today ✅</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {features.availableToday.map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[#856b5f]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Included as They Launch 🔜</h2>
          <p className="text-center text-[#856b5f] mb-8 max-w-2xl mx-auto">
            These features are in development and will be automatically included in your Plus upgrade at no extra cost.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {features.comingSoon.map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-4">
                <div className="text-3xl">{feature.icon}</div>
                <div>
                  <h4 className="font-bold mb-1">{feature.title}</h4>
                  <p className="text-sm text-[#856b5f]">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-[#fff8ef] to-[#fff1e6] rounded-3xl p-8 md:p-12 text-center border-2 border-[#FFD700] mb-16">
          <div className="text-5xl mb-4">❤️</div>
          <h2 className="text-3xl font-bold mb-4">Support the Future of MemoryPop</h2>
          <p className="text-[#856b5f] mb-6 max-w-2xl mx-auto">
            Your upgrade helps us build the features that make celebrations more meaningful. Thank you for being one of our founding members.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-[#ef6a57] px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#e05a47]"
          >
            Create Your MemoryPop
          </Link>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq) => (
              <details key={faq.question} className="bg-white rounded-xl p-6 shadow-sm">
                <summary className="font-bold cursor-pointer">{faq.question}</summary>
                <p className="mt-3 text-[#856b5f]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
