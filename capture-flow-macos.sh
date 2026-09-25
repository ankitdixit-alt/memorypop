#!/bin/bash

# MemoryPop User Flow Capture (macOS Native)
# Uses Safari/Chrome + screencapture command

BASE_URL="http://localhost:3000"
SCREENSHOTS_DIR="./screenshots"
BROWSER="Safari" # or "Google Chrome"

# Create screenshots directory
mkdir -p "$SCREENSHOTS_DIR"

echo "🎬 Starting MemoryPop user flow capture..."
echo "📱 Using $BROWSER"
echo ""

# Function to open URL and wait
open_and_wait() {
    local url=$1
    local wait_time=${2:-3}

    osascript <<EOF
        tell application "$BROWSER"
            activate
            open location "$url"
        end tell
EOF

    sleep $wait_time
}

# Function to capture screenshot
capture() {
    local filename=$1
    local description=$2
    local fullpath="$SCREENSHOTS_DIR/$filename"

    echo "📸 Capturing: $description"

    # Capture the frontmost window
    screencapture -o -w "$fullpath"

    sleep 1
}

# Start the flow
echo "Opening homepage..."
open_and_wait "$BASE_URL" 5

echo ""
echo "Please manually capture screenshots using Cmd+Shift+5"
echo "Follow the guide in manual-capture-guide.md"
echo ""
echo "Press Enter when you've captured the homepage..."
read

echo "Opening /create page..."
open_and_wait "$BASE_URL/create" 3

echo "Press Enter when you've captured the create flow..."
read

echo "Opening /demo page..."
open_and_wait "$BASE_URL/demo" 3

echo "Press Enter when you've captured the demo..."
read

echo ""
echo "✅ User flow navigation complete!"
echo "📁 Please ensure all screenshots are saved to: $SCREENSHOTS_DIR"
echo ""
echo "Next step: Run generate-pdf.sh to create the review document"
