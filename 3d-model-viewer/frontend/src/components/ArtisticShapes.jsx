import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Stats,
  MeshDistortMaterial,
  Edges,
  Sparkles
} from '@react-three/drei';
import { 
  Suspense, 
  useState, 
  useCallback, 
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo
} from 'react';
import * as THREE from 'three';

// Liquid Metal Blob
const LiquidMetalBlob = ({ color, metalness, roughness, animationSpeed }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      <sphereGeometry args={[2, 64, 64]} />
      <MeshDistortMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        distort={0.4}
        speed={animationSpeed}
      />
    </mesh>
  );
};

// Wireframe Mesh
const WireframeMesh = ({ color, shape }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const geometries = {
    sphere: <sphereGeometry args={[2, 32, 32]} />,
    torus: <torusGeometry args={[1.5, 0.5, 32, 64]} />,
    torusKnot: <torusKnotGeometry args={[1.2, 0.4, 128, 32]} />,
    octahedron: <octahedronGeometry args={[2, 0]} />,
    icosahedron: <icosahedronGeometry args={[2, 1]} />
  };

  return (
    <mesh ref={meshRef}>
      {geometries[shape] || geometries.icosahedron}
      <meshBasicMaterial color={color} wireframe={true} transparent opacity={0.8} />
    </mesh>
  );
};

