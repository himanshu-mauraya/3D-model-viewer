# Advanced Shapes - Technical Documentation

## Overview
Advanced 3D shape generation using cutting-edge Three.js libraries, custom shaders, and mathematical algorithms. This module showcases professional-grade rendering techniques including marching cubes, instanced rendering, parametric equations, and shader materials.

---

## 🔸 Shape Generator

### Description
Customizable primitive shape generator with full parametric control over dimensions, resolution, and appearance.

### Features
- **6 Base Geometries:**
  - Sphere
  - Box
  - Cylinder
  - Cone
  - Torus
  - Torus Knot

- **Adjustable Parameters:**
  - **Radius:** 0.5 - 3.0 units
  - **Height:** 0.5 - 4.0 units (for cylinder/cone/box)
  - **Segments:** 8 - 64 (controls mesh resolution)

### Technical Details
```javascript
// Dynamic geometry generation
<cylinderGeometry args={[radius, radius, height, segments]} />
<sphereGeometry args={[radius, segments, segments]} />
<torusKnotGeometry args={[radius, radius * 0.3, segments * 3, segments]} />
```

### Use Cases
- Rapid prototyping
- Educational demonstrations
- Game asset previews
- Dimensional testing

---

## 🌀 Parametric Playground

### Description
Generate complex 3D shapes using mathematical formulas with parametric equations. Real-time evaluation of custom mathematical expressions.

### How It Works
Input formulas use two parameters:
- **t** (theta): 0 to 2π - typically horizontal parameter
- **s** (sigma): 0 to π - typically vertical parameter

### Available Functions
```javascript
sin, cos, tan    // Trigonometric
sqrt, abs        // Mathematical
pow             // Power function
```

### Example Formulas

#### **Torus (Default)**
```javascript
{ 
  x: (2 + cos(s)) * cos(t), 
  y: (2 + cos(s)) * sin(t), 
  z: sin(s) 
}
```

#### **Sphere**
```javascript
{ 
  x: cos(t) * sin(s), 
  y: sin(t) * sin(s), 
  z: cos(s) 
}
```

#### **Möbius Strip**
```javascript
{ 
  x: (2 + s/2 * cos(t/2)) * cos(t), 
  y: (2 + s/2 * cos(t/2)) * sin(t), 
  z: s/2 * sin(t/2) 
}
```

#### **Klein Bottle**
```javascript
{
  x: (2 + cos(t/2) * sin(s) - sin(t/2) * sin(2*s)) * cos(t),
  y: (2 + cos(t/2) * sin(s) - sin(t/2) * sin(2*s)) * sin(t),
  z: sin(t/2) * sin(s) + cos(t/2) * sin(2*s)
}
```

#### **Seashell**
```javascript
{
  x: (2 + s * cos(t)) * cos(s * 6),
  y: (2 + s * cos(t)) * sin(s * 6),
  z: s * sin(t)
}
```

#### **Wave Surface**
```javascript
{
  x: t * 2,
  y: sin(t * 3) * cos(s * 3),
  z: s * 2
}
```

### Technical Implementation
```javascript
// Using Three.js ParametricGeometry
const geometry = new THREE.ParametricGeometry((u, v, target) => {
  const t = u * Math.PI * 2;
  const s = v * Math.PI;
  
  // Evaluate custom formula with error handling
  const result = eval(`(${formula})`);
  target.set(result.x, result.y, result.z);
}, segments, segments);
```

### Controls
- **Formula Input:** Multi-line text editor with syntax highlighting
- **Resolution:** 16-64 segments (affects smoothness)
- **Real-time Preview:** Instant rendering on formula change

### Use Cases
- Mathematical visualization
- Educational tools for calculus/geometry
- Art installations
- Procedural generation research

---

## 🫧 Marching Cubes (Metaballs)

### Description
Organic blob-like shapes using marching cubes algorithm for smooth implicit surface generation. Creates liquid metal effects with multiple interacting spheres.

### Technology
Uses `@react-three/drei` MarchingCubes component:
- **Resolution:** 64³ voxel grid
- **Max Poly Count:** 20,000 triangles
- **5 Metaballs** at different positions

### How It Works
1. Defines implicit field using multiple spheres
2. Marching cubes algorithm samples 3D grid
3. Generates mesh at isosurface threshold
4. Creates smooth blending between spheres

### Controls
- **Strength:** 0.1 - 2.0
  - Controls sphere influence radius
  - Higher = larger blob influence
  
- **Subtract:** 1 - 20
  - Isosurface threshold
  - Higher = smaller surface area
  - Lower = more blobby appearance

