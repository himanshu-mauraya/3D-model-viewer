# 3D Model Viewer - Testing Checklist

## ✅ Code Cleanup Completed
- ✓ Removed all `console.log` statements
- ✓ Removed unused imports (`Stats`, `useEffect`)
- ✓ Cleaned up debug code
- ✓ Optimized component performance

---

## 🧪 Features to Test

### 1. **Model Upload & Loading**
- [ ] Upload `.obj` file
- [ ] Upload `.glb` file
- [ ] Upload `.gltf` file
- [ ] Verify model appears centered
- [ ] Verify model is auto-scaled to fit viewport (~4 units)
- [ ] Check that blob URLs are cleaned up properly
- [ ] Verify no double models appear

### 2. **3D Shapes (Geometric)**
- [ ] Cube - loads and displays
- [ ] Sphere - loads and displays
- [ ] Cylinder - loads and displays
- [ ] Torus - loads and displays
- [ ] Cone - loads and displays
- [ ] Plane - loads and displays

### 3. **Camera Controls**
- [ ] **Orbit**: Click and drag to rotate view
- [ ] **Zoom**: Mouse wheel to zoom in/out
- [ ] **Pan**: Right-click and drag to pan
- [ ] **Reset Camera**: Button resets to initial position
- [ ] Grid helper visible and centered at origin

### 4. **Material Presets**
Test each artistic material on uploaded model:

#### ⚪ Standard PBR
- [ ] Default metalness (0.3) and roughness (0.7)
- [ ] Original colors preserved

#### 🕸️ Wireframe
- [ ] Shows wireframe edges only
- [ ] No fill, just outline

#### ⚙️ Liquid Metal
- [ ] High metalness (1.0)
- [ ] Low roughness (0.1)
- [ ] Environment reflections visible

#### 🌟 Neon Glow (Wireframe + Glow)
- [ ] Wireframe enabled
- [ ] Orbit blue color (#00D9FF)
- [ ] Emissive glow intensity (2.0)
- [ ] Bright electric blue appearance

#### 💎 Crystal/Low Poly
- [ ] Flat shading enabled
- [ ] Faceted appearance
- [ ] High metalness (0.8)
- [ ] Environment reflections

#### 🔵 Liquid Glass (Apple-style)
- [ ] Transparent (opacity 0.3)
- [ ] Clear reflections
- [ ] Transmission/refraction visible
- [ ] Clearcoat layer
- [ ] Subtle blue tint

#### 🎨 Toon Shader
- [ ] Flat shading
- [ ] Cartoon-like appearance

### 5. **Material Switching**
- [ ] Switch from Standard → Neon → verify clean transition
- [ ] Switch from Glass → Metallic → verify previous effects cleared
- [ ] Switch from Neon → Wireframe → verify glow removed
- [ ] All material properties reset properly between switches

### 6. **Transform Gizmo**
- [ ] Enable gizmo checkbox
- [ ] **Translate mode**: Move model with arrows
- [ ] **Rotate mode**: Rotate model with circles
- [ ] **Scale mode**: Scale model with boxes
- [ ] Gizmo disabled when checkbox unchecked

### 7. **Scene Management**
- [ ] Add multiple models (Add mode)
- [ ] Replace model (Replace mode)
- [ ] Delete individual models
- [ ] Switch between loaded models
- [ ] Reset scene clears all models

### 8. **Fullscreen Mode**
- [ ] Click "⛶ Fullscreen" button
- [ ] Viewer goes fullscreen
- [ ] Button changes to "🗗 Exit Fullscreen"
- [ ] Button color changes (blue → green)
- [ ] Press ESC to exit fullscreen
- [ ] Click button again to exit fullscreen

### 9. **Material Editor Panel**
For uploaded models with materials:
- [ ] Color picker changes model color
- [ ] Metalness slider (0-1) adjusts shininess
- [ ] Roughness slider (0-1) adjusts surface smoothness
- [ ] Wireframe checkbox toggles wireframe mode

### 10. **Environment & Lighting**
- [ ] Environment map loads (city preset)
- [ ] Reflections visible on metallic materials
- [ ] Ambient light illuminates scene
- [ ] Directional light casts shadows
- [ ] Point light provides fill lighting

### 11. **Performance**
- [ ] No frame rate drops during orbit
- [ ] Smooth zooming
- [ ] No lag when switching materials
- [ ] Models load without freezing UI
- [ ] Fullscreen transitions smoothly

### 12. **UI/UX**
- [ ] All buttons respond to hover
- [ ] Form inputs have proper labels (accessibility)
- [ ] Tooltips/tips are helpful
- [ ] Control panel scrollable when needed
- [ ] Responsive layout

---

## 🐛 Known Issues to Verify Fixed

- ✓ Double model rendering - FIXED with `userData.processed` flag
- ✓ Neon glow showing white instead of color - FIXED with orbit blue
- ✓ Glass not transparent - FIXED with MeshPhysicalMaterial
- ✓ Materials not resetting - FIXED with complete reset logic
- ✓ Form inputs missing labels - FIXED with htmlFor attributes
- ✓ Upload not working - FIXED with proper scene selection

---

## 🎯 Critical Test Scenarios

### Scenario 1: Upload → Customize → Export View
1. Upload a 3D model (.glb)
2. Apply "Liquid Glass" material
3. Adjust camera angle
4. Enter fullscreen
5. Verify glass looks realistic with reflections

### Scenario 2: Multiple Materials Test
1. Upload a model
2. Apply each material preset in sequence
3. Verify each transition is clean
4. Return to Standard
5. Verify original appearance restored

### Scenario 3: Shape Creation & Manipulation
1. Add a Sphere from Geometric Shapes
2. Enable Transform Gizmo
3. Move, rotate, and scale the sphere
4. Apply Neon Glow material
5. Verify orbit blue wireframe with glow

---

## 📊 Browser Compatibility
Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)

---

## ✨ Expected Behavior Summary

1. **Models load correctly** - centered, scaled, no duplicates
2. **Camera controls smooth** - orbit, zoom, pan work perfectly
3. **All materials work** - including neon glow and liquid glass
4. **Clean transitions** - switching materials clears previous effects
5. **Fullscreen works** - enters/exits properly
6. **No console errors** - clean console log
7. **Good performance** - smooth 60fps interaction

---

## 📝 Notes

- Grid helper: 20x20 units, helps visualize scale
- Auto-scale target: 4 units (models fit perfectly in viewport)
- Neon color: #00D9FF (bright electric blue)
- Glass IOR: 1.5 (realistic refraction)
- Environment: City HDRI preset for reflections
