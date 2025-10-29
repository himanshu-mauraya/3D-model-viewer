# 3D Visualizer II - Quick Start Guide

## 🚀 Getting Started

### Installation & Run
```bash
cd 3d-model-viewer/frontend
npm install
npm run dev
```

Open browser to the URL shown (typically `http://localhost:5173`)

---

## 📑 5 Main Sections

### 1. 📁 Models Tab
**Upload and view 3D models**

✅ **Quick Actions:**
- Drag & drop `.glb`, `.gltf`, or `.obj` files
- Click uploaded models to view
- Switch to **Materials** tab to edit colors

---

### 2. 🔷 Shapes Tab
**Basic geometric primitives**

✅ **Quick Actions:**
- Select shape from dropdown (Cube, Sphere, Torus, etc.)
- Adjust color with color picker
- Toggle wireframe mode
- Modify metalness and roughness sliders

🎓 **Best For:** Learning, prototyping, physics prep

---

### 3. ✨ Artistic Tab
**Stylized visual effects**

✅ **Quick Actions:**
1. **Liquid Metal:** Adjust animation speed
2. **Wireframe:** Choose base geometry
3. **Crystal:** Set emissive color and glow
4. **Neon Grid:** Control grid size

🎨 **Pro Tip:** Try low ambient light (0.1) with high point lights (3.0) for dramatic neon effects!

---

### 4. 🚀 Advanced Tab
**Professional techniques**

#### Mode: Shape Generator
- Choose base shape (Sphere, Box, Cylinder, etc.)
- Adjust radius, height, segments
- Try different materials

#### Mode: Parametric Playground
**Create shapes from math formulas!**

Example formulas to try:

**Torus (default):**
```javascript
{ x: (2 + cos(s)) * cos(t), y: (2 + cos(s)) * sin(t), z: sin(s) }
```

**Sphere:**
```javascript
{ x: cos(t) * sin(s), y: sin(t) * sin(s), z: cos(s) }
```

**Seashell:**
```javascript
{ x: (2 + s * cos(t)) * cos(s * 6), y: (2 + s * cos(t)) * sin(s * 6), z: s * sin(t) }
```

**Wave:**
```javascript
{ x: t * 2, y: sin(t * 3) * cos(s * 3), z: s * 2 }
```

#### Mode: Metaballs
- Organic blob shapes
- Adjust **Strength** for blob size
- Lower **Subtract** for more blobby look
- Use **Metallic** material for liquid metal effect

#### Mode: Instanced Meshes
- Render thousands of objects
- Increase **Count** for denser clouds (watch FPS!)
- Adjust **Spread** for distribution
- Try **Neon** material for cosmic effect

---

### 5. 🎨 Materials Tab
**Edit model materials** (only active when model loaded)

- Color picker per material
- Metalness slider (0 = matte, 1 = mirror)
- Roughness slider (0 = smooth, 1 = rough)

---

## 🎨 6 Material Types (Advanced Tab)

| Material | Effect | Best Use |
|----------|--------|----------|
| ⚪ Solid | Standard PBR | General purpose |
| ⚙️ Metallic | Full reflections | Robots, machinery |
| 🔵 Glass | Fresnel transparency | Windows, gems |
| 🌟 Neon | Emissive glow | Sci-fi, signs |
| 🕸️ Wireframe | Edge-only | Technical views |
| 👁️ Transparent | Semi-transparent | Ghosts, x-ray |

---

## 📷 Camera Controls

### Mouse Controls
- **Orbit:** Left-click + drag
- **Pan:** Right-click + drag
- **Zoom:** Scroll wheel

### Preset Buttons
- **Front/Back/Top/Side:** Standard orthogonal views
- **Angle:** Artistic 45° view
- **Reset:** Return to default isometric

---

## 💡 Lighting Tips

### For Realistic Look:
- Ambient: 0.5
- Directional: 1.0
- Point: Off or very low

### For Dramatic Effect:
- Ambient: 0.1-0.2
- Directional: 0.5
- Point: 2.0-3.0 (colored)

