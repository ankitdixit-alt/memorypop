/**
 * Occasion Intelligence v2
 *
 * Centralized occasion copy mapping utility that provides
 * occasion-specific messaging throughout the product.
 *
 * v2: Enhanced with celebration narratives, WhatsApp messaging,
 * success states, and form guidance across all 7 occasions.
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

  // v2 additions
  landingNarrative?: {              // Landing page 3-line narrative
    line1: string;
    line2: string;
    line3: string;
  };
  contributeNarrative?: {           // Contribute page 4-line narrative (enhanced v1)
    line1: string;
    line2: string;
    line3: string;
    line4: string;  // NEW: "why it matters"
  };
  contributeCTA?: string;           // Contribute button text
  whatsappMessage?: string;         // WhatsApp share message template
  revealWhatsappMessage?: string;   // Recipient-focused reveal message
  successMessage?: {                // Post-contribution success state
    title: string;
    message: string;
  };
  formPlaceholders?: {              // Form field placeholders
    name: string;
    message: string;
  };
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
      return newBabyCopy(recipientName);

    case "graduation":
      return graduationCopy(recipientName);

    case "farewell":
      return farewellCopy(recipientName);

    case "retirement":
      return retirementCopy(recipientName);

    case "congratulations":
      return congratulationsCopy(recipientName);

    case "housewarming":
      return housewarmingCopy(recipientName);

    case "promotion":
      return promotionCopy(recipientName);

    case "engagement":
      return engagementCopy(recipientName);

    case "valentine's day":
    case "valentines":
      return valentinesCopy(recipientName);

    case "get well soon":
    case "getwellsoon":
      return getWellSoonCopy(recipientName);

    case "thank you":
    case "thankyou":
      return thankYouCopy(recipientName);

    case "sympathy":
      return sympathyCopy(recipientName);

    default:
      return defaultCopy(recipientName);
  }
}

// Occasion-specific copy functions

function birthdayCopy(recipientName?: string): OccasionCopy {
  const pronoun = "her"; // Default; future: detect from name or explicit field
  const possessive = "her";

  return {
    celebrationMessage: recipientName ? `Happy Birthday ${recipientName}!` : "Happy Birthday!",
    emoji: "🎂",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the birthday celebration",
    helperText: "Create one beautiful birthday celebration your loved one will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to add a birthday memory for ${recipientName}. Every memory makes this celebration more special.`
      : "Be the first to add a birthday memory. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to add memories for ${recipientName}` : "Invite others to add memories",

    // v2: Landing page narrative
    landingNarrative: {
      line1: recipientName ? `Help us surprise ${recipientName} on ${possessive} birthday.` : "Help us surprise someone special on their birthday.",
      line2: "Friends and family are creating a MemoryPop filled with birthday wishes, favourite memories and photos.",
      line3: "Share your birthday message below and become part of the celebration."
    },

    // v2: Enhanced contribute narrative (4 lines)
    contributeNarrative: {
      line1: recipientName ? `${recipientName} is celebrating ${possessive} birthday.` : "We're celebrating a birthday.",
      line2: "We're creating a surprise MemoryPop filled with birthday wishes, memories and photos.",
      line3: "Add your memory and become part of the celebration.",
      line4: recipientName ? `Your memory will help make ${recipientName}'s birthday unforgettable.` : "Your memory will help make this birthday unforgettable."
    },

    // v2: CTA button
    contributeCTA: recipientName ? `Share Birthday Memory for ${recipientName}` : "Share Birthday Memory",

    // v2: WhatsApp message
    whatsappMessage: recipientName
      ? `Help us celebrate ${recipientName}'s birthday! We're creating a surprise MemoryPop filled with memories and photos. Add your birthday message here:`
      : "Help us celebrate a birthday! Add your message here:",

    // v2: Reveal WhatsApp message
    revealWhatsappMessage: recipientName
      ? `🎂 Happy Birthday, ${recipientName}! Your friends and family made something special for you. Open your MemoryPop here:`
      : "🎂 Happy Birthday! Your friends and family made something special for you. Open your MemoryPop here:",

    // v2: Success message
    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your birthday memory will help make ${recipientName}'s day unforgettable. We'll reveal all messages together on the big day.`
        : "Your birthday memory will help make their day unforgettable."
    },

    // v2: Form placeholders
    formPlaceholders: {
      name: "e.g. Mum",
      message: recipientName
        ? `Share your favourite birthday memory or wish for ${recipientName}...`
        : "Share your favourite birthday memory or wish..."
    },

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

function weddingCopy(recipientName?: string): OccasionCopy {
  const hasTwoRecipients = recipientName?.includes(" and ");

  return {
    celebrationMessage: recipientName ? `Congratulations ${recipientName}!` : "Congratulations!",
    emoji: "💍",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the wedding celebration",
    helperText: "Create one beautiful wedding celebration your loved one will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to add a wedding memory for ${recipientName}. Every memory makes this celebration more special.`
      : "Be the first to add a wedding memory. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite guests to add memories for ${recipientName}` : "Invite guests to add memories",

    // v2: Landing page narrative
    landingNarrative: {
      line1: recipientName ? `Help us celebrate ${recipientName}'s wedding.` : "Help us celebrate a wedding.",
      line2: "We're creating a surprise MemoryPop filled with love, memories and heartfelt wishes.",
      line3: "Share your wedding message and help make this celebration unforgettable."
    },

    // v2: Enhanced contribute narrative
    contributeNarrative: {
      line1: recipientName
        ? (hasTwoRecipients ? `${recipientName} are getting married.` : `${recipientName} is getting married.`)
        : "We're celebrating a wedding.",
      line2: "We're collecting heartfelt memories, wishes and photos from everyone who loves them.",
      line3: "Add your wedding message.",
      line4: "Your memory will help make their special day even more meaningful."
    },

    // v2: CTA button
    contributeCTA: recipientName ? `Share Wedding Memory for ${recipientName}` : "Share Wedding Memory",

    // v2: WhatsApp message
    whatsappMessage: recipientName
      ? `Help us celebrate ${recipientName}'s wedding! We're creating a surprise MemoryPop with love and memories. Add your wedding message here:`
      : "Help us celebrate a wedding! Add your message here:",

    // v2: Reveal WhatsApp message
    revealWhatsappMessage: recipientName
      ? `💍 ${recipientName}, congratulations on your special day! Your loved ones created something beautiful for you. Open your MemoryPop here:`
      : "💍 Congratulations on your special day! Your loved ones created something beautiful for you. Open your MemoryPop here:",

    // v2: Success message
    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your wedding memory will help make ${recipientName}'s day unforgettable. We'll share all messages together on the big day.`
        : "Your wedding memory will help make their day unforgettable."
    },

    // v2: Form placeholders
    formPlaceholders: {
      name: "e.g. Sarah",
      message: recipientName
        ? `Share your favourite memory or wish for ${recipientName}...`
        : "Share your favourite memory or wedding wish..."
    },

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

function retirementCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: "Congratulations on an Incredible Career",
    emoji: "🌟",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the retirement celebration",
    helperText: "Create one beautiful retirement celebration they will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to add a retirement memory for ${recipientName}. Every memory makes this celebration more special.`
      : "Be the first to add a retirement memory. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to celebrate ${recipientName}` : "Invite others to celebrate",

    // v2: Landing page narrative
    landingNarrative: {
      line1: "Let's celebrate an incredible career.",
      line2: recipientName ? `Help us thank ${recipientName} by sharing your favourite memory together.` : "Share your favourite memory together.",
      line3: "Add your memory below and become part of the celebration."
    },

    // v2: Enhanced contribute narrative
    contributeNarrative: {
      line1: recipientName ? `${recipientName} is retiring after an incredible career.` : "We're celebrating a retirement.",
      line2: "Help us celebrate by sharing your favourite memory.",
      line3: "Add your memory.",
      line4: recipientName ? `Your memory will help make ${recipientName}'s retirement celebration unforgettable.` : "Your memory will help make this retirement celebration unforgettable."
    },

    // v2: CTA button
    contributeCTA: recipientName ? `Share Retirement Memory for ${recipientName}` : "Share Retirement Memory",

    // v2: WhatsApp message
    whatsappMessage: recipientName
      ? `Help us celebrate ${recipientName}'s retirement! We're creating a MemoryPop filled with favourite memories. Add yours here:`
      : "Help us celebrate a retirement! Add your message here:",

    // v2: Reveal WhatsApp message
    revealWhatsappMessage: recipientName
      ? `🌟 Congratulations on an incredible career, ${recipientName}! Your colleagues and friends created something special to honor your journey. Open your MemoryPop here:`
      : "🌟 Congratulations on an incredible career! Your colleagues and friends created something special to honor your journey. Open your MemoryPop here:",

    // v2: Success message
    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your retirement memory will help make ${recipientName}'s celebration unforgettable. We'll share all messages together.`
        : "Your retirement memory will help make their celebration unforgettable."
    },

    // v2: Form placeholders
    formPlaceholders: {
      name: "e.g. John",
      message: recipientName
        ? `Share your favourite memory with ${recipientName}...`
        : "Share your favourite retirement memory..."
    },

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

function farewellCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Thank You ${recipientName}` : "Thank You",
    subMessage: "We'll miss you.",
    emoji: "👋",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the farewell celebration",
    helperText: "Create one beautiful farewell celebration they will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to add a farewell memory for ${recipientName}. Every memory makes this celebration more special.`
      : "Be the first to add a farewell memory. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to add memories for ${recipientName}` : "Invite others to add memories",

    // v2: Landing page narrative
    landingNarrative: {
      line1: recipientName ? `${recipientName} is beginning a new chapter.` : "Someone special is beginning a new chapter.",
      line2: recipientName ? `Leave a message and favourite memory that ${recipientName} will always remember.` : "Leave a message and favourite memory they'll always remember.",
      line3: "Add your memory below and become part of the celebration."
    },

    // v2: Enhanced contribute narrative
    contributeNarrative: {
      line1: recipientName ? `${recipientName} is beginning a new adventure.` : "Someone special is beginning a new adventure.",
      line2: "Leave a message they will always remember.",
      line3: "Add your memory.",
      line4: recipientName ? `Your memory will help ${recipientName} remember this special time.` : "Your memory will help them remember this special time."
    },

    // v2: CTA button
    contributeCTA: recipientName ? `Share Farewell Memory for ${recipientName}` : "Share Farewell Memory",

    // v2: WhatsApp message
    whatsappMessage: recipientName
      ? `Help us say farewell to ${recipientName}! We're creating a MemoryPop with messages they'll always remember. Add yours here:`
      : "Help us say farewell! Add your message here:",

    // v2: Reveal WhatsApp message
    revealWhatsappMessage: recipientName
      ? `👋 ${recipientName}, your friends created a special farewell gift for you. Open your MemoryPop here:`
      : "👋 Your friends created a special farewell gift for you. Open your MemoryPop here:",

    // v2: Success message
    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your farewell memory will help ${recipientName} remember this special time. We'll share all messages together.`
        : "Your farewell memory will be treasured."
    },

    // v2: Form placeholders
    formPlaceholders: {
      name: "e.g. Alex",
      message: recipientName
        ? `Share your favourite memory with ${recipientName}...`
        : "Share your favourite farewell memory..."
    },

    messageStarters: [
      recipientName ? `Thank you ${recipientName}! You've made such a positive impact.` : "Thank you! You've made such a positive impact.",
      recipientName ? `We'll miss ${recipientName} so much. Best wishes on your next adventure!` : "We'll miss you so much. Best wishes on your next adventure!",
      recipientName ? `${recipientName} will always be remembered for the joy you brought.` : "You'll always be remembered for the joy you brought."
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

function graduationCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: "Congratulations Graduate!",
    emoji: "🎓",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the graduation celebration",
    helperText: "Create one beautiful graduation celebration your loved one will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to celebrate ${recipientName}'s graduation. Every memory makes this celebration more special.`
      : "Be the first to add a graduation memory. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to celebrate ${recipientName}` : "Invite others to celebrate",

    // v2: Landing page narrative
    landingNarrative: {
      line1: "Celebrate an amazing achievement.",
      line2: "Share your wishes, advice or favourite memory.",
      line3: "Add your message below and become part of the celebration."
    },

    // v2: Enhanced contribute narrative
    contributeNarrative: {
      line1: recipientName ? `${recipientName} has reached an incredible milestone.` : "We're celebrating an incredible milestone.",
      line2: "Celebrate this achievement by sharing your wishes and memories.",
      line3: "Add your memory.",
      line4: recipientName ? `Your memory will help make ${recipientName}'s graduation unforgettable.` : "Your memory will help make this graduation unforgettable."
    },

    // v2: CTA button
    contributeCTA: recipientName ? `Share Graduation Memory for ${recipientName}` : "Share Graduation Memory",

    // v2: WhatsApp message
    whatsappMessage: recipientName
      ? `Help us celebrate ${recipientName}'s graduation! We're creating a MemoryPop with wishes and memories. Add yours here:`
      : "Help us celebrate a graduation! Add your message here:",

    // v2: Reveal WhatsApp message
    revealWhatsappMessage: recipientName
      ? `🎓 Congratulations on your graduation, ${recipientName}! Your loved ones came together to celebrate this milestone. Open your MemoryPop here:`
      : "🎓 Congratulations on your graduation! Your loved ones came together to celebrate this milestone. Open your MemoryPop here:",

    // v2: Success message
    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your graduation memory will help make ${recipientName}'s day unforgettable. We'll share all messages together.`
        : "Your graduation memory will help make their day unforgettable."
    },

    // v2: Form placeholders
    formPlaceholders: {
      name: "e.g. Sarah",
      message: recipientName
        ? `Share your wishes, advice or favourite memory for ${recipientName}...`
        : "Share your wishes, advice or favourite memory..."
    },

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

function newBabyCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: "Welcome to the World",
    emoji: "👶",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the celebration",
    helperText: "Create one beautiful celebration for the new arrival.",
    emptyStateMessage: recipientName
      ? `Be the first to welcome ${recipientName}. Every memory makes this celebration more special.`
      : "Be the first to add a welcome message. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to add memories for ${recipientName}` : "Invite others to add memories",

    // v2: Landing page narrative
    landingNarrative: {
      line1: "Welcome a beautiful new life.",
      line2: "Leave your wishes for the newest member of the family.",
      line3: "Add your message below and become part of the celebration."
    },

    // v2: Enhanced contribute narrative
    contributeNarrative: {
      line1: "A beautiful new chapter has begun.",
      line2: "Welcome the newest member of the family with your message.",
      line3: "Add your memory.",
      line4: "Your wishes will become a treasured keepsake for the family."
    },

    // v2: CTA button
    contributeCTA: "Share Welcome Message",

    // v2: WhatsApp message
    whatsappMessage: recipientName
      ? `Welcome ${recipientName} to the world! We're creating a MemoryPop with messages for the family. Add your wishes here:`
      : "Welcome a new baby! Add your wishes here:",

    // v2: Reveal WhatsApp message
    revealWhatsappMessage: recipientName
      ? `👶 Welcome to the world, ${recipientName}! Your family and friends created something special for you. Open your MemoryPop here:`
      : "👶 Welcome to the world! Your family and friends created something special for you. Open your MemoryPop here:",

    // v2: Success message
    successMessage: {
      title: "Thank you for welcoming this new life!",
      message: "Your message will become a treasured keepsake for the family."
    },

    // v2: Form placeholders
    formPlaceholders: {
      name: "e.g. Emma",
      message: "Share your wishes for the new arrival and family..."
    },

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

function anniversaryCopy(recipientName?: string): OccasionCopy {
  const hasTwoRecipients = recipientName?.includes(" and ");

  return {
    celebrationMessage: recipientName ? `Happy Anniversary ${recipientName}!` : "Happy Anniversary!",
    emoji: "❤️",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the anniversary celebration",
    helperText: "Create one beautiful anniversary celebration your loved one will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to celebrate ${recipientName}'s anniversary. Every memory makes this celebration more special.`
      : "Be the first to add an anniversary memory. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to celebrate ${recipientName}` : "Invite others to celebrate",

    // v2: Landing page narrative
    landingNarrative: {
      line1: recipientName ? `Help celebrate another beautiful year together.` : "Help celebrate another beautiful year together.",
      line2: recipientName ? `Share your favourite memory or wish for ${recipientName}.` : "Share your favourite memory or wish.",
      line3: "Add your message below and become part of the celebration."
    },

    // v2: Enhanced contribute narrative
    contributeNarrative: {
      line1: recipientName
        ? (hasTwoRecipients ? `${recipientName} are celebrating another beautiful year together.` : `${recipientName} is celebrating their anniversary.`)
        : "We're celebrating an anniversary.",
      line2: "Share your favourite memory or wish for their journey ahead.",
      line3: "Add your memory.",
      line4: recipientName ? `Your memory will help make ${recipientName}'s anniversary unforgettable.` : "Your memory will help make this anniversary unforgettable."
    },

    // v2: CTA button
    contributeCTA: recipientName ? `Share Anniversary Memory for ${recipientName}` : "Share Anniversary Memory",

    // v2: WhatsApp message
    whatsappMessage: recipientName
      ? `Help us celebrate ${recipientName}'s anniversary! We're creating a MemoryPop with memories and wishes. Add yours here:`
      : "Help us celebrate an anniversary! Add your message here:",

    // v2: Reveal WhatsApp message
    revealWhatsappMessage: recipientName
      ? `💕 Happy Anniversary, ${recipientName}! Your friends and family created a celebration of your journey together. Open your MemoryPop here:`
      : "💕 Happy Anniversary! Your friends and family created a celebration of your journey together. Open your MemoryPop here:",

    // v2: Success message
    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your anniversary memory will help make ${recipientName}'s day unforgettable. We'll share all messages together.`
        : "Your anniversary memory will help make their day unforgettable."
    },

    // v2: Form placeholders
    formPlaceholders: {
      name: "e.g. Claire",
      message: recipientName
        ? `Share your favourite memory or wish for ${recipientName}...`
        : "Share your favourite anniversary memory or wish..."
    },

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

function congratulationsCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Congratulations ${recipientName}!` : "Congratulations!",
    emoji: "🎉",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the celebration",
    helperText: "Create one beautiful celebration your loved one will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to congratulate ${recipientName}. Every memory makes this celebration more special.`
      : "Be the first to add a congratulations message. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to celebrate ${recipientName}` : "Invite others to celebrate",

    landingNarrative: {
      line1: "Let's celebrate an amazing achievement.",
      line2: recipientName ? `Share your excitement and well wishes for ${recipientName}.` : "Share your excitement and well wishes.",
      line3: "Add your message below and become part of the celebration."
    },

    contributeNarrative: {
      line1: recipientName ? `${recipientName} has something amazing to celebrate.` : "We're celebrating something amazing.",
      line2: "Share your excitement and congratulations.",
      line3: "Add your memory.",
      line4: recipientName ? `Your message will help make ${recipientName}'s celebration unforgettable.` : "Your message will help make this celebration unforgettable."
    },

    contributeCTA: recipientName ? `Share Congratulations for ${recipientName}` : "Share Congratulations",

    whatsappMessage: recipientName
      ? `Help us congratulate ${recipientName}! We're creating a MemoryPop with messages and memories. Add yours here:`
      : "Help us celebrate! Add your message here:",

    revealWhatsappMessage: recipientName
      ? `🎉 Congratulations, ${recipientName}! Your friends and family created something special to celebrate with you. Open your MemoryPop here:`
      : "🎉 Congratulations! Your friends and family created something special to celebrate with you. Open your MemoryPop here:",

    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your message will help make ${recipientName}'s celebration unforgettable.`
        : "Your message will help make this celebration unforgettable."
    },

    formPlaceholders: {
      name: "e.g. Sarah",
      message: recipientName
        ? `Share your congratulations and excitement for ${recipientName}...`
        : "Share your congratulations..."
    },

    messageStarters: [
      recipientName ? `Congratulations ${recipientName}! This is such exciting news!` : "Congratulations! This is such exciting news!",
      recipientName ? `So proud of ${recipientName} and everything you've accomplished.` : "So proud of everything you've accomplished.",
      "This is just the beginning of amazing things ahead!"
    ],
    emojiShortcuts: ["🎉", "🎊", "🥳", "🌟", "✨", "👏", "💪", "🙌"],
    coverPresets: [
      {
        id: "celebration",
        label: "Celebration",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      {
        id: "confetti",
        label: "Confetti",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      },
      {
        id: "bright",
        label: "Bright",
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

function housewarmingCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Welcome Home ${recipientName}!` : "Welcome Home!",
    emoji: "🏠",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the housewarming celebration",
    helperText: "Create one beautiful housewarming celebration they will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to welcome ${recipientName} to their new home. Every memory makes this celebration more special.`
      : "Be the first to add a housewarming message. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to celebrate ${recipientName}'s new home` : "Invite others to celebrate",

    landingNarrative: {
      line1: recipientName ? `${recipientName} has a beautiful new home.` : "Someone special has a beautiful new home.",
      line2: "Share your warm wishes and excitement for this new chapter.",
      line3: "Add your message below and become part of the celebration."
    },

    contributeNarrative: {
      line1: recipientName ? `${recipientName} is starting a new chapter in a new home.` : "We're celebrating a new home.",
      line2: "Share your warm wishes for their new beginning.",
      line3: "Add your memory.",
      line4: recipientName ? `Your message will help make ${recipientName}'s housewarming unforgettable.` : "Your message will help make this housewarming unforgettable."
    },

    contributeCTA: recipientName ? `Share Housewarming Wishes for ${recipientName}` : "Share Housewarming Wishes",

    whatsappMessage: recipientName
      ? `Help us celebrate ${recipientName}'s new home! We're creating a MemoryPop with warm wishes. Add yours here:`
      : "Help us celebrate a new home! Add your message here:",

    revealWhatsappMessage: recipientName
      ? `🏠 Welcome home, ${recipientName}! Your friends created something special for your new beginning. Open your MemoryPop here:`
      : "🏠 Welcome home! Your friends created something special for your new beginning. Open your MemoryPop here:",

    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your housewarming message will help make ${recipientName}'s new beginning unforgettable.`
        : "Your housewarming message will help make this new beginning unforgettable."
    },

    formPlaceholders: {
      name: "e.g. Emma",
      message: recipientName
        ? `Share your warm wishes for ${recipientName}'s new home...`
        : "Share your warm wishes for their new home..."
    },

    messageStarters: [
      recipientName ? `Congratulations on your new home ${recipientName}! May it be filled with love and laughter.` : "Congratulations on your new home! May it be filled with love and laughter.",
      "Wishing you countless happy memories in your beautiful new space.",
      "So excited for this new chapter! Here's to making your house a home."
    ],
    emojiShortcuts: ["🏠", "🏡", "🔑", "🎉", "❤️", "✨", "🌟", "🥳"],
    coverPresets: [
      {
        id: "home",
        label: "Home Sweet Home",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
      },
      {
        id: "cozy",
        label: "Cozy",
        gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
      },
      {
        id: "warm",
        label: "Warm",
        gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
  };
}

function promotionCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Congratulations ${recipientName}!` : "Congratulations on Your Promotion!",
    emoji: "🎊",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the promotion celebration",
    helperText: "Create one beautiful celebration they will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to congratulate ${recipientName} on their promotion. Every memory makes this celebration more special.`
      : "Be the first to add a promotion message. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to celebrate ${recipientName}` : "Invite others to celebrate",

    landingNarrative: {
      line1: recipientName ? `${recipientName} has earned an amazing promotion.` : "Someone special has earned an amazing promotion.",
      line2: "Share your pride and excitement for their well-deserved success.",
      line3: "Add your message below and become part of the celebration."
    },

    contributeNarrative: {
      line1: recipientName ? `${recipientName} has earned a well-deserved promotion.` : "We're celebrating a well-deserved promotion.",
      line2: "Share your pride and congratulations.",
      line3: "Add your memory.",
      line4: recipientName ? `Your message will help make ${recipientName}'s celebration unforgettable.` : "Your message will help make this celebration unforgettable."
    },

    contributeCTA: recipientName ? `Share Congratulations for ${recipientName}` : "Share Congratulations",

    whatsappMessage: recipientName
      ? `Help us celebrate ${recipientName}'s promotion! We're creating a MemoryPop with congratulations and memories. Add yours here:`
      : "Help us celebrate a promotion! Add your message here:",

    revealWhatsappMessage: recipientName
      ? `🎊 Congratulations on your promotion, ${recipientName}! Your team created something special to celebrate your success. Open your MemoryPop here:`
      : "🎊 Congratulations on your promotion! Your team created something special to celebrate your success. Open your MemoryPop here:",

    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your message will help make ${recipientName}'s celebration unforgettable.`
        : "Your message will help make this celebration unforgettable."
    },

    formPlaceholders: {
      name: "e.g. Michael",
      message: recipientName
        ? `Share your congratulations for ${recipientName}...`
        : "Share your congratulations..."
    },

    messageStarters: [
      recipientName ? `Congratulations ${recipientName}! This promotion is so well-deserved.` : "Congratulations! This promotion is so well-deserved.",
      "Your hard work and dedication have truly paid off.",
      "Excited to see all the amazing things you'll accomplish in this new role!"
    ],
    emojiShortcuts: ["🎊", "🎉", "👏", "🌟", "💪", "🚀", "✨", "🏆"],
    coverPresets: [
      {
        id: "success",
        label: "Success",
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      {
        id: "achievement",
        label: "Achievement",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      },
      {
        id: "growth",
        label: "Growth",
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

function engagementCopy(recipientName?: string): OccasionCopy {
  const hasTwoRecipients = recipientName?.includes(" and ");

  return {
    celebrationMessage: recipientName ? `Congratulations ${recipientName}!` : "Congratulations on Your Engagement!",
    emoji: "💝",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the engagement celebration",
    helperText: "Create one beautiful engagement celebration they will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to celebrate ${recipientName}'s engagement. Every memory makes this celebration more special.`
      : "Be the first to add an engagement message. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to celebrate ${recipientName}` : "Invite others to celebrate",

    landingNarrative: {
      line1: recipientName ? `${recipientName} ${hasTwoRecipients ? 'are' : 'is'} engaged!` : "Someone special is engaged!",
      line2: "Share your joy and excitement for their beautiful new chapter.",
      line3: "Add your message below and become part of the celebration."
    },

    contributeNarrative: {
      line1: recipientName
        ? (hasTwoRecipients ? `${recipientName} are engaged!` : `${recipientName} is engaged!`)
        : "We're celebrating an engagement.",
      line2: "Share your excitement and well wishes for their journey ahead.",
      line3: "Add your memory.",
      line4: recipientName ? `Your message will help make ${recipientName}'s celebration unforgettable.` : "Your message will help make this celebration unforgettable."
    },

    contributeCTA: recipientName ? `Share Engagement Wishes for ${recipientName}` : "Share Engagement Wishes",

    whatsappMessage: recipientName
      ? `Help us celebrate ${recipientName}'s engagement! We're creating a MemoryPop with love and memories. Add yours here:`
      : "Help us celebrate an engagement! Add your message here:",

    revealWhatsappMessage: recipientName
      ? `💝 Congratulations on your engagement, ${recipientName}! Your friends created something special to celebrate your love. Open your MemoryPop here:`
      : "💝 Congratulations on your engagement! Your friends created something special to celebrate your love. Open your MemoryPop here:",

    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your engagement message will help make ${recipientName}'s celebration unforgettable.`
        : "Your engagement message will help make this celebration unforgettable."
    },

    formPlaceholders: {
      name: "e.g. Alex",
      message: recipientName
        ? `Share your excitement and wishes for ${recipientName}...`
        : "Share your excitement and wishes..."
    },

    messageStarters: [
      recipientName ? `Congratulations ${recipientName}! So excited for your beautiful journey together.` : "Congratulations! So excited for your beautiful journey together.",
      "Wishing you a lifetime of love, laughter and happiness.",
      "Your love story is just beginning. Can't wait to celebrate with you!"
    ],
    emojiShortcuts: ["💝", "💍", "❤️", "💕", "🥂", "✨", "🎉", "💐"],
    coverPresets: [
      {
        id: "romantic",
        label: "Romantic",
        gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
      },
      {
        id: "love",
        label: "Love",
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
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

function valentinesCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Happy Valentine's Day ${recipientName}!` : "Happy Valentine's Day!",
    emoji: "❤️",
    actionLabel: recipientName ? `Add a memory for ${recipientName}` : "Add a memory",
    progressLabel: "Starting the Valentine's celebration",
    helperText: "Create one beautiful Valentine's celebration they will never forget.",
    emptyStateMessage: recipientName
      ? `Be the first to share Valentine's love for ${recipientName}. Every memory makes this celebration more special.`
      : "Be the first to add a Valentine's message. Every memory makes this celebration more special.",
    sharePrompt: recipientName ? `Invite others to celebrate ${recipientName}` : "Invite others to celebrate",

    landingNarrative: {
      line1: "Celebrate love and appreciation this Valentine's Day.",
      line2: recipientName ? `Share your heartfelt message for ${recipientName}.` : "Share your heartfelt message.",
      line3: "Add your message below and become part of the celebration."
    },

    contributeNarrative: {
      line1: recipientName ? `Show ${recipientName} how much they mean to you this Valentine's Day.` : "We're celebrating Valentine's Day.",
      line2: "Share your love, appreciation and favourite memories.",
      line3: "Add your memory.",
      line4: recipientName ? `Your message will help make ${recipientName}'s Valentine's Day unforgettable.` : "Your message will help make this Valentine's Day unforgettable."
    },

    contributeCTA: recipientName ? `Share Valentine's Message for ${recipientName}` : "Share Valentine's Message",

    whatsappMessage: recipientName
      ? `Help us surprise ${recipientName} this Valentine's Day! We're creating a MemoryPop filled with love. Add yours here:`
      : "Help us celebrate Valentine's Day! Add your message here:",

    revealWhatsappMessage: recipientName
      ? `❤️ Happy Valentine's Day, ${recipientName}! Your loved ones created something special for you. Open your MemoryPop here:`
      : "❤️ Happy Valentine's Day! Your loved ones created something special for you. Open your MemoryPop here:",

    successMessage: {
      title: recipientName ? `Thank you for celebrating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your Valentine's message will help make ${recipientName}'s day unforgettable.`
        : "Your Valentine's message will help make this day unforgettable."
    },

    formPlaceholders: {
      name: "e.g. Jamie",
      message: recipientName
        ? `Share your Valentine's message for ${recipientName}...`
        : "Share your Valentine's message..."
    },

    messageStarters: [
      recipientName ? `Happy Valentine's Day ${recipientName}! You mean the world to me.` : "Happy Valentine's Day! You mean the world to me.",
      "Thank you for filling my life with so much love and joy.",
      "Grateful for every moment we share together."
    ],
    emojiShortcuts: ["❤️", "💕", "💖", "💝", "🌹", "💐", "😍", "💑"],
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
        id: "love",
        label: "Love",
        gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
  };
}

function getWellSoonCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Get Well Soon ${recipientName}` : "Get Well Soon",
    emoji: "🌻",
    actionLabel: recipientName ? `Add a message for ${recipientName}` : "Add a message",
    progressLabel: "Sending warm wishes",
    helperText: "Send comforting messages and warm wishes.",
    emptyStateMessage: recipientName
      ? `Be the first to send get well wishes to ${recipientName}. Every message brings comfort and support.`
      : "Be the first to add a get well message. Every message brings comfort and support.",
    sharePrompt: recipientName ? `Invite others to send wishes to ${recipientName}` : "Invite others to send wishes",

    landingNarrative: {
      line1: recipientName ? `${recipientName} could use some extra love right now.` : "Someone special could use some extra love right now.",
      line2: "Share your warm wishes and positive thoughts.",
      line3: "Add your message below to send comfort and support."
    },

    contributeNarrative: {
      line1: recipientName ? `${recipientName} could use some warm wishes right now.` : "We're sending warm wishes.",
      line2: "Share your comforting message and positive thoughts.",
      line3: "Add your message.",
      line4: recipientName ? `Your words will bring comfort to ${recipientName}.` : "Your words will bring comfort."
    },

    contributeCTA: recipientName ? `Send Get Well Wishes to ${recipientName}` : "Send Get Well Wishes",

    whatsappMessage: recipientName
      ? `Help us send warm wishes to ${recipientName}! We're creating a MemoryPop with messages of support. Add yours here:`
      : "Help us send warm wishes! Add your message here:",

    revealWhatsappMessage: recipientName
      ? `🌻 ${recipientName}, your friends are thinking of you and sending love. Open your MemoryPop here:`
      : "🌻 Your friends are thinking of you and sending love. Open your MemoryPop here:",

    successMessage: {
      title: recipientName ? `Thank you for supporting ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your message will bring comfort to ${recipientName}.`
        : "Your message will bring comfort."
    },

    formPlaceholders: {
      name: "e.g. Chris",
      message: recipientName
        ? `Share your warm wishes for ${recipientName}...`
        : "Share your warm wishes..."
    },

    messageStarters: [
      recipientName ? `Thinking of you ${recipientName}. Sending love and healing thoughts your way.` : "Thinking of you. Sending love and healing thoughts your way.",
      "Hope you feel better soon. You're in my thoughts.",
      "Wishing you a speedy recovery and brighter days ahead."
    ],
    emojiShortcuts: ["🌻", "💐", "🌸", "💛", "🌈", "☀️", "💕", "🤗"],
    coverPresets: [
      {
        id: "sunshine",
        label: "Sunshine",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
      },
      {
        id: "calm",
        label: "Calm",
        gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)"
      },
      {
        id: "gentle",
        label: "Gentle",
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

function thankYouCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Thank You ${recipientName}` : "Thank You",
    emoji: "💛",
    actionLabel: recipientName ? `Add a message for ${recipientName}` : "Add a message",
    progressLabel: "Expressing gratitude",
    helperText: "Express your heartfelt thanks and appreciation.",
    emptyStateMessage: recipientName
      ? `Be the first to thank ${recipientName}. Every message shows how much they're appreciated.`
      : "Be the first to add a thank you message. Every message shows appreciation.",
    sharePrompt: recipientName ? `Invite others to thank ${recipientName}` : "Invite others to say thank you",

    landingNarrative: {
      line1: recipientName ? `${recipientName} deserves to know how much they're appreciated.` : "Someone special deserves to know they're appreciated.",
      line2: "Share your gratitude and thanks.",
      line3: "Add your message below to show your appreciation."
    },

    contributeNarrative: {
      line1: recipientName ? `${recipientName} has made such a positive impact.` : "We're expressing gratitude.",
      line2: "Share what you're thankful for.",
      line3: "Add your message.",
      line4: recipientName ? `Your gratitude will mean the world to ${recipientName}.` : "Your gratitude will mean the world."
    },

    contributeCTA: recipientName ? `Say Thank You to ${recipientName}` : "Say Thank You",

    whatsappMessage: recipientName
      ? `Help us thank ${recipientName}! We're creating a MemoryPop with messages of gratitude. Add yours here:`
      : "Help us say thank you! Add your message here:",

    revealWhatsappMessage: recipientName
      ? `💛 ${recipientName}, your friends wanted to say thank you in a special way. Open your MemoryPop here:`
      : "💛 Your friends wanted to say thank you in a special way. Open your MemoryPop here:",

    successMessage: {
      title: recipientName ? `Thank you for appreciating ${recipientName}!` : "Thank you!",
      message: recipientName
        ? `Your message will mean the world to ${recipientName}.`
        : "Your message will mean the world."
    },

    formPlaceholders: {
      name: "e.g. Taylor",
      message: recipientName
        ? `Share what you're thankful for about ${recipientName}...`
        : "Share what you're thankful for..."
    },

    messageStarters: [
      recipientName ? `Thank you ${recipientName} for everything you do. You make such a difference.` : "Thank you for everything you do. You make such a difference.",
      "Your kindness and support mean more than you know.",
      "Grateful to have you in my life. Thank you for being you."
    ],
    emojiShortcuts: ["💛", "🙏", "🌟", "💕", "✨", "🤗", "🌻", "❤️"],
    coverPresets: [
      {
        id: "grateful",
        label: "Grateful",
        gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
      },
      {
        id: "warm",
        label: "Warm",
        gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
      },
      {
        id: "heartfelt",
        label: "Heartfelt",
        gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)"
      },
      {
        id: "none",
        label: "No Cover",
        gradient: "linear-gradient(135deg, #FFE1D6 0%, #FFF3C7 50%, #E5D4FF 100%)"
      }
    ]
  };
}

function sympathyCopy(recipientName?: string): OccasionCopy {
  return {
    celebrationMessage: recipientName ? `Thinking of You ${recipientName}` : "With Deepest Sympathy",
    emoji: "🕊️",
    actionLabel: recipientName ? `Add a message for ${recipientName}` : "Add a message",
    progressLabel: "Sending comfort",
    helperText: "Share comforting words and support during this difficult time.",
    emptyStateMessage: recipientName
      ? `Be the first to send sympathy and support to ${recipientName}. Every message brings comfort.`
      : "Be the first to add a sympathy message. Every message brings comfort.",
    sharePrompt: recipientName ? `Invite others to send support to ${recipientName}` : "Invite others to send support",

    landingNarrative: {
      line1: recipientName ? `${recipientName} needs our love and support right now.` : "Someone special needs our love and support.",
      line2: "Share your comforting words and memories.",
      line3: "Add your message below to show you care."
    },

    contributeNarrative: {
      line1: recipientName ? `${recipientName} is going through a difficult time.` : "We're offering comfort and support.",
      line2: "Share your sympathy and support.",
      line3: "Add your message.",
      line4: recipientName ? `Your words will bring comfort to ${recipientName}.` : "Your words will bring comfort."
    },

    contributeCTA: recipientName ? `Send Support to ${recipientName}` : "Send Support",

    whatsappMessage: recipientName
      ? `Help us support ${recipientName} during this difficult time. We're creating a MemoryPop with comforting messages. Add yours here:`
      : "Help us offer support during this difficult time. Add your message here:",

    revealWhatsappMessage: recipientName
      ? `🕊️ ${recipientName}, thinking of you and sending love during this difficult time. Open your MemoryPop here:`
      : "🕊️ Thinking of you and sending love during this difficult time. Open your MemoryPop here:",

    successMessage: {
      title: recipientName ? `Thank you for supporting ${recipientName}` : "Thank you",
      message: recipientName
        ? `Your message will bring comfort to ${recipientName} during this difficult time.`
        : "Your message will bring comfort during this difficult time."
    },

    formPlaceholders: {
      name: "e.g. Jordan",
      message: recipientName
        ? `Share your comforting message for ${recipientName}...`
        : "Share your comforting message..."
    },

    messageStarters: [
      recipientName ? `Thinking of you ${recipientName}. Sending love and strength during this difficult time.` : "Thinking of you. Sending love and strength during this difficult time.",
      "My heart goes out to you. You're in my thoughts and prayers.",
      "Wishing you peace and comfort. I'm here if you need anything."
    ],
    emojiShortcuts: ["🕊️", "💙", "🤍", "🌸", "💐", "🙏", "💕", "🌟"],
    coverPresets: [
      {
        id: "peaceful",
        label: "Peaceful",
        gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)"
      },
      {
        id: "gentle",
        label: "Gentle",
        gradient: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)"
      },
      {
        id: "serene",
        label: "Serene",
        gradient: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)"
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
    emptyStateMessage: "Be the first to add a memory. Every memory makes this celebration more special.",
    sharePrompt: "Share this MemoryPop",

    // v2 defaults
    landingNarrative: {
      line1: "We're creating something special.",
      line2: "Friends and family are adding memories and photos.",
      line3: "Add your memory below and become part of the celebration."
    },
    contributeNarrative: {
      line1: "We're creating something special.",
      line2: "Add your memory and become part of the celebration.",
      line3: "",
      line4: "Your memory will help make this celebration unforgettable."
    },
    contributeCTA: "Share Your Memory",
    whatsappMessage: "Help us create something special! Add your memory here:",
    revealWhatsappMessage: recipientName
      ? `❤️ ${recipientName}, your friends wanted to say thank you in a special way. Open your MemoryPop here:`
      : "❤️ Your friends created something special for you. Open your MemoryPop here:",
    successMessage: {
      title: "Thank you!",
      message: "Your memory will help make this celebration unforgettable."
    },
    formPlaceholders: {
      name: "Your name",
      message: "Share your memory..."
    }
  };
}
