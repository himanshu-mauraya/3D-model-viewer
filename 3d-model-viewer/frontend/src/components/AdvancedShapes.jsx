import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Stats,
  MeshDistortMaterial,
  MarchingCubes,
  MarchingCube,
  Instances,
  Instance,
  shaderMaterial
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
import { extend } from '@react-three/fiber';

// Custom Glass Material Shader
const GlassMaterial = shaderMaterial(
  { 
    time: 0,
    color: new THREE.Color(0.2, 0.5, 1.0),
    transparent: true,
    opacity: 0.3
  },
  // Vertex Shader
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 color;
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
      vec3 finalColor = color + fresnel * 0.5;
      gl_FragColor = vec4(finalColor, 0.6 + fresnel * 0.4);
    }
  `
);

extend({ GlassMaterial });

// Metaballs using Marching Cubes
const Metaballs = ({ strength, subtract, color, metalness }) => {
  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={ref}>
      <MarchingCubes resolution={64} maxPolyCount={20000} enableUvs={false} enableColors>
        <meshStandardMaterial 
          color={color} 
          metalness={metalness} 
          roughness={0.2} 
          flatShading 
        />
        <MarchingCube strength={strength} subtract={subtract} position={[0.5, 0.5, 0]} />
        <MarchingCube strength={strength} subtract={subtract} position={[-0.5, -0.5, 0]} />
        <MarchingCube strength={strength} subtract={subtract} position={[0.5, -0.5, 0]} />
        <MarchingCube strength={strength} subtract={subtract} position={[-0.5, 0.5, 0]} />
        <MarchingCube strength={strength / 2} subtract={subtract} position={[0, 0, 0.5]} />
      </MarchingCubes>
    </group>
  );
};

// Instanced Mesh - thousands of objects
const InstancedSpheres = ({ count, spread, color }) => {
  const ref = useRef();
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -spread + Math.random() * spread * 2;
      const yFactor = -spread + Math.random() * spread * 2;
      const zFactor = -spread + Math.random() * spread * 2;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count, spread]);
  
  useFrame(() => {
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      
      ref.current.setMatrixAt(
        i,
        new THREE.Matrix4().compose(
          new THREE.Vector3(
            xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
            yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
            zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
          ),
          new THREE.Quaternion(),
          new THREE.Vector3(s, s, s).multiplyScalar(0.1)
        )
      );
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={color} />
    </instancedMesh>
  );
};

// Parametric Shape from formula
const ParametricShape = ({ formula, segments, color, materialType }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.ParametricGeometry((u, v, target) => {
      try {
        const t = u * Math.PI * 2;
        const s = v * Math.PI;
        
        // Default torus if formula fails
        let x = (2 + Math.cos(s)) * Math.cos(t);
        let y = (2 + Math.cos(s)) * Math.sin(t);
        let z = Math.sin(s);
        
        // Try custom formula
        if (formula && formula.trim()) {
          try {
            const sin = Math.sin;
            const cos = Math.cos;
            const tan = Math.tan;
            const sqrt = Math.sqrt;
            const abs = Math.abs;
            const pow = Math.pow;
            
            // Evaluate formula
            const result = eval(`(${formula})`);
            if (result && typeof result.x === 'number' && typeof result.y === 'number' && typeof result.z === 'number') {
              x = result.x;
              y = result.y;
              z = result.z;
            }
          } catch (e) {
            // Keep default if error
          }
        }
        
        target.set(x, y, z);
      } catch (e) {
        target.set(0, 0, 0);
      }
    }, segments, segments);
    
    geo.computeVertexNormals();
    return geo;
  }, [formula, segments]);

  const getMaterial = () => {
    switch (materialType) {
      case 'glass':
        return <glassMaterial color={color} transparent opacity={0.6} />;
      case 'neon':
        return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />;
      case 'metallic':
        return <meshStandardMaterial color={color} metalness={1} roughness={0.1} />;
      case 'wireframe':
        return <meshBasicMaterial color={color} wireframe />;
      default:
        return <meshStandardMaterial color={color} />;
    }
  };

  return (
    <mesh ref={meshRef} geometry={geometry}>
      {getMaterial()}
    </mesh>
  );
};

// Shape Generator - customizable primitive
const GeneratedShape = ({ type, height, radius, segments, color, materialType }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  const getGeometry = () => {
    switch (type) {
      case 'cylinder':
        return <cylinderGeometry args={[radius, radius, height, segments]} />;
      case 'cone':
        return <coneGeometry args={[radius, height, segments]} />;
      case 'sphere':
        return <sphereGeometry args={[radius, segments, segments]} />;
      case 'torus':
        return <torusGeometry args={[radius, radius * 0.4, segments, segments]} />;
      case 'torusKnot':
        return <torusKnotGeometry args={[radius, radius * 0.3, segments * 3, segments]} />;
      default:
        return <boxGeometry args={[radius * 2, height, radius * 2, segments, segments, segments]} />;
    }
  };

  const getMaterial = () => {
    switch (materialType) {
      case 'glass':
        return <glassMaterial color={color} transparent opacity={0.6} />;
      case 'neon':
        return <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />;
      case 'metallic':
        return <meshStandardMaterial color={color} metalness={1} roughness={0.1} />;
      case 'wireframe':
        return <meshBasicMaterial color={color} wireframe />;
      case 'transparent':
        return <meshStandardMaterial color={color} transparent opacity={0.5} />;
      default:
        return <meshStandardMaterial color={color} />;
    }
  };

  return (
    <mesh ref={meshRef} castShadow receiveShadow>
      {getGeometry()}
      {getMaterial()}
    </mesh>
  );
};

// Camera Controls with fixed background
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

  return (
    <OrbitControls 
      ref={controlsRef} 
      enableDamping 
      dampingFactor={0.05} 
      maxDistance={30}
      minDistance={2}
      target={[0, 0, 0]}
    />
  );
});

CameraControls.displayName = 'CameraControls';

// Main Component
const AdvancedShapes = forwardRef((props, ref) => {
  const [mode, setMode] = useState('generator'); // gallery, generator, parametric, metaballs, instanced
  const [shapeColor, setShapeColor] = useState('#4a90e2');
  const [materialType, setMaterialType] = useState('solid');
  const [environment, setEnvironment] = useState('city');
  const controlsRef = useRef();

  // Generator settings
  const [genType, setGenType] = useState('sphere');
  const [height, setHeight] = useState(2);
  const [radius, setRadius] = useState(1);
  const [segments, setSegments] = useState(32);

  // Parametric settings
  const [formula, setFormula] = useState('{ x: (2 + cos(s)) * cos(t), y: (2 + cos(s)) * sin(t), z: sin(s) }');

  // Metaballs settings
  const [strength, setStrength] = useState(0.5);
  const [subtract, setSubtract] = useState(10);

  // Instanced settings
  const [instanceCount, setInstanceCount] = useState(1000);
  const [spread, setSpread] = useState(10);

  // Lighting
  const [lights, setLights] = useState({
    ambient: { enabled: true, intensity: 0.5, color: '#ffffff' },
    directional: { enabled: true, intensity: 1, position: [10, 10, 5], color: '#ffffff' },
    point: { enabled: false, intensity: 2, position: [5, 5, 5], color: '#4a90e2' }
  });

  const modes = [
    { value: 'generator', label: '🔸 Shape Generator', description: 'Customize height, radius, faces' },
    { value: 'parametric', label: '🌀 Parametric', description: 'Math formulas to create shapes' },
    { value: 'metaballs', label: '🫧 Metaballs', description: 'Organic blending with marching cubes' },
    { value: 'instanced', label: '📊 Instanced', description: 'Thousands of objects efficiently' }
  ];

  const materials = [
    { value: 'solid', label: '⚪ Solid' },
    { value: 'metallic', label: '⚙️ Metallic' },
    { value: 'glass', label: '🔵 Glass' },
    { value: 'neon', label: '🌟 Neon' },
    { value: 'wireframe', label: '🕸️ Wireframe' },
    { value: 'transparent', label: '👁️ Transparent' }
  ];

  const handleViewPreset = useCallback((preset) => {
    if (!controlsRef.current) return;
    const distance = 8;
    const views = {
      reset: { position: [5, 5, 5], target: [0, 0, 0] },
      front: { position: [0, 0, distance], target: [0, 0, 0] },
      top: { position: [0, distance, 0], target: [0, 0, 0] },
      side: { position: [distance, 0, 0], target: [0, 0, 0] }
    };
    const view = views[preset];
    if (view) controlsRef.current.setView(view.position, view.target);
  }, []);

  const updateLight = useCallback((lightType, property, value) => {
    setLights(prev => ({ ...prev, [lightType]: { ...prev[lightType], [property]: value } }));
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.9)',
        padding: '15px',
        borderRadius: '10px',
        maxHeight: '90vh',
        overflowY: 'auto',
        minWidth: '320px',
        color: 'white',
        border: '1px solid rgba(74, 144, 226, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)'
      }}>
        <div>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#4a90e2', fontWeight: 'bold', paddingBottom: '10px', borderBottom: '2px solid rgba(74, 144, 226, 0.3)' }}>
            🚀 Advanced Shapes
          </h3>
        </div>

        {/* Mode Selection */}
        <div style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '8px' }}>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ width: '100%', padding: '12px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid rgba(74, 144, 226, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            {modes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'rgba(74, 144, 226, 0.05)', border: '1px solid rgba(74, 144, 226, 0.2)', borderRadius: '6px', fontSize: '11px', color: '#bbb' }}>
            {modes.find(m => m.value === mode)?.description}
          </div>
        </div>

        {/* Material Selection */}
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
            🎨 Material
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {materials.map(mat => (
              <button
                key={mat.value}
                onClick={() => setMaterialType(mat.value)}
                style={{
                  padding: '10px',
                  backgroundColor: materialType === mat.value ? '#4a90e2' : '#1a1a1a',
                  color: 'white',
                  border: '1px solid rgba(74, 144, 226, 0.3)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: materialType === mat.value ? 'bold' : 'normal'
                }}
              >
                {mat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Color</h4>
          <input type="color" value={shapeColor} onChange={(e) => setShapeColor(e.target.value)} style={{ width: '100%', height: '45px', cursor: 'pointer', borderRadius: '6px', border: '2px solid rgba(255,255,255,0.2)' }} />
        </div>

        {/* Mode-specific controls */}
        {mode === 'generator' && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a90e2' }}>Generator Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Base Shape</label>
                <select value={genType} onChange={(e) => setGenType(e.target.value)} style={{ width: '100%', padding: '8px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid rgba(74, 144, 226, 0.3)', borderRadius: '4px', fontSize: '12px' }}>
                  <option value="sphere">Sphere</option>
                  <option value="box">Box</option>
                  <option value="cylinder">Cylinder</option>
                  <option value="cone">Cone</option>
                  <option value="torus">Torus</option>
                  <option value="torusKnot">Torus Knot</option>
                </select>
              </div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Radius: {radius.toFixed(2)}</label><input type="range" min="0.5" max="3" step="0.1" value={radius} onChange={(e) => setRadius(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }} /></div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Height: {height.toFixed(2)}</label><input type="range" min="0.5" max="4" step="0.1" value={height} onChange={(e) => setHeight(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }} /></div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Segments: {segments}</label><input type="range" min="8" max="64" step="4" value={segments} onChange={(e) => setSegments(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }} /></div>
            </div>
          </div>
        )}

        {mode === 'parametric' && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a90e2' }}>Parametric Formula</h4>
            <p style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>Variables: t, s, sin, cos, tan, sqrt</p>
            <textarea
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              rows={4}
              style={{ width: '100%', padding: '8px', backgroundColor: '#1a1a1a', color: '#0f0', border: '1px solid rgba(74, 144, 226, 0.3)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px', resize: 'vertical' }}
              placeholder="{ x: ..., y: ..., z: ... }"
            />
            <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginTop: '10px', marginBottom: '4px' }}>Resolution: {segments}</label><input type="range" min="16" max="64" step="8" value={segments} onChange={(e) => setSegments(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }} /></div>
          </div>
        )}

        {mode === 'metaballs' && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a90e2' }}>Metaball Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Strength: {strength.toFixed(2)}</label><input type="range" min="0.1" max="2" step="0.1" value={strength} onChange={(e) => setStrength(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }} /></div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Subtract: {subtract.toFixed(1)}</label><input type="range" min="1" max="20" step="1" value={subtract} onChange={(e) => setSubtract(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }} /></div>
            </div>
          </div>
        )}

        {mode === 'instanced' && (
          <div style={{ marginTop: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#4a90e2' }}>Instance Settings</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Count: {instanceCount}</label><input type="range" min="100" max="5000" step="100" value={instanceCount} onChange={(e) => setInstanceCount(parseInt(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }} /></div>
              <div><label style={{ fontSize: '11px', color: '#aaa', display: 'block', marginBottom: '4px' }}>Spread: {spread.toFixed(1)}</label><input type="range" min="5" max="20" step="1" value={spread} onChange={(e) => setSpread(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4a90e2' }} /></div>
            </div>
          </div>
        )}

        {/* Camera */}
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>📷 Camera</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {['Front', 'Top', 'Side'].map(view => (
              <button key={view} onClick={() => handleViewPreset(view.toLowerCase())} style={{ padding: '10px', backgroundColor: '#1a1a1a', color: '#4a90e2', border: '1px solid rgba(74, 144, 226, 0.3)', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>{view}</button>
            ))}
          </div>
          <button onClick={() => handleViewPreset('reset')} style={{ marginTop: '6px', padding: '10px', width: '100%', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Reset</button>
        </div>

        {/* Environment */}
        <div style={{ marginTop: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>🌍 Environment</h4>
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)} style={{ width: '100%', padding: '10px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
            <option value="">None</option>
            <option value="city">City</option>
            <option value="studio">Studio</option>
            <option value="sunset">Sunset</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }} gl={{ antialias: true }} style={{ background: '#0a0a0a' }}>
        <Suspense fallback={null}>
          {lights.ambient.enabled && <ambientLight intensity={lights.ambient.intensity} color={lights.ambient.color} />}
          {lights.directional.enabled && <directionalLight position={lights.directional.position} intensity={lights.directional.intensity} color={lights.directional.color} castShadow />}
          {lights.point.enabled && <pointLight position={lights.point.position} intensity={lights.point.intensity} color={lights.point.color} castShadow />}
          
          {mode === 'generator' && <GeneratedShape type={genType} height={height} radius={radius} segments={segments} color={shapeColor} materialType={materialType} />}
          {mode === 'parametric' && <ParametricShape formula={formula} segments={segments} color={shapeColor} materialType={materialType} />}
          {mode === 'metaballs' && <Metaballs strength={strength} subtract={subtract} color={shapeColor} metalness={0.8} />}
          {mode === 'instanced' && <InstancedSpheres count={instanceCount} spread={spread} color={shapeColor} />}
          
          <gridHelper args={[20, 20, '#333', '#222']} position={[0, 0, 0]} />
          <axesHelper args={[5]} />
          
          {environment && <Environment preset={environment} background={false} />}
          <CameraControls ref={controlsRef} />
          <Stats />
        </Suspense>
      </Canvas>
    </div>
  );
});

AdvancedShapes.displayName = 'AdvancedShapes';

export default AdvancedShapes;
