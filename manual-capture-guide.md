# Manual User Flow Capture Guide

Due to network connectivity issues with package installation, please follow this manual guide to capture the user flow screenshots.

## Setup

1. **Open your browser** in a desktop viewport (1440x900 recommended)
2. **Prepare screenshot tool**: Use macOS Screenshot (Cmd + Shift + 5) or any screen capture tool
3. **Clear browser cache** to simulate first-time user experience
4. **Start at**: http://localhost:3000/

## Capture Steps

### 1. Homepage - Hero (01-home.png)
- Navigate to http://localhost:3000/
- Capture the full landing page
- **User action**: First visit to MemoryPop
- **What's visible**: Hero section with "Create a celebration they'll never forget" headline

### 2. Homepage - How It Works (02-home-how-it-works.png)
- Scroll down to "How it works" section
- Capture the three-step process
- **What's visible**: Steps 01-03 with icons and descriptions

### 3. Homepage - Occasions (03-home-occasions.png)
- Scroll to the "Made for every celebration" section
- Capture the occasions grid
- **What's visible**: Birthdays, Weddings, New babies, Graduations, Retirements

### 4. Homepage - Why MemoryPop (04-home-why.png)
- Scroll to "Why people love MemoryPop"
- Capture feature cards and testimonials
- **What's visible**: 6 feature cards + 2 testimonial cards

### 5. Homepage - Final CTA (05-home-cta.png)
- Scroll to final call-to-action section
- **What's visible**: "The people they love, all in one place" section

### 6. Occasion Selection (06-create-occasion.png)
- Click "Start a MemoryPop" button
- Capture the occasion selection screen
- **User action**: Clicked primary CTA
- **What's visible**: Form with occasion options

### 7. Occasion Selected (07-create-occasion-selected.png)
- Click on an occasion (e.g., Birthday)
- Capture the selected state
- **What's visible**: Selected occasion highlighted

### 8. Recipient Information (08-create-recipient.png)
- Click "Next" or "Continue"
- Capture the recipient information form
- **What's visible**: Name field, date picker, etc.

### 9. Recipient Filled (09-create-recipient-filled.png)
- Fill in recipient information (use: Emma Johnson, Date: October 15, 2026)
- Capture the filled form
- **What's visible**: Completed form fields

### 10. Story/Message Step (10-create-story.png)
- Click "Next" to proceed
- Capture the story/message input screen
- **What's visible**: Text area or story prompts

### 11. Story Filled (11-create-story-filled.png)
- Enter a sample story
- Capture the filled story
- **What's visible**: Completed story text

### 12. Photo Upload (12-create-photo.png)
- Look for photo upload interface
- Capture the upload UI (don't actually upload)
- **What's visible**: Photo upload button/dropzone

### 13. Review/Submit (13-create-review.png)
- Navigate to the final review screen
- Capture before submission
- **What's visible**: Summary of entered information
- **DO NOT SUBMIT** - Stop here to avoid creating test data

### 14. Demo Experience (14-demo-landing.png)
- Navigate to http://localhost:3000/demo
- Capture the demo landing page
- **User action**: Clicked "Experience a MemoryPop"
- **What's visible**: Demo MemoryPop interface

### 15. Demo Messages (15-demo-messages.png)
- Scroll through demo content
- Capture message cards
- **What's visible**: Sample messages and photos

### 16. Demo AI Recap (16-demo-ai-recap.png)
- If present, capture the AI-generated recap section
- **What's visible**: AI-woven story or summary

### Additional Screens to Check

#### Reveal Experience
If you can access a reveal page (check `/m/[shareCode]/reveal`):
- **17-reveal-landing.png**: Initial reveal page
- **18-reveal-animation.png**: Reveal animation or interaction
- **19-reveal-content.png**: Revealed content and memories

#### Error States
- **20-form-validation.png**: Show validation errors (try submitting empty form)
- **21-loading-state.png**: Any loading spinners or skeleton screens

#### Mobile View (Optional but Recommended)
- Resize browser to 375x812 (iPhone)
- Capture 3-4 key screens showing responsive design

## After Capture

1. Save all screenshots to `/screenshots/` folder
2. Name them sequentially as shown above
3. Note any screens you couldn't capture and why
4. Document any broken flows or external integrations that are disabled

## Notes

- Total expected screenshots: 15-25
- Capture full page screenshots when possible
- Note any modal dialogs, tooltips, or interactive elements
- Document any error messages or blocked flows
- Pay attention to loading states and transitions
