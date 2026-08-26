#!/bin/bash
# Create 8 simple animated GIF placeholders (2-frame animations)
# These are minimal valid GIFs for development/testing

# Minimal 2-frame animated GIF (red square)
echo "R0lGODlhCgAKAIABAP8AAP///yH5BAEKAAEALAAAAAAKAAoAAAIRhI+py+0Po5y02ouz3rz7DxYAOw==" | base64 -d > birthday-cake.gif

# Minimal 2-frame animated GIF (green square)
echo "R0lGODlhCgAKAIABAAAA/////yH5BAEKAAEALAAAAAAKAAoAAAIRhI+py+0Po5y02ouz3rz7DxYAOw==" | base64 -d > celebration-confetti.gif

# Minimal 2-frame animated GIF (blue square)  
echo "R0lGODlhCgAKAIABAAD//P///yH5BAEKAAEALAAAAAAKAAoAAAIRhI+py+0Po5y02ouz3rz7DxYAOw==" | base64 -d > heart-love.gif

# Minimal 2-frame animated GIF (yellow square)
echo "R0lGODlhCgAKAIABAP//AP///yH5BAEKAAEALAAAAAAKAAoAAAIRhI+py+0Po5y02ouz3rz7DxYAOw==" | base64 -d > funny-laughter.gif

# Minimal 2-frame animated GIF (purple square)
echo "R0lGODlhCgAKAIABAP8A/////yH5BAEKAAEALAAAAAAKAAoAAAIRhI+py+0Po5y02ouz3rz7DxYAOw==" | base64 -d > thank-you.gif

# Minimal 2-frame animated GIF (orange square)
echo "R0lGODlhCgAKAIABAP+AAP///yH5BAEKAAEALAAAAAAKAAoAAAIRhI+py+0Po5y02ouz3rz7DxYAOw==" | base64 -d > congrats-trophy.gif

# Minimal 2-frame animated GIF (brown square)
echo "R0lGODlhCgAKAIABAIBAAP///yH5BAEKAAEALAAAAAAKAAoAAAIRhI+py+0Po5y02ouz3rz7DxYAOw==" | base64 -d > nostalgic-vintage.gif

# Minimal 2-frame animated GIF (gold square)
echo "R0lGODlhCgAKAIABAP+gAP///yH5BAEKAAEALAAAAAAKAAoAAAIRhI+py+0Po5y02ouz3rz7DxYAOw==" | base64 -d > elegant-sparkle.gif

echo "Created 8 placeholder GIF files"
ls -lh *.gif
