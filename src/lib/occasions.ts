/**
 * Occasion Intelligence v1
 *
 * Centralized occasion copy mapping utility that provides
 * occasion-specific messaging throughout the product.
 */

export interface OccasionCopy {
  celebrationMessage: string;      // Main headline (e.g., "Happy Birthday {name}!")
  subMessage?: string;              // Optional secondary message (e.g., "We'll miss you.")
  emoji: string;                    // Occasion-appropriate emoji
  actionLabel?: string;             // Button text variations (e.g., "Add Your Birthday Memory")
  helperText?: string;              // Helper/description text
  progressLabel?: string;           // Progress indicator text (e.g., "Starting the celebration")
  emptyStateMessage?: string;       // Empty state copy
  sharePrompt?: string;             // Share invitation copy
}

/**
 * Get occasion-specific copy for any celebration type
 *
 * @param occasion - The celebration type (e.g., "Birthday", "Farewell")
 * @param recipientName - Optional recipient name for personalization
 * @returns Complete copy object with all occasion-specific variations
 */
export function getOccasionCopy(
  occasion: string,
  recipientName?: string
): OccasionCopy {
  const normalizedOccasion = occasion.toLowerCase().trim();

  switch (normalizedOccasion) {
    case "birthday":
      return birthdayCopy(recipientName);

    case "anniversary":
      return anniversaryCopy(recipientName);

    case "wedding":
      return weddingCopy(recipientName);

    case "new baby":
      return newBabyCopy();

    case "graduation":
      return graduationCopy();

    case "farewell":
      return farewellCopy(recipientName);

    case "retirement":
      return retirementCopy();

    default:
      return defaultCopy(recipientName);
  }
}

// Occasion-specific copy functions

function birthdayCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Happy Birthday ${recipientName}!` : "Happy Birthday!",
    emoji: "🎂",
    actionLabel: "Add Your Birthday Memory",
    progressLabel: "Starting the birthday celebration",
    helperText: "Create one beautiful birthday celebration your loved one will never forget.",
    emptyStateMessage: "No birthday memories yet. Be the first to add one ❤️",
    sharePrompt: "Share this birthday MemoryPop"
  };
}

function anniversaryCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Happy Anniversary ${recipientName}!` : "Happy Anniversary!",
    emoji: "💕",
    actionLabel: "Add Your Anniversary Memory",
    progressLabel: "Starting the anniversary celebration",
    helperText: "Create one beautiful anniversary celebration your loved one will never forget.",
    emptyStateMessage: "No anniversary memories yet. Be the first to add one ❤️",
    sharePrompt: "Share this anniversary MemoryPop"
  };
}

function weddingCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Congratulations ${recipientName}!` : "Congratulations!",
    emoji: "💕",
    actionLabel: "Add Your Wedding Memory",
    progressLabel: "Starting the wedding celebration",
    helperText: "Create one beautiful wedding celebration your loved one will never forget.",
    emptyStateMessage: "No wedding memories yet. Be the first to add one ❤️",
    sharePrompt: "Share this wedding MemoryPop"
  };
}

function newBabyCopy(): OccasionCopy {
  return {
    celebrationMessage: "Welcome to the World",
    emoji: "👶",
    actionLabel: "Add Your Memory",
    progressLabel: "Starting the celebration",
    helperText: "Create one beautiful celebration for the new arrival.",
    emptyStateMessage: "No memories yet. Be the first to add one ❤️",
    sharePrompt: "Share this MemoryPop"
  };
}

function graduationCopy(): OccasionCopy {
  return {
    celebrationMessage: "Congratulations Graduate!",
    emoji: "🎓",
    actionLabel: "Add Your Graduation Memory",
    progressLabel: "Starting the graduation celebration",
    helperText: "Create one beautiful graduation celebration your loved one will never forget.",
    emptyStateMessage: "No graduation memories yet. Be the first to add one ❤️",
    sharePrompt: "Share this graduation MemoryPop"
  };
}

function farewellCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Thank You ${recipientName}` : "Thank You",
    subMessage: "We'll miss you.",
    emoji: "❤️",
    actionLabel: "Add Your Memory",
    progressLabel: "Starting the farewell celebration",
    helperText: "Create one beautiful farewell celebration they will never forget.",
    emptyStateMessage: "No memories yet. Be the first to add one ❤️",
    sharePrompt: "Share this farewell MemoryPop"
  };
}

function retirementCopy(): OccasionCopy {
  return {
    celebrationMessage: "Congratulations on an Incredible Career",
    emoji: "🎉",
    actionLabel: "Add Your Memory",
    progressLabel: "Starting the retirement celebration",
    helperText: "Create one beautiful retirement celebration they will never forget.",
    emptyStateMessage: "No retirement memories yet. Be the first to add one ❤️",
    sharePrompt: "Share this retirement MemoryPop"
  };
}

function defaultCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Celebrating ${recipientName}` : "Celebration",
    emoji: "❤️",
    actionLabel: "Add Your Memory",
    progressLabel: "Starting the celebration",
    helperText: "Create one beautiful celebration your loved one will never forget.",
    emptyStateMessage: "No memories yet. Be the first to add one ❤️",
    sharePrompt: "Share this MemoryPop"
  };
}
