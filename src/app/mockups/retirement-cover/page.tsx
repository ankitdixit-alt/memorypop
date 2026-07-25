import { getCoverHeroStyle } from '@/lib/coverStyles';
import { getCoverTheme } from '@/lib/coverTheme';

export default function RetirementCoverMockup() {
  const coverStyle = 'elegant';
  const theme = getCoverTheme(coverStyle);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: '16/10',
        maxWidth: '100vw',
        maxHeight: '100vh',
      }}
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-12 py-10"
        style={getCoverHeroStyle(coverStyle)}
      >
        {/* Emoji */}
        <div className="text-8xl mb-8">🎯</div>

        {/* Main Heading */}
        <h1
          className="text-5xl font-bold text-center mb-3"
          style={{ color: theme.primaryText }}
        >
          David's Retirement
        </h1>

        {/* Subtitle */}
        <p
          className="text-3xl text-center mb-8"
          style={{ color: theme.secondaryText }}
        >
          30 Years of Leadership & Impact
        </p>

        {/* Stats Row */}
        <div className="flex gap-8 text-center">
          <div>
            <div
              className="text-4xl font-bold"
              style={{ color: theme.primaryText }}
            >
              18
            </div>
            <div
              className="text-lg mt-1"
              style={{ color: theme.secondaryText }}
            >
              Contributors
            </div>
          </div>

          <div
            className="w-px self-stretch"
            style={{ backgroundColor: theme.secondaryText, opacity: 0.3 }}
          />

          <div>
            <div
              className="text-4xl font-bold"
              style={{ color: theme.primaryText }}
            >
              67
            </div>
            <div
              className="text-lg mt-1"
              style={{ color: theme.secondaryText }}
            >
              Memories
            </div>
          </div>

          <div
            className="w-px self-stretch"
            style={{ backgroundColor: theme.secondaryText, opacity: 0.3 }}
          />

          <div>
            <div
              className="text-4xl font-bold"
              style={{ color: theme.primaryText }}
            >
              120
            </div>
            <div
              className="text-lg mt-1"
              style={{ color: theme.secondaryText }}
            >
              Photos
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <p
          className="text-xl mt-8 text-center max-w-2xl"
          style={{ color: theme.secondaryText }}
        >
          Colleagues from across three decades share their gratitude
        </p>
      </div>
    </div>
  );
}
