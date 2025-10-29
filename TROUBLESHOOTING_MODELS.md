# 🔧 Troubleshooting: Models & Artistic Materials

## Issue: Cube Showing / Artistic Materials Not Working

### What to Check

---

## 🔍 Step 1: Check Browser Console

**Open DevTools (F12) and look for:**

1. **OBJ Loading Messages:**
```
✅ "OBJ loaded successfully"
✅ "Found mesh: [name]"
✅ "Material map: {...}"
```

2. **Error Messages:**
```
❌ "Error loading OBJ"
❌ "Could not determine file extension"
❌ "Unsupported file type"
```

3. **Artistic Material Messages:**
```
✅ "Applying artistic material type: neon"
✅ "Processing mesh: [name]"
✅ "Applying neon"
✅ "Artistic material applied successfully"
```

---

## 🎨 Step 2: Test Sequence

### Test 1: Upload OBJ File
```
1. Open http://localhost:3000
2. Go to MODELS tab
3. Drag an .obj file into dropzone
4. Check console for "OBJ loaded successfully"
5. Click on the model name in list
6. EXPECTED: Model appears (gray)
7. ACTUAL: ___________
```

### Test 2: Check Loading State
```
1. When uploading, you should see:
   - Blue cube = Loading (normal)
   - Gray model = Loaded successfully
   - Red cube = Error occurred
```

### Test 3: Apply Artistic Materials
```
1. Load a model (should show gray)
2. Go to MATERIALS tab
3. Select "Wireframe" from dropdown
4. Check console for "Applying wireframe"
5. EXPECTED: Model shows as wireframe
6. ACTUAL: ___________
```

### Test 4: Try Different Materials
```
Try each artistic material:
- ⚪ Standard → Gray model
- 🕸️ Wireframe → Edges only
- ⚙️ Liquid Metal → Reflective
- 🌟 Neon Glow → Self-illuminated
- 💎 Crystal → Faceted
- 🔵 Glass → Transparent
- 🎨 Toon → Flat shaded
```

---

## 🐛 Common Problems & Solutions

### Problem 1: Red Cube Appears

**Cause:** Loading error

**Check Console For:**
```javascript
"Error loading OBJ: [error message]"
```

**Solutions:**
1. File might be corrupted
2. File path issue (check blob: URL)
3. File too large
4. File format incorrect

**Try:**
```
- Export OBJ again from 3D software
- Try a simple cube.obj first
- Check file size (< 50MB)
- Ensure file ends with .obj
```

---

### Problem 2: Blue Cube Stays Forever

**Cause:** Model stuck in loading state

**Solutions:**
1. Hard refresh: Ctrl + Shift + R
2. Clear browser cache
3. Check network tab for blocked requests
4. File might be too large

---

### Problem 3: Gray Model Shows But No Artistic Materials

**Check Console:**
```
Should see: "Applying artistic material type: [type]"
If not seeing this, materials aren't triggering
```

**Solutions:**

**Option A: Model Not Selected**
```
1. Go to MATERIALS tab
2. Make sure a model is loaded and selected
3. Dropdown should be visible at top
4. Select different material type
```

**Option B: JavaScript Error**
```
1. Check console for red errors
2. Look for "Cannot read property" errors
3. If errors present, copy and report them
```

**Option C: State Not Updating**
```
1. Try clicking different tabs
2. Come back to MATERIALS tab
3. Try selecting material again
```

---

### Problem 4: Model Loads but Looks Wrong

**Symptoms:**
- All black
- Inside out
- Invisible faces

**Solutions:**

**For Black Model:**
```
1. Increase Ambient Light to 0.8
2. Enable Directional Light
3. Try "Studio" environment
4. Model needs lighting to be visible
```

**For Inside-Out:**
```
1. Double-sided rendering should fix this
2. If not, re-export with correct normals
3. In Blender: Mesh → Normals → Recalculate Outside
```

**For Invisible Faces:**
```
1. This is now fixed with double-sided rendering
2. If still happening, check console errors
3. Try different OBJ file
```

---

## 📋 Diagnostic Checklist

Run through this checklist:

- [ ] Browser console open (F12)
- [ ] Application running (no build errors)
- [ ] File uploaded successfully (shows in list)
- [ ] Model clicked (highlighted in list)
- [ ] Console shows "OBJ loaded successfully"
- [ ] Console shows "Material map" object
- [ ] Model visible in 3D viewer (not cube)
- [ ] MATERIALS tab accessible
- [ ] Artistic dropdown visible at top
- [ ] Can select different material types
- [ ] Console shows "Applying [type]"
- [ ] Visual change occurs when changing materials

**How many checkmarks? ___ / 12**

---

## 🧪 Test with Known Good File

