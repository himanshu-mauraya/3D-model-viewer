import { Canvas } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Stats,
  PerspectiveCamera
} from '@react-three/drei';
import { 
  Suspense, 
  useState, 
  useCallback, 
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import * as THREE from 'three';

// Geometric shape component
const GeometricShape = ({ shape, color, wireframe, metalness, roughness }) => {
  const meshRef = useRef();
  
  const getGeometry = () => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[2, 2, 2]} />;
      case 'cuboid':
        return <boxGeometry args={[3, 1.5, 2]} />;
      case 'sphere':
        return <sphereGeometry args={[1.5, 32, 32]} />;
      case 'cylinder':
        return <cylinderGeometry args={[1, 1, 2, 32]} />;
      case 'cone':
        return <coneGeometry args={[1.5, 2.5, 32]} />;
      case 'torus':
        return <torusGeometry args={[1.2, 0.4, 16, 100]} />;
      case 'pyramid':
        return <coneGeometry args={[1.5, 2.5, 4]} />;
      case 'triangularPrism':
        return <cylinderGeometry args={[1, 1, 2, 3]} />;
      case 'hexagonalPrism':
        return <cylinderGeometry args={[1, 1, 2, 6]} />;
      default:
        return <boxGeometry args={[2, 2, 2]} />;
    }
  };

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {getGeometry()}
      <meshStandardMaterial 
        color={color}
        wireframe={wireframe}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
};

// Camera Controls
const CameraControls = forwardRef(({ onUpdate }, ref) => {
  const controlsRef = useRef();

  useImperativeHandle(ref, () => ({
    reset: () => controlsRef.current?.reset(),
    setView: (position, target = [0, 0, 0]) => {
      if (controlsRef.current) {
        controlsRef.current.object.position.set(...position);
        controlsRef.current.target.set(...target);
        controlsRef.current.update();
      }
    }
  }));

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
    />
  );
});

CameraControls.displayName = 'CameraControls';