// Crystal Shape
const CrystalShape = ({ color, emissiveColor, emissiveIntensity }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <icosahedronGeometry args={[2, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={emissiveIntensity}
          flatShading={true}
          metalness={0.8}
          roughness={0.2}
        />
        <Edges scale={1} threshold={15} color="#ffffff" lineWidth={2} />
      </mesh>
      <Sparkles count={50} scale={6} size={3} speed={0.3} opacity={0.6} color={color} />
    </group>
  );
};

// Neon Grid
const NeonGrid = ({ color, gridSize, glowIntensity }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  const gridLines = useMemo(() => {
    const lines = [];
    const size = gridSize;
    const divisions = 10;
    const step = size / divisions;

    for (let i = 0; i <= divisions; i++) {
      const x = -size / 2 + i * step;
      lines.push(
        <line key={`v-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([x, -size / 2, 0, x, size / 2, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.6} />
        </line>
      );
    }

    for (let i = 0; i <= divisions; i++) {
      const y = -size / 2 + i * step;
      lines.push(
        <line key={`h-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-size / 2, y, 0, size / 2, y, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.6} />
        </line>
      );
    }

    return lines;
  }, [gridSize, color]);

  return (
    <group ref={groupRef}>
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        {gridLines}
      </group>
      
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={glowIntensity}
          transparent
          opacity={0.7}
          wireframe={true}
        />
      </mesh>
      
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[3, 0.05, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
      
      <Sparkles count={100} scale={8} size={2} speed={0.5} opacity={0.4} color={color} />
    </group>
  );
};

// Main shape selector
const ArtisticShape = ({ type, ...props }) => {
  const components = {
    liquidMetal: LiquidMetalBlob,
    wireframe: WireframeMesh,
    crystal: CrystalShape,
    neonGrid: NeonGrid
  };
  const Component = components[type] || LiquidMetalBlob;
  return <Component {...props} />;
};

// Camera Controls
const CameraControls = forwardRef((props, ref) => {
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

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} maxDistance={20} minDistance={3} />;
});

CameraControls.displayName = 'CameraControls';

// Main Component
const ArtisticShapes = forwardRef((props, ref) => {
  const [selectedShape, setSelectedShape] = useState('liquidMetal');
  const [shapeColor, setShapeColor] = useState('#00ffff');
  const [emissiveColor, setEmissiveColor] = useState('#ff00ff');
  const [metalness, setMetalness] = useState(0.9);
  const [roughness, setRoughness] = useState(0.1);
  const [animationSpeed, setAnimationSpeed] = useState(2);
  const [glowIntensity, setGlowIntensity] = useState(2);
  const [environment, setEnvironment] = useState('night');
  const [wireframeShape, setWireframeShape] = useState('icosahedron');
  const [gridSize, setGridSize] = useState(8);
  const controlsRef = useRef();

  const [lights, setLights] = useState({
    ambient: { enabled: true, intensity: 0.3, color: '#ffffff' },
    point1: { enabled: true, intensity: 2, position: [5, 5, 5], color: '#00ffff' },
    point2: { enabled: true, intensity: 2, position: [-5, 5, -5], color: '#ff00ff' }
  });

  const shapes = [
    { value: 'liquidMetal', label: '💧 Liquid Metal Blob', description: 'Animated, soft-mesh object with distortion effects' },
    { value: 'wireframe', label: '🕸️ Wireframe Mesh', description: 'Skeleton-style rendering of geometric objects' },
    { value: 'crystal', label: '💎 Crystal/Low Poly', description: 'Faceted shape with hard edges and sparkles' },
    { value: 'neonGrid', label: '🌐 Neon Grid / Tron', description: 'Sci-fi inspired glowing shapes and grid' }
  ];

  const handleViewPreset = useCallback((preset) => {
    if (!controlsRef.current) return;
    const distance = 8;
    const views = {
      reset: { position: [6, 6, 6], target: [0, 0, 0] },
      front: { position: [0, 0, distance], target: [0, 0, 0] },
      back: { position: [0, 0, -distance], target: [0, 0, 0] },
      top: { position: [0, distance, 0], target: [0, 0, 0] },
      angle: { position: [distance, distance / 2, distance], target: [0, 0, 0] }
    };
    const view = views[preset];
    if (view) controlsRef.current.setView(view.position, view.target);
  }, []);

  const updateLight = useCallback((lightType, property, value) => {
    setLights(prev => ({ ...prev, [lightType]: { ...prev[lightType], [property]: value } }));
  }, []);

  const shapeProps = {
    liquidMetal: { color: shapeColor, metalness, roughness, animationSpeed },
    wireframe: { color: shapeColor, shape: wireframeShape },
    crystal: { color: shapeColor, emissiveColor, emissiveIntensity: glowIntensity },
    neonGrid: { color: shapeColor, gridSize, glowIntensity }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'rgba(0,0,0,0.85)', padding: '15px', borderRadius: '10px', maxHeight: '90vh', overflowY: 'auto', minWidth: '300px', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', background: 'linear-gradient(135deg, #00ffff, #ff00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold', paddingBottom: '10px', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>✨ Artistic Forms</h3>
          <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>Showcasing Three.js power</p>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Select Style</label>
          <select value={selectedShape} onChange={(e) => setSelectedShape(e.target.value)} style={{ width: '100%', padding: '12px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            {shapes.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', borderRadius: '6px', fontSize: '11px', color: '#bbb', lineHeight: '1.5' }}>
            {shapes.find(s => s.value === selectedShape)?.description}
          </div>
        </div>

        {selectedShape === 'liquidMetal' && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#00ffff' }}>Liquid Properties</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Animation Speed: {animationSpeed.toFixed(1)}</label><input type="range" min="0.5" max="5" step="0.5" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#00ffff' }} /></div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Metalness: {metalness.toFixed(2)}</label><input type="range" min="0" max="1" step="0.05" value={metalness} onChange={(e) => setMetalness(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#00ffff' }} /></div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Roughness: {roughness.toFixed(2)}</label><input type="range" min="0" max="1" step="0.05" value={roughness} onChange={(e) => setRoughness(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#00ffff' }} /></div>
            </div>
          </div>
        )}

        {selectedShape === 'wireframe' && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#00ffff' }}>Wireframe Options</h4>
            <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Base Geometry</label>
            <select value={wireframeShape} onChange={(e) => setWireframeShape(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
              <option value="icosahedron">Icosahedron</option>
              <option value="sphere">Sphere</option>
              <option value="torus">Torus</option>
              <option value="torusKnot">Torus Knot</option>
              <option value="octahedron">Octahedron</option>
            </select>
          </div>
        )}

        {selectedShape === 'crystal' && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ff00ff' }}>Crystal Properties</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Emissive Color</label><input type="color" value={emissiveColor} onChange={(e) => setEmissiveColor(e.target.value)} style={{ width: '100%', height: '40px', cursor: 'pointer', borderRadius: '4px', border: '1px solid rgba(255,0,255,0.3)' }} /></div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Glow Intensity: {glowIntensity.toFixed(1)}</label><input type="range" min="0" max="5" step="0.5" value={glowIntensity} onChange={(e) => setGlowIntensity(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#ff00ff' }} /></div>
            </div>
          </div>
        )}

        {selectedShape === 'neonGrid' && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#00ffff' }}>Neon Grid Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Grid Size: {gridSize}</label><input type="range" min="4" max="12" step="1" value={gridSize} onChange={(e) => setGridSize(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#00ffff' }} /></div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Glow Intensity: {glowIntensity.toFixed(1)}</label><input type="range" min="0.5" max="5" step="0.5" value={glowIntensity} onChange={(e) => setGlowIntensity(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#00ffff' }} /></div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>🎨 Primary Color</h4>
          <input type="color" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)} style={{ width: '100%', height: '45px', cursor: 'pointer', borderRadius: '6px', border: '2px solid rgba(255,255,255,0.2)' }} />
        </div>

        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>📷 Camera Views</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['Front', 'Back', 'Top', 'Angle'].map(view => (
              <button key={view} onClick={() => handleViewPreset(view.toLowerCase())} style={{ padding: '10px', backgroundColor: '#1a1a1a', color: '#00ffff', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '500' }}>{view}</button>
            ))}
          </div>
          <button onClick={() => handleViewPreset('reset')} style={{ marginTop: '6px', padding: '10px', width: '100%', background: 'linear-gradient(135deg, #00ffff, #ff00ff)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Reset Camera</button>
        </div>

        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>🌍 Environment</h4>
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <option value="">None</option>
            <option value="night">Night</option>
            <option value="city">City</option>
            <option value="studio">Studio</option>
            <option value="sunset">Sunset</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
      </div>

      <Canvas camera={{ position: [6, 6, 6], fov: 60 }} gl={{ antialias: true, alpha: true }} style={{ background: 'radial-gradient(circle at center, #0a0a1a 0%, #000000 100%)' }}>
        <Suspense fallback={null}>
          {lights.ambient.enabled && <ambientLight intensity={lights.ambient.intensity} color={lights.ambient.color} />}
          {lights.point1.enabled && <pointLight position={lights.point1.position} intensity={lights.point1.intensity} color={lights.point1.color} castShadow distance={30} />}
          {lights.point2.enabled && <pointLight position={lights.point2.position} intensity={lights.point2.intensity} color={lights.point2.color} castShadow distance={30} />}
          <ArtisticShape type={selectedShape} {...shapeProps[selectedShape]} />
          {environment && <Environment preset={environment} background={false} />}
          <CameraControls ref={controlsRef} />
          <Stats />
        </Suspense>
      </Canvas>
    </div>
  );
});

ArtisticShapes.displayName = 'ArtisticShapes';

export default ArtisticShapes;
