import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Check the current operational status of MemoryPop services.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'System Status | MemoryPop',
    description: 'Check the current operational status of MemoryPop services.',
    url: '/status',
  },
};

export default function StatusPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <main className="min-h-screen bg-background px-6 py-12 text-foreground">
      <div className="mx-auto max-w-4xl">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">System Status</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Current operational status
          </p>
        </div>

        {/* Overall Status */}
        <div className="mt-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-semibold">All Systems Operational</h2>
        </div>

        {/* Service Status */}
        <div className="mt-12 space-y-4">
          <h3 className="text-xl font-semibold text-center">Service Status</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-card border border-border/60 p-4">
              <span className="font-medium">Website</span>
              <span className="text-green-600 dark:text-green-400">✅ Operational</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-card border border-border/60 p-4">
              <span className="font-medium">Memory Creation</span>
              <span className="text-green-600 dark:text-green-400">✅ Operational</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-card border border-border/60 p-4">
              <span className="font-medium">Contributor Access</span>
              <span className="text-green-600 dark:text-green-400">✅ Operational</span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-card border border-border/60 p-4">
              <span className="font-medium">Email Notifications</span>
              <span className="text-green-600 dark:text-green-400">✅ Operational</span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            <strong>Last updated:</strong> {currentDate}
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Experiencing issues? Contact us at{' '}
            <a
              href="mailto:support@memorypop.com"
              className="underline hover:text-foreground"
            >
              support@memorypop.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
