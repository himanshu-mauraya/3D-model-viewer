# Geometric Shapes Feature

## Overview
Added interactive geometric primitive shapes to the 3D visualizer, perfect for learning, demos, and physics simulation.

## Available Shapes

### Basic Shapes
1. **Cube** - Equal length on all sides
2. **Cuboid** - Box shape with unequal sides
3. **Sphere** - Perfect round ball
4. **Cylinder** - Circular base, straight height
5. **Cone** - Circular base, pointed top
6. **Torus** - Donut shape
7. **Pyramid** - Polygon base + triangular faces

### Prism Shapes
8. **Triangular Prism** - Elongated shape with triangle bases
9. **Hexagonal Prism** - Elongated shape with hexagon bases

## Features

### Material Controls
- **Color Picker**: Choose any color for your shape
- **Metalness**: Adjust the metallic appearance (0-1)
- **Roughness**: Control surface smoothness (0-1)
- **Wireframe Mode**: Toggle wireframe rendering

### Camera Controls
- **Preset Views**: Front, Back, Left, Right, Top, Bottom
- **Reset Camera**: Return to default isometric view
- **Interactive Controls**: Orbit, pan, and zoom with mouse

### Lighting System
- **Ambient Light**: Global illumination with intensity control
- **Directional Light**: Sun-like lighting from a specific direction
- **Point Light**: Localized light source with falloff

### Environment
- Multiple HDRI environment presets:
  - Apartment, City, Dawn, Forest, Lobby
  - Night, Park, Studio, Sunset, Warehouse

### Visual Helpers
- **Grid Helper**: 10x10 grid for spatial reference
- **Axes Helper**: X (red), Y (green), Z (blue) coordinate axes
- **Performance Stats**: FPS and render statistics

## Usage

1. **Access Shapes**: Click the "Shapes" tab in the sidebar
2. **Select Shape**: Choose from the dropdown menu
3. **Customize**: Adjust material properties, lighting, and environment
4. **Navigate**: Use camera presets or drag with mouse to view from different angles

## Technical Details

### Component Structure
- **GeometricShapes.jsx**: Main component with UI and 3D canvas
- **GeometricShape**: Individual shape renderer using Three.js geometries
- **CameraControls**: Orbit controls with preset view management

### Integration
- Integrated into main App.jsx with dedicated tab
- Uses React Three Fiber and drei helpers
- Shares styling system with existing components

### Shape Geometries
All shapes are created using Three.js BufferGeometry:
- BoxGeometry for cubes and cuboids
- SphereGeometry for spheres
- CylinderGeometry for cylinders and prisms
- ConeGeometry for cones and pyramids
- TorusGeometry for torus shapes

## Use Cases

1. **Education**: Learn 3D geometry and spatial relationships
2. **Prototyping**: Quick mockups for game design or architecture
3. **Physics Simulation**: Test collision detection and dynamics
4. **Visual Testing**: Experiment with materials and lighting
5. **Demonstrations**: Present 3D concepts without loading external models

## Future Enhancements
- Export shapes as 3D model files (GLTF/OBJ)
- Custom dimensions for each shape
- Shape combinations and CSG operations
- Texture mapping support
- Animation controls
