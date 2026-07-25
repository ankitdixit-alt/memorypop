import { getCoverHeroStyle } from '@/lib/coverStyles';
import { getCoverTheme } from '@/lib/coverTheme';

export default function FarewellCoverMockup() {
  const coverStyle = 'grateful';
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
        <div className="text-8xl mb-8">✨</div>

        {/* Main Heading */}
        <h1
          className="text-6xl font-bold text-center mb-6"
          style={{ color: theme.primaryText }}
        >
          We'll Miss You, Alex
        </h1>

        {/* Stats Row */}
        <div className="flex gap-8 text-center">
          <div>
            <div
              className="text-4xl font-bold"
              style={{ color: theme.primaryText }}
            >
              24
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
              58
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
              94
            </div>
            <div
              className="text-lg mt-1"
              style={{ color: theme.secondaryText }}
            >
              Photos
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p
          className="text-xl mt-8 text-center max-w-2xl"
          style={{ color: theme.secondaryText }}
        >
          Friends and colleagues sharing memories before the next chapter begins
        </p>
      </div>
    </div>
  );
}
