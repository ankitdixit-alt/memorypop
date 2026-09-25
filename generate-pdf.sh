#!/bin/bash

# MemoryPop User Flow Review - PDF Generation Script

HTML_FILE="screenshots/USER-FLOW-REVIEW.html"
PDF_FILE="screenshots/USER-FLOW-REVIEW.pdf"

echo "📄 MemoryPop User Flow Review - PDF Generation"
echo "=============================================="
echo ""

# Check if HTML file exists
if [ ! -f "$HTML_FILE" ]; then
    echo "❌ Error: $HTML_FILE not found"
    exit 1
fi

echo "✅ HTML review document found"
echo ""

# Open HTML in browser for manual print
echo "🌐 Opening review in browser..."
open "$HTML_FILE"

echo ""
echo "📋 To create the PDF:"
echo ""
echo "  Option 1 - Print from Browser (Recommended):"
echo "  1. The HTML document should now be open in your browser"
echo "  2. Press Cmd+P (or File → Print)"
echo "  3. Select 'Save as PDF' in the print dialog"
echo "  4. Save to: screenshots/USER-FLOW-REVIEW.pdf"
echo ""
echo "  Option 2 - Using command line (if you have wkhtmltopdf):"
echo "  wkhtmltopdf $HTML_FILE $PDF_FILE"
echo ""
echo "  Option 3 - Using Chrome headless:"
echo "  /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\"
echo "    --headless \\"
echo "    --disable-gpu \\"
echo "    --print-to-pdf=$PDF_FILE \\"
echo "    $HTML_FILE"
echo ""

# Wait for user confirmation
echo "Press Enter when you've saved the PDF..."
read

# Check if PDF was created
if [ -f "$PDF_FILE" ]; then
    echo ""
    echo "✅ SUCCESS!"
    echo "📁 PDF created: $PDF_FILE"
    echo ""
    echo "Opening PDF..."
    open "$PDF_FILE"
else
    echo ""
    echo "⚠️  PDF not found at expected location"
    echo "Please ensure you saved it to: $PDF_FILE"
fi

echo ""
echo "🎉 Review complete!"