Create a simple test OBJ file:

**cube.obj**
```obj
# Simple Cube for Testing
v 0.0 0.0 0.0
v 1.0 0.0 0.0
v 1.0 1.0 0.0
v 0.0 1.0 0.0
v 0.0 0.0 1.0
v 1.0 0.0 1.0
v 1.0 1.0 1.0
v 0.0 1.0 1.0

f 1 2 3 4
f 5 6 7 8
f 1 2 6 5
f 2 3 7 6
f 3 4 8 7
f 4 1 5 8
```

**Steps:**
1. Save as `cube.obj`
2. Upload to visualizer
3. Should load as gray cube
4. Try artistic materials
5. Should work perfectly

---

## 💻 Console Commands for Debugging

Open console and try:

**Check if model loaded:**
```javascript
// Should show the model reference
console.log('Model ref:', modelRef.current);
```

**Check materials:**
```javascript
// Check what materials are detected
console.log('Materials:', currentScene?.materials);
```

**Check artistic type:**
```javascript
// Check current artistic material type
console.log('Artistic type:', currentScene?.artisticMaterialType);
```

---

## 🔄 Reset Everything

If nothing works, try full reset:

1. **Stop Server:**
```bash
Ctrl + C in terminal
```

2. **Clear Cache:**
```bash
npm run dev
# Then in browser: Ctrl + Shift + R
```

3. **Re-upload Model:**
- Delete all models
- Upload fresh copy
- Test again

---

## 📸 What to Report

If still not working, provide:

1. **Console Output** (copy entire console)
2. **File Type** (.obj, .glb, .gltf)
3. **File Size** (in MB)
4. **Cube Color** (red, blue, or gray)
5. **Browser** (Chrome, Firefox, Edge)
6. **Steps Tried** (from checklist above)

---

## ✅ Expected Working Behavior

### Upload Flow:
```
1. Drag .obj file
2. Blue cube appears (loading)
3. Model loads → Blue cube becomes gray model
4. Click model name → Model shows in viewer
5. Go to MATERIALS tab
6. Select "Neon Glow"
7. Console: "Applying neon"
8. Model glows with emissive light
```

### Material Changes:
```
Standard → Wireframe:
  - Console: "Applying wireframe"
  - Visual: Model shows edges only

Wireframe → Metallic:
  - Console: "Applying metallic"
  - Visual: Model becomes chrome-like

Metallic → Neon:
  - Console: "Applying neon"
  - Visual: Model glows

etc...
```

---

## 🚨 Known Issues

### Issue: Nested Suspense
- Two Suspense boundaries (outer + model)
- Should not cause problems
- Blue cube = inner loading fallback

### Issue: Material State Timing
- Materials apply after model loads
- Small delay is normal
- Should see console logs when it happens

### Issue: OBJ Format Variations
- Some OBJ exporters create invalid files
- Try exporting with different settings
- Ensure "Export Normals" is checked

---

## 🔧 Quick Fixes

### Fix 1: Force Material Update
```javascript
// After selecting material, if not applying:
1. Switch to different tab
2. Switch back to MATERIALS
3. Select material again
```

### Fix 2: Hard Reload
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Fix 3: Clear Local Storage
```javascript
// In console:
localStorage.clear();
// Then refresh
```

### Fix 4: Try Different Browser
```
Chrome → Firefox
Edge → Chrome
Test if browser-specific issue
```

---

## 📊 Status Indicators

### Cube Colors:
| Color | Meaning | Action |
|-------|---------|--------|
| 🔵 Blue | Loading | Wait (should be quick) |
| ⚪ Gray | Loaded | Success! Apply materials |
| 🔴 Red | Error | Check console, try different file |

### Console Messages:
| Message | Status |
|---------|--------|
| "OBJ loaded successfully" | ✅ Good |
| "Found mesh" | ✅ Good |
| "Material map" | ✅ Good |
| "Applying [type]" | ✅ Good |
| "Error loading OBJ" | ❌ Problem |
| "ModelRef not ready" | ⚠️ Wait |

---

## 🎯 Final Checklist

Before reporting as broken:

- [ ] Tried hard refresh (Ctrl+Shift+R)
- [ ] Checked console for errors
- [ ] Tried simple test cube
- [ ] Tried different browser
- [ ] Cleared cache
- [ ] Server is running
- [ ] File is valid .obj format
- [ ] Model shows in list after upload
- [ ] Clicked on model to load it
- [ ] Went to MATERIALS tab (not Models)
- [ ] Artistic dropdown is visible
- [ ] Tried multiple material types
- [ ] Checked console after each selection

---

**If all checklist items are ✅ and still not working, there may be a code issue that needs fixing.**

*Last Updated: October 2025*