// Main GeometricShapes component
const GeometricShapes = forwardRef((props, ref) => {
  const [selectedShape, setSelectedShape] = useState('cube');
  const [shapeColor, setShapeColor] = useState('#4a90e2');
  const [wireframe, setWireframe] = useState(false);
  const [metalness, setMetalness] = useState(0.5);
  const [roughness, setRoughness] = useState(0.5);
  const [environment, setEnvironment] = useState('city');
  const controlsRef = useRef();

  // Lighting state
  const [lights, setLights] = useState({
    ambient: {
      enabled: true,
      intensity: 0.5,
      color: '#ffffff'
    },
    directional: {
      enabled: true,
      intensity: 1,
      position: [10, 10, 5],
      color: '#ffffff'
    },
    point: {
      enabled: false,
      intensity: 1,
      position: [5, 5, 5],
      color: '#ffffff'
    }
  });

  const shapes = [
    { value: 'cube', label: 'Cube', description: 'Equal length on all sides' },
    { value: 'cuboid', label: 'Cuboid', description: 'Box shape with unequal sides' },
    { value: 'sphere', label: 'Sphere', description: 'Perfect round ball' },
    { value: 'cylinder', label: 'Cylinder', description: 'Circular base, straight height' },
    { value: 'cone', label: 'Cone', description: 'Circular base, pointed top' },
    { value: 'torus', label: 'Torus', description: 'Donut shape' },
    { value: 'pyramid', label: 'Pyramid', description: 'Polygon base + triangular faces' },
    { value: 'triangularPrism', label: 'Triangular Prism', description: 'Elongated shape with triangle bases' },
    { value: 'hexagonalPrism', label: 'Hexagonal Prism', description: 'Elongated shape with hexagon bases' }
  ];

  // View presets
  const handleViewPreset = useCallback((preset) => {
    if (!controlsRef.current) return;
    
    const distance = 6;
    const views = {
      reset: { position: [5, 5, 5], target: [0, 0, 0] },
      front: { position: [0, 0, distance], target: [0, 0, 0] },
      back: { position: [0, 0, -distance], target: [0, 0, 0] },
      left: { position: [-distance, 0, 0], target: [0, 0, 0] },
      right: { position: [distance, 0, 0], target: [0, 0, 0] },
      top: { position: [0, distance, 0], target: [0, 0, 0] },
      bottom: { position: [0, -distance, 0], target: [0, 0, 0] },
      isometric: { position: [5, 5, 5], target: [0, 0, 0] }
    };

    const view = views[preset];
    if (view) {
      controlsRef.current.setView(view.position, view.target);
    }
  }, []);

  // Update light property
  const updateLight = useCallback((lightType, property, value) => {
    setLights(prev => ({
      ...prev,
      [lightType]: {
        ...prev[lightType],
        [property]: value
      }
    }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxHeight: '90vh',
        overflowY: 'auto',
        minWidth: '280px',
        color: 'white'
      }}>
        {/* Shape Selection */}
        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '2px solid #4a90e2', paddingBottom: '8px' }}>
            🔷 Geometric Shapes
          </h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '8px' }}>
              Select Shape
            </label>
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#222',
                color: 'white',
                border: '1px solid #555',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              {shapes.map(shape => (
                <option key={shape.value} value={shape.value}>
                  {shape.label}
                </option>
              ))}
            </select>
            
            {/* Shape description */}
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              backgroundColor: 'rgba(74, 144, 226, 0.1)', 
              borderRadius: '4px',
              fontSize: '11px',
              color: '#ccc'
            }}>
              {shapes.find(s => s.value === selectedShape)?.description}
            </div>
          </div>
        </div>

        {/* Material Properties */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
            🎨 Material
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label htmlFor="shape-color" style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Color
              </label>
              <input
                id="shape-color"
                name="shape-color"
                type="color"
                value={shapeColor}
                onChange={(e) => setShapeColor(e.target.value)}
                style={{ width: '100%', height: '40px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #555' }}
              />
            </div>
            
            <div>
              <label htmlFor="shape-metalness" style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Metalness: {metalness.toFixed(2)}
              </label>
              <input
                id="shape-metalness"
                name="shape-metalness"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={metalness}
                onChange={(e) => setMetalness(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }}
              />
            </div>
            
            <div>
              <label htmlFor="shape-roughness" style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Roughness: {roughness.toFixed(2)}
              </label>
              <input
                id="shape-roughness"
                name="shape-roughness"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={roughness}
                onChange={(e) => setRoughness(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }}
              />
            </div>
            
            <div>
              <label htmlFor="shape-wireframe" style={{ 
                fontSize: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                userSelect: 'none'
              }}>
                <input
                  id="shape-wireframe"
                  name="shape-wireframe"
                  type="checkbox"
                  checked={wireframe}
                  onChange={(e) => setWireframe(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Wireframe Mode
              </label>
            </div>
          </div>
        </div>

        {/* Camera Controls */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
            📷 Camera Views
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['Front', 'Back', 'Left', 'Right', 'Top', 'Bottom'].map(view => (
              <button
                key={view}
                onClick={() => handleViewPreset(view.toLowerCase())}
                style={{
                  padding: '8px',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#555'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#333'}
              >
                {view}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handleViewPreset('reset')}
            style={{
              marginTop: '6px',
              padding: '8px',
              width: '100%',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Reset Camera
          </button>
        </div>

        {/* Lighting Controls */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
            💡 Lighting
          </h4>
          
          {Object.entries(lights).map(([lightType, lightProps]) => (
            <div key={lightType} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #444' }}>
              <label htmlFor={`light-${lightType}-enabled`} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '8px' }}>
                <input
                  id={`light-${lightType}-enabled`}
                  name={`light-${lightType}-enabled`}
                  type="checkbox"
                  checked={lightProps.enabled}
                  onChange={(e) => updateLight(lightType, 'enabled', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {lightType.charAt(0).toUpperCase() + lightType.slice(1)} Light
              </label>
              
              {lightProps.enabled && (
                <div style={{ marginLeft: '20px' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <label htmlFor={`light-${lightType}-intensity`} style={{ fontSize: '10px', color: '#aaa', display: 'block', marginBottom: '2px' }}>
                      Intensity: {lightProps.intensity.toFixed(1)}
                    </label>
                    <input
                      id={`light-${lightType}-intensity`}
                      name={`light-${lightType}-intensity`}
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={lightProps.intensity}
                      onChange={(e) => updateLight(lightType, 'intensity', parseFloat(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Environment */}
        <div>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
            🌍 Environment
          </h4>
          
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#222',
              color: 'white',
              border: '1px solid #555',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <option value="">None</option>
            <option value="apartment">Apartment</option>
            <option value="city">City</option>
            <option value="dawn">Dawn</option>
            <option value="forest">Forest</option>
            <option value="lobby">Lobby</option>
            <option value="night">Night</option>
            <option value="park">Park</option>
            <option value="studio">Studio</option>
            <option value="sunset">Sunset</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <Suspense fallback={null}>
          {/* Lights */}
          {lights.ambient.enabled && (
            <ambientLight 
              intensity={lights.ambient.intensity}
              color={lights.ambient.color}
            />
          )}
          
          {lights.directional.enabled && (
            <directionalLight
              position={lights.directional.position}
              intensity={lights.directional.intensity}
              color={lights.directional.color}
              castShadow
            />
          )}
          
          {lights.point.enabled && (
            <pointLight
              position={lights.point.position}
              intensity={lights.point.intensity}
              color={lights.point.color}
            />
          )}
          
          {/* Geometric Shape */}
          <GeometricShape 
            shape={selectedShape}
            color={shapeColor}
            wireframe={wireframe}
            metalness={metalness}
            roughness={roughness}
          />
          
          {/* Grid Helper */}
          <gridHelper args={[10, 10, '#444', '#222']} />
          
          {/* Axes Helper */}
          <axesHelper args={[5]} />
          
          {/* Camera Controls */}
          <CameraControls ref={controlsRef} />
          
          {/* Environment */}
          {environment && <Environment preset={environment} background={false} />}
          
          {/* Performance Stats */}
          <Stats />
        </Suspense>
      </Canvas>
    </div>
  );
});

GeometricShapes.displayName = 'GeometricShapes';

export default GeometricShapes;