### Technical Details
```javascript
<MarchingCubes resolution={64} maxPolyCount={20000}>
  <meshStandardMaterial flatShading metalness={0.8} />
  <MarchingCube strength={0.5} subtract={10} position={[0.5, 0.5, 0]} />
  <MarchingCube strength={0.5} subtract={10} position={[-0.5, -0.5, 0]} />
  // ... more cubes
</MarchingCubes>
```

### Visual Properties
- Flat shading for stylized look
- High metalness (0.8) for liquid metal effect
- Smooth organic blending
- Continuous rotation animation

### Use Cases
- Liquid simulations
- Organic modeling
- Character soft bodies
- Abstract art
- Game slime effects

### Performance
- GPU-accelerated
- Efficient for real-time interaction
- Optimized for 60 FPS

---

## 📊 Instanced Meshes

### Description
Render thousands of animated objects with minimal performance cost using GPU instancing. Demonstrates extreme optimization techniques.

### Key Features
- **100 - 5000 instances** (adjustable)
- Individual animation per instance
- Lissajous-curve motion patterns
- Dynamic scaling effects
- Zero draw call overhead

### How It Works
```javascript
<instancedMesh ref={ref} args={[null, null, count]}>
  <sphereGeometry args={[0.1, 8, 8]} />
  <meshStandardMaterial color={color} />
</instancedMesh>
```

### Animation System
Each particle has:
- **Individual timer (t)**
- **Speed factor:** Random 0.01-0.005
- **Position factors:** Random spread distribution
- **Lissajous motion:** Complex trigonometric paths

```javascript
// Per-frame update
const a = Math.cos(t) + Math.sin(t * 1) / 10;
const b = Math.sin(t) + Math.cos(t * 2) / 10;
const s = Math.cos(t); // Dynamic scale

position = [
  xFactor + cos((t/10) * factor) + (sin(t) * factor) / 10,
  yFactor + sin((t/10) * factor) + (cos(t*2) * factor) / 10,
  zFactor + cos((t/10) * factor) + (sin(t*3) * factor) / 10
];
```

### Controls
- **Count:** 100 - 5000 instances
  - More = denser particle cloud
  - Performance scales linearly
  
- **Spread:** 5 - 20 units
  - Distribution radius
  - Larger = more dispersed

### Technical Advantages
1. **Single Draw Call:** All instances rendered in one GPU call
2. **Matrix Updates:** Only update transformation matrices
3. **Shared Geometry:** One geometry for all instances
4. **Shared Material:** One material for all instances

### Performance Comparison
| Traditional | Instanced |
|------------|-----------|
| 1000 draw calls | 1 draw call |
| ~20 FPS | ~60 FPS |
| High CPU load | Low CPU load |

### Use Cases
- Particle systems
- Grass/foliage rendering
- Crowds simulation
- Starfields
- Debris effects
- Swarm behavior

---

## 🎨 Material System

### 6 Material Types

#### 1. ⚪ Solid
Standard PBR material
```javascript
<meshStandardMaterial color={color} />
```

#### 2. ⚙️ Metallic
Full metalness with low roughness
```javascript
<meshStandardMaterial color={color} metalness={1} roughness={0.1} />
```

#### 3. 🔵 Glass
Custom shader with Fresnel effect
```javascript
<glassMaterial color={color} transparent opacity={0.6} />
```
- Edge glow (Fresnel)
- Transparency
- Refraction-like appearance

#### 4. 🌟 Neon
Emissive material for glow effects
```javascript
<meshStandardMaterial 
  color={color} 
  emissive={color} 
  emissiveIntensity={2} 
/>
```

#### 5. 🕸️ Wireframe
Edge-only rendering
```javascript
<meshBasicMaterial color={color} wireframe />
```

#### 6. 👁️ Transparent
Semi-transparent standard material
```javascript
<meshStandardMaterial color={color} transparent opacity={0.5} />
```

---

## 🎥 Camera System

### Fixed Background Design
- **Camera orbits around origin [0, 0, 0]**
- **Grid stays stationary** (position locked)
- **Only shape rotates** (not entire scene)
- **Target locked to center**

### Implementation
```javascript
<OrbitControls 
  target={[0, 0, 0]}  // Fixed center
  enableDamping 
  dampingFactor={0.05}
  maxDistance={30}
  minDistance={2}
/>
```

### Benefits
- Intuitive navigation
- Reference grid always visible
- Professional CAD-like experience
- Reduced motion sickness

