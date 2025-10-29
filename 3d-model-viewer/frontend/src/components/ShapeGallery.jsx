import { useMemo } from 'react';
import * as THREE from 'three';

const ShapeGallery = ({ onSelectShape }) => {
  const shapes = useMemo(() => [
    {
      id: 'cube',
      name: 'Cube',
      description: 'Equal length on all sides',
      icon: '⬜',
      createGeometry: () => new THREE.BoxGeometry(1, 1, 1)
    },
    {
      id: 'cuboid',
      name: 'Cuboid',
      description: 'Box shape with unequal sides',
      icon: '📦',
      createGeometry: () => new THREE.BoxGeometry(1.5, 1, 0.8)
    },
    {
      id: 'sphere',
      name: 'Sphere',
      description: 'Perfect round ball',
      icon: '⚪',
      createGeometry: () => new THREE.SphereGeometry(0.7, 32, 32)
    },
    {
      id: 'cylinder',
      name: 'Cylinder',
      description: 'Circular base, straight height',
      icon: '🛢️',
      createGeometry: () => new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32)
    },
    {
      id: 'cone',
      name: 'Cone',
      description: 'Circular base, pointed top',
      icon: '🔺',
      createGeometry: () => new THREE.ConeGeometry(0.7, 1.5, 32)
    },
    {
      id: 'torus',
      name: 'Torus',
      description: 'Donut shape',
      icon: '🍩',
      createGeometry: () => new THREE.TorusGeometry(0.6, 0.2, 16, 100)
    },
    {
      id: 'pyramid',
      name: 'Pyramid',
      description: 'Square base + triangular faces',
      icon: '🔺',
      createGeometry: () => new THREE.ConeGeometry(0.8, 1.5, 4, 1, true)
    },
    {
      id: 'triangularPrism',
      name: 'Triangular Prism',
      description: 'Elongated triangular shape',
      icon: '🔺',
      createGeometry: () => {
        const shape = new THREE.Shape();
        const x = -0.5, y = -0.5;
        shape.moveTo(x, y + 1);
        shape.lineTo(x + 1, y + 1);
        shape.lineTo(x + 0.5, y);
        shape.lineTo(x, y + 1);
        return new THREE.ExtrudeGeometry(shape, {
          steps: 1,
          depth: 0.5,
          bevelEnabled: false
        });
      }
    },
    {
      id: 'hexagonalPrism',
      name: 'Hexagonal Prism',
      description: 'Elongated hexagonal shape',
      icon: '⎔',
      createGeometry: () => new THREE.CylinderGeometry(0.7, 0.7, 1, 6, 1)
    }
  ], []);

  const handleShapeSelect = (shape) => {
    const geometry = shape.createGeometry();
    onSelectShape({
      id: `${shape.id}-${Date.now()}`,
      type: shape.id,
      name: shape.name,
      geometry: geometry,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      material: {
        type: 'MeshStandardMaterial',
        color: 0x4a6bff,
        metalness: 0.1,
        roughness: 0.5
      }
    });
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Shape Gallery</h3>
      <div style={styles.grid}>
        {shapes.map((shape) => (
          <button
            key={shape.id}
            onClick={() => handleShapeSelect(shape)}
            style={styles.shapeButton}
            title={shape.description}
          >
            <span style={styles.icon}>{shape.icon}</span>
            <span style={styles.name}>{shape.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: '8px',
    padding: '15px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    marginBottom: '15px',
  },
  header: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#fff',
    borderBottom: '1px solid #444',
    paddingBottom: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '10px',
  },
  shapeButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    backgroundColor: '#333',
    border: '1px solid #444',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s',
    minHeight: '60px',
    ':hover': {
      backgroundColor: '#4a6bff',
      transform: 'translateY(-2px)',
    },
  },
  icon: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  name: {
    fontSize: '11px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
  },
};

export default ShapeGallery;
