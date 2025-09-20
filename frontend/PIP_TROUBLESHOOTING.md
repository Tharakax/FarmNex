# 🎥 Picture-in-Picture Troubleshooting Guide

## ✅ How to Test PiP Functionality

### Step 1: Navigate to a Training Video
1. Open your browser to `http://localhost:5174/`
2. Go to any training material with a video
3. Start playing the video first (this is important!)

### Step 2: Activate Picture-in-Picture
1. Look for the **PiP button** (📺 icon) in the video controls (bottom-right)
2. Click the PiP button
3. **Watch for these indicators:**
   - Button will turn red and glow
   - "Look for floating window!" tooltip appears
   - Red notification box appears in top-right of video
   - Console message: "🎥 Picture-in-Picture activated!"

### Step 3: Find Your PiP Window
The floating video window should appear in the **bottom-right corner** of your screen. If you can't see it:

#### Check These Locations:
- **Bottom-right corner** of your primary monitor
- **Behind other windows** (Alt+Tab to cycle through windows)
- **On secondary monitors** if you have multiple screens
- **Minimized to taskbar** (check for video thumbnail)

## 🔧 If PiP Window Is Not Visible

### Method 1: Use Windows Task Manager
1. Press `Ctrl + Shift + Esc`
2. Look for a process related to your browser with video
3. Right-click and "Bring to front" or "Restore"

### Method 2: Check Alt+Tab
1. Press `Alt + Tab` 
2. Look for a small video window in the switcher
3. Release on the video window to focus it

### Method 3: Check Browser Settings
1. **Chrome:** `chrome://settings/content/pictureInPicture`
2. **Edge:** `edge://settings/content/pictureInPicture`
3. Make sure PiP is **allowed** for your site

### Method 4: Browser Console Check
1. Press `F12` to open Developer Tools
2. Click **Console** tab
3. Look for these messages:
   - ✅ "🎥 Picture-in-Picture activated! Look for the floating video window."
   - ✅ "PiP window created: [object]"
   - ✅ "Positioning PiP window: 400x225 on screen 1920x1080"
   - ✅ "PiP window positioned at: 1490, 835"

## 🚨 Common Issues & Solutions

### Issue: "Picture-in-Picture failed" Error
**Solutions:**
1. **Make sure video is playing first** - PiP only works on active videos
2. **Try refreshing the page**
3. **Close other PiP windows** - only one PiP per browser
4. **Update your browser** - older versions may not support PiP

### Issue: PiP Window Too Small/Large
The window should auto-size to 25% of your screen width. If not:
1. **Manually resize** the PiP window by dragging corners
2. **Check screen resolution** in Windows display settings

### Issue: PiP Window in Wrong Position
The window should appear bottom-right. If not:
1. **Drag the window** to your preferred location
2. **Check for multiple monitors** - it might be on the wrong screen

### Issue: PiP Button Not Visible
1. **Check browser support** - Chrome 70+, Edge 79+, Safari 13.1+
2. **Firefox** doesn't support PiP API yet
3. **Try a different browser**

## 🖥️ Browser Support Matrix

| Browser | Version | PiP Support | Window Control |
|---------|---------|-------------|----------------|
| Chrome  | 70+     | ✅ Full     | ✅ Position/Size |
| Edge    | 79+     | ✅ Full     | ✅ Position/Size |
| Safari  | 13.1+   | ✅ Full     | ⚠️ Limited     |
| Firefox | Any     | ❌ None     | ❌ None        |

## 🎮 How to Use PiP Once Working

1. **Move Window:** Drag the PiP window anywhere on screen
2. **Resize Window:** Drag corners to resize (if browser allows)
3. **Control Playback:** Click on PiP window to play/pause
4. **Return to Main Player:** Click the PiP button again (it will be red/glowing)
5. **Close PiP:** Click X on the floating window

## 📞 Still Having Issues?

### Check Browser Console for Errors:
```javascript
// Look for these error types:
// InvalidStateError - Video must be playing first
// NotSupportedError - Browser doesn't support PiP
// NotAllowedError - PiP blocked by browser settings
```

### Test with Different Videos:
- Try different video files
- Test with different browsers
- Check if issue is specific to certain videos

### System Requirements:
- **Windows 10** version 1903+ recommended
- **Hardware acceleration** enabled in browser
- **Up-to-date graphics drivers**

## ✨ Expected Behavior When Working:

1. 🎬 Click PiP button → Video immediately pops out to floating window
2. 📍 Window appears in bottom-right corner of screen  
3. 🎮 You can drag, resize, and control the floating video
4. 🔄 Click PiP button again → Video returns to main player
5. 📺 Multiple visual indicators confirm PiP is active

---

**Remember:** The video MUST be playing before you can activate Picture-in-Picture!