### For Neon/Cyberpunk:
- Ambient: 0.3
- Directional: Off
- Point 1: Cyan (#00ffff) at 2.0
- Point 2: Magenta (#ff00ff) at 2.0

---

## 🌍 Environment Presets

| Environment | Effect |
|-------------|--------|
| City | Urban HDRI, neutral |
| Studio | Clean, bright |
| Sunset | Warm, orange tones |
| Night | Dark, cool tones |
| Warehouse | Industrial, metallic |

**Tip:** Environment affects reflections on metallic/glass materials!

---

## ⚡ Performance Tips

### If FPS is low:
1. **Lower segments** (Advanced > Generator or Parametric)
2. **Reduce instance count** (Advanced > Instanced)
3. **Disable shadows**
4. **Use simpler materials** (Solid instead of Glass)
5. **Close other browser tabs**

### Performance by Mode:
- Models: Depends on file size
- Shapes: Always 60 FPS ✅
- Artistic: 55-60 FPS ✅
- Advanced Generator: 60 FPS ✅
- Advanced Parametric: 50-60 FPS (depends on resolution)
- Advanced Metaballs: 60 FPS ✅
- Advanced Instanced: 
  - <1000: 60 FPS ✅
  - 1000-3000: 55-60 FPS
  - 3000-5000: 45-55 FPS

---

## 🎯 Quick Tasks

### "I want to visualize a math equation"
1. Go to **Advanced** tab
2. Select **Parametric** mode
3. Input formula: `{ x: ..., y: ..., z: ... }`
4. Adjust resolution slider
5. Try **Glass** or **Neon** material

### "I want to create organic blobs"
1. Go to **Advanced** tab
2. Select **Metaballs** mode
3. Set Strength to 0.6-0.8
4. Set Subtract to 6-10
5. Use **Metallic** material

### "I want thousands of particles"
1. Go to **Advanced** tab
2. Select **Instanced** mode
3. Set Count to 2000+
4. Set Spread to 12-15
5. Use **Neon** material
6. Environment: **Night**

### "I want a neon cyberpunk look"
1. Any tab works (try **Artistic** > Neon Grid)
2. Color: Cyan or Magenta
3. Material: **Neon**
4. Lights:
   - Ambient: 0.2
   - Point 1: Cyan, 2.5
   - Point 2: Magenta, 2.5
5. Environment: **Night**

### "I want to learn 3D modeling"
1. Start with **Shapes** tab
2. Try each shape
3. Adjust metalness and roughness
4. Use camera presets to view all angles
5. Move to **Advanced** > Generator for more control

---

## 🐛 Troubleshooting

### Parametric shape disappeared
- Check formula syntax: `{ x: ..., y: ..., z: ... }`
- Use lowercase: `sin` not `Sin`
- Balance parentheses
- Avoid division by zero

### Model won't load
- Check file format: `.glb`, `.gltf`, or `.obj` only
- File size: Keep under 50MB
- Refresh page and try again

### Shapes look weird
- Click **Reset Camera** button
- Refresh browser
- Check WebGL support: Visit `webglreport.com`

### Performance is slow
- Check Stats panel (top-left)
- Lower settings (see Performance Tips above)
- Close other applications
- Update graphics drivers

---

## 🎓 Learning Path

### Beginner
1. **Week 1:** Explore Shapes tab
2. **Week 2:** Try Artistic tab
3. **Week 3:** Upload first model
4. **Week 4:** Experiment with materials

### Intermediate
1. **Advanced > Generator:** Master parameters
2. **Advanced > Metaballs:** Create organic shapes
3. Learn lighting techniques
4. Experiment with environments

### Advanced
1. **Parametric equations:** Math to 3D
2. **Instancing:** Optimize performance
3. Custom formulas (Möbius, Klein bottle)
4. Combine techniques creatively

---

## 📚 Example Projects

### Project 1: Solar System
1. **Shapes** tab
2. Create Sphere
3. Adjust radius for different planets
4. Use different colors
5. Environment: **Night**

### Project 2: Parametric Art
1. **Advanced** > Parametric
2. Try seashell formula
3. Material: **Glass**
4. Environment: **Sunset**
5. Take screenshots!

### Project 3: Particle Galaxy
1. **Advanced** > Instanced
2. Count: 3000
3. Spread: 15
4. Material: **Neon**
5. Color: Cyan or Purple
6. Environment: **Night**

### Project 4: Liquid Metal Animation
1. **Artistic** tab
2. Select Liquid Metal Blob
3. Speed: 3.0
4. Metalness: 0.9
5. Roughness: 0.1
6. Environment: **City**

---

## ⌨️ Keyboard Shortcuts

*Currently mouse-only, but planned:*
- [ ] `Space` - Rotate shape
- [ ] `R` - Reset camera
- [ ] `1-5` - Switch tabs
- [ ] `M` - Toggle materials panel
- [ ] `G` - Toggle grid

---

## 🎥 Camera Tips

### For Screenshots
1. Use preset views (Front, Top, etc.)
2. Adjust lighting carefully
3. Hide UI (future feature)
4. High-quality environments

### For Presentations
1. Start with **Reset** view
2. Slowly orbit to show all angles
3. Use **Angle** view for artistic shots
4. Grid/axes help spatial understanding

---

## 💎 Pro Tips

1. **Glass material** looks best with **Environment** enabled
2. **Neon material** shines in **Night** environment
3. **Parametric shapes** need higher resolution for smoothness
4. **Instanced mode** is perfect for demos (wow factor!)
5. **Metaballs Strength 0.5, Subtract 10** = perfect balance
6. Combine **Crystal** (Artistic) with **Night** for gem effect
7. Use **Wireframe** for technical/blueprint presentations
8. **Stats panel** shows if you're GPU-bound
9. Lower **ambient light** increases drama
10. **Dual-colored point lights** create cyberpunk vibes

---

## 🆘 Need Help?

### Check Documentation
- `GEOMETRIC_SHAPES_README.md` - Primitives guide
- `ARTISTIC_FORMS_README.md` - Artistic effects
- `ADVANCED_SHAPES_README.md` - Professional techniques
- `FEATURES_SUMMARY.md` - Complete overview

### Common Questions

**Q: Can I export shapes?**
A: Not yet, planned feature

**Q: Can I animate?**
A: Some modes auto-animate, timeline coming soon

**Q: Mobile support?**
A: Yes, but limited. Desktop recommended.

**Q: VR support?**
A: Planned for future

---

## 🎉 Have Fun!

Experiment, break things, discover new combinations. The best way to learn is to play!

**Share your creations! 🚀**

---

**Quick Reference Card**

```
TABS:           Models | Shapes | Artistic | Advanced | Materials
MOUSE:          Left=Orbit | Right=Pan | Scroll=Zoom
BEST EFFECTS:   Neon+Night | Glass+Sunset | Metallic+City
PERFORMANCE:    Lower segments | Reduce instances | Simpler materials
MATH:           Parametric mode | Variables: t, s | Functions: sin, cos
```

---

*Built with React Three Fiber • Powered by Three.js • Made for creators* ✨