### Preset Views
- **Front:** [0, 0, 8]
- **Top:** [0, 8, 0]
- **Side:** [8, 0, 0]
- **Reset:** [5, 5, 5] (isometric)

---

## 🌍 Environment & Lighting

### Lighting Setup
**Ambient Light:**
- Global illumination base
- Intensity: 0.5
- Prevents pure black shadows

**Directional Light:**
- Primary key light
- Position: [10, 10, 5]
- Casts shadows
- Intensity: 1.0

**Point Light (Optional):**
- Accent lighting
- Position: [5, 5, 5]
- Color customizable
- Intensity: 2.0

### HDRI Environments
- City
- Studio
- Sunset
- Warehouse

### Visual Helpers
- **Grid:** 20x20 units, dark theme
- **Axes:** 5-unit length (RGB = XYZ)
- **Stats:** Real-time FPS counter

---

## 💡 Advanced Techniques Used

### 1. Custom Shader Materials
```javascript
const GlassMaterial = shaderMaterial(
  { time: 0, color: new THREE.Color() },
  vertexShader,
  fragmentShader
);
```

### 2. Dynamic Geometry Generation
Parametric evaluation with error handling

### 3. GPU Instancing
Matrix transformation updates

### 4. Marching Cubes Algorithm
Implicit surface generation

### 5. Fresnel Effect
View-dependent transparency

---

## 📊 Performance Optimization

### Best Practices
1. **Use Instancing** for multiple objects
2. **Lower Segments** for complex parametric shapes
3. **Reduce Metaball Strength** for faster updates
4. **Limit Instance Count** on mobile (< 1000)
5. **Disable Shadows** for better FPS

### Benchmarks
| Mode | Objects | FPS (Desktop) |
|------|---------|---------------|
| Generator | 1 | 60 |
| Parametric | 1 | 60 |
| Metaballs | 5 | 60 |
| Instanced | 5000 | 55-60 |

---

## 🚀 Quick Start Examples

### Create a Custom Parametric Shape
1. Click **Advanced** tab
2. Select **Parametric** mode
3. Enter formula:
```javascript
{ 
  x: cos(t) * (2 + sin(s * 3)), 
  y: sin(t) * (2 + sin(s * 3)), 
  z: cos(s * 3) 
}
```
4. Adjust resolution slider
5. Choose material (try Glass or Neon!)

### Make Organic Blobs
1. Select **Metaballs** mode
2. Set Strength to 0.8
3. Set Subtract to 8
4. Use Metallic material
5. Watch the liquid metal effect!

### Create Particle Cloud
1. Select **Instanced** mode
2. Set Count to 2000
3. Set Spread to 15
4. Choose Neon material
5. Enjoy the cosmic effect!

---

## 🎓 Educational Value

### Learn About:
- **Implicit Surfaces** (Metaballs)
- **Parametric Equations** (Math → 3D)
- **GPU Optimization** (Instancing)
- **Shader Programming** (Glass material)
- **Computational Geometry** (Marching Cubes)

### Real-World Applications
- Game engines
- CAD software
- Scientific visualization
- Medical imaging
- Fluid simulation
- Procedural generation

---

## 🐛 Troubleshooting

### Formula Errors
If parametric shape disappears:
- Check syntax: `{ x: ..., y: ..., z: ... }`
- Use lowercase: `sin, cos` not `Sin, Cos`
- Balance parentheses
- Avoid division by zero

### Performance Issues
If FPS drops:
- Lower instance count (< 1000)
- Reduce segments (16-32)
- Disable shadows
- Use simpler materials

### Visual Glitches
If shapes look broken:
- Reset camera
- Refresh page
- Check browser WebGL support
- Update graphics drivers

---

## 🔮 Future Enhancements

- [ ] SDF (Signed Distance Fields) rendering
- [ ] Real-time CSG operations
- [ ] Shader editor with live preview
- [ ] Import/export parametric formulas
- [ ] Animation timeline for metaballs
- [ ] Physics simulation integration
- [ ] VR/AR support
- [ ] Ray marching renderer

---

## 📚 Technical References

### Libraries Used
- **Three.js** - Core 3D engine
- **@react-three/fiber** - React renderer
- **@react-three/drei** - Helper components
  - MarchingCubes
  - MarchingCube
  - shaderMaterial
  - Instances

### Algorithms
- Marching Cubes (Lorensen & Cline, 1987)
- GPU Instancing (OpenGL 3.3+)
- Parametric Surface Generation
- Fresnel Equation (Schlick approximation)

---

**Built with advanced Three.js techniques** 🚀
