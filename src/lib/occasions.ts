/**
 * Occasion Intelligence v1
 *
 * Centralized occasion copy mapping utility that provides
 * occasion-specific messaging throughout the product.
 */

export interface CoverPreset {
  id: string;                       // Preset identifier (e.g., "confetti", "cake", "none")
  label: string;                    // Display label (e.g., "Confetti")
  description?: string;             // Optional description text
  gradient: string;                 // CSS gradient or color value
  pattern?: string;                 // Optional CSS pattern class name
}

export interface OccasionCopy {
  celebrationMessage: string;      // Main headline (e.g., "Happy Birthday {name}!")
  subMessage?: string;              // Optional secondary message (e.g., "We'll miss you.")
  emoji: string;                    // Occasion-appropriate emoji
  actionLabel?: string;             // Button text variations (e.g., "Add Your Birthday Memory")
  helperText?: string;              // Helper/description text
  progressLabel?: string;           // Progress indicator text (e.g., "Starting the celebration")
  emptyStateMessage?: string;       // Empty state copy
  sharePrompt?: string;             // Share invitation copy
  messageStarters?: string[];       // Message starter suggestions (3 per occasion)
  emojiShortcuts?: string[];        // Relevant emoji shortcuts (6-8 per occasion)
  coverPresets?: CoverPreset[];     // Cover style presets (3-4 per occasion)
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
    sharePrompt: "Share this birthday MemoryPop",
    messageStarters: [
      recipientName ? `Happy birthday ${recipientName}! You always make every day brighter.` : "Happy birthday! You always make every day brighter.",
      recipientName ? `${recipientName} has this incredible way of bringing joy to everyone around them.` : "You have this incredible way of bringing joy to everyone around you.",
      recipientName ? `Celebrating ${recipientName} today and all the amazing memories we've shared.` : "Celebrating you today and all the amazing memories we've shared."
    ],
    emojiShortcuts: ["❤️", "🎉", "🥳", "🎂", "😂", "🙌", "🎈", "💕"],
    coverPresets: [
      {
        id: "confetti",
        label: "Confetti",
        description: "Festive confetti celebration",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      {
        id: "cake",
        label: "Birthday Cake",
        description: "Sweet celebration",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      },
      {
        id: "balloons",
        label: "Balloons",
        description: "Colorful balloons",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        description: "Use my own photos or keep it simple",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
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
    sharePrompt: "Share this anniversary MemoryPop",
    messageStarters: [
      recipientName ? `Happy anniversary ${recipientName}! Your love story inspires everyone.` : "Happy anniversary! Your love story inspires everyone.",
      recipientName ? `${recipientName}, watching your journey together has been beautiful.` : "Watching your journey together has been beautiful.",
      "Celebrating the love and commitment you both share."
    ],
    emojiShortcuts: ["❤️", "💕", "💍", "🥂", "🎊", "💐", "✨", "💑"],
    coverPresets: [
      {
        id: "hearts",
        label: "Hearts",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      },
      {
        id: "romantic",
        label: "Romantic",
        gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
      },
      {
        id: "elegant",
        label: "Elegant",
        gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
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
    sharePrompt: "Share this wedding MemoryPop",
    messageStarters: [
      recipientName ? `Congratulations ${recipientName}! Wishing you a lifetime of love and happiness.` : "Congratulations! Wishing you a lifetime of love and happiness.",
      recipientName ? `${recipientName}, so excited to celebrate this beautiful new chapter with you.` : "So excited to celebrate this beautiful new chapter with you.",
      recipientName ? `To ${recipientName}: May your marriage be filled with joy and adventure.` : "May your marriage be filled with joy and adventure."
    ],
    emojiShortcuts: ["❤️", "💍", "🥂", "💐", "🎊", "👰", "✨", "💕"],
    coverPresets: [
      {
        id: "floral",
        label: "Floral",
        gradient: "linear-gradient(135deg, #fff1eb 0%, #ace0f9 100%)"
      },
      {
        id: "romantic",
        label: "Romantic",
        gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
      },
      {
        id: "elegant",
        label: "Elegant",
        gradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
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
    sharePrompt: "Share this MemoryPop",
    messageStarters: [
      "Welcome to the world! So excited to meet this little one.",
      "Congratulations on your beautiful new arrival!",
      "Can't wait to watch this precious baby grow."
    ],
    emojiShortcuts: ["👶", "🍼", "💕", "🎈", "🌟", "💙", "💗", "✨"],
    coverPresets: [
      {
        id: "soft",
        label: "Soft & Sweet",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
      },
      {
        id: "pastel",
        label: "Pastel",
        gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)"
      },
      {
        id: "gentle",
        label: "Gentle",
        gradient: "linear-gradient(135deg, #ffd3a5 0%, #fd6585 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
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
    sharePrompt: "Share this graduation MemoryPop",
    messageStarters: [
      "Congratulations graduate! So proud of all you've accomplished.",
      "This is just the beginning of amazing things ahead!",
      "Your hard work and dedication have truly paid off."
    ],
    emojiShortcuts: ["🎓", "🎉", "🌟", "📚", "🎊", "💪", "✨", "🏆"],
    coverPresets: [
      {
        id: "celebration",
        label: "Celebration",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      {
        id: "achievement",
        label: "Achievement",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      },
      {
        id: "future",
        label: "Bright Future",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
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
    sharePrompt: "Share this farewell MemoryPop",
    messageStarters: [
      recipientName ? `Thank you ${recipientName}! You've made such a positive impact.` : "Thank you! You've made such a positive impact.",
      recipientName ? `We'll miss ${recipientName} so much. Best wishes on your next adventure!` : "We'll miss you so much. Best wishes on your next adventure!",
      recipientName ? `${recipientName}'ll always be remembered for the joy you brought.` : "You'll always be remembered for the joy you brought."
    ],
    emojiShortcuts: ["❤️", "🥲", "🌟", "✨", "💕", "🫂", "🌈", "🙏"],
    coverPresets: [
      {
        id: "warm",
        label: "Warm",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
      },
      {
        id: "heartfelt",
        label: "Heartfelt",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      },
      {
        id: "grateful",
        label: "Grateful",
        gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
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
    sharePrompt: "Share this retirement MemoryPop",
    messageStarters: [
      "Congratulations on an incredible career! Enjoy this well-deserved new chapter.",
      "Thank you for years of dedication and inspiration.",
      "Wishing you an amazing retirement filled with joy and adventure."
    ],
    emojiShortcuts: ["🎉", "🌟", "🏖️", "✨", "🥳", "🎊", "💐", "🙌"],
    coverPresets: [
      {
        id: "celebration",
        label: "Celebration",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      {
        id: "journey",
        label: "New Journey",
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      },
      {
        id: "gratitude",
        label: "Gratitude",
        gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
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
