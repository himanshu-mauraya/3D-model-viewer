import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  useGLTF, 
  Stats, 
  useProgress,
  Html,
  useTexture,
  PerspectiveCamera,
  OrthographicCamera
} from '@react-three/drei';
import { 
  Suspense, 
  useState, 
  useEffect, 
  forwardRef, 
  useRef, 
  useCallback, 
  useImperativeHandle 
} from 'react';
import * as THREE from 'three';

// Loading overlay component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ 
        background: 'rgba(0,0,0,0.7)', 
        padding: '20px', 
        borderRadius: '10px',
        color: 'white'
      }}>
        Loading {Math.round(progress)}%
      </div>
    </Html>
  );
}

// Model component with error boundary
const Model = forwardRef(({ url, scale = 1, materialProps = {} }, ref) => {
  const { scene, materials } = useGLTF(url);
  const modelRef = useRef();
  
  useEffect(() => {
    // Apply material properties to all materials in the model
    if (materials) {
      Object.values(materials).forEach(material => {
        Object.entries(materialProps).forEach(([key, value]) => {
          if (material[key] !== undefined) {
            material[key] = value;
            material.needsUpdate = true;
          }
        });
      });
    }
    
    if (ref) {
      ref.current = scene;
    }
    
    return () => {
      // Cleanup
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [materials, ref, scene, materialProps, url]);

  return <primitive ref={modelRef} object={scene} scale={scale} />;
});

Model.displayName = 'Model';

// Camera controls with view presets
const CameraControls = forwardRef(({ onUpdate, cameraType = 'perspective' }, ref) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  
  // Set camera type
  useEffect(() => {
    if (cameraType === 'orthographic') {
      camera.near = 0.1;
      camera.far = 1000;
      camera.zoom = 50;
      camera.updateProjectionMatrix();
    } else {
      camera.fov = 50;
      camera.near = 0.1;
      camera.far = 1000;
      camera.updateProjectionMatrix();
    }
  }, [cameraType, camera]);

  // Expose controls methods
  useImperativeHandle(ref, () => ({
    reset: () => controlsRef.current?.reset(),
    setView: (position, target = [0, 0, 0]) => {
      if (controlsRef.current) {
        controlsRef.current.target.set(...target);
        camera.position.set(...position);
        controlsRef.current.update();
      }
    }
  }));

  const handleEnd = useCallback(() => {
    onUpdate?.({
      position: [camera.position.x, camera.position.y, camera.position.z],
      rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z]
    });
  }, [camera, onUpdate]);
  
  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      onEnd={handleEnd}
    />
  );
});

CameraControls.displayName = 'CameraControls';

// Main EnhancedModelViewer component
const EnhancedModelViewer = ({
  modelUrl,
  onModelLoad,
  onError,
  style = {},
  className = '',
  ...props
}) => {
  // State
  const [materials, setMaterials] = useState({});
  const [cameraType, setCameraType] = useState('perspective');
  const [lights, setLights] = useState({
    ambient: { intensity: 0.5, visible: true },
    directional: { intensity: 1, position: [10, 10, 5], visible: true },
    point: { intensity: 1, position: [10, 10, 10], visible: false, distance: 0, decay: 0 }
  });
  const [materialProps, setMaterialProps] = useState({
    color: '#ffffff',
    metalness: 0.5,
    roughness: 0.5,
    emissive: '#000000',
    wireframe: false
  });
  const [environment, setEnvironment] = useState('city');
  
  // Refs
  const modelRef = useRef();
  const controlsRef = useRef();

  // Handle model loading
  const handleModelLoaded = useCallback((mats) => {
    if (mats) {
      const materialData = {};
      Object.entries(mats).forEach(([name, material]) => {
        materialData[name] = {
          name,
          type: material.type,
          color: material.color?.getHexString ? '#' + material.color.getHexString() : '#ffffff',
          metalness: material.metalness || 0,
          roughness: material.roughness || 0.5,
          emissive: material.emissive?.getHexString ? '#' + material.emissive.getHexString() : '#000000',
          wireframe: material.wireframe || false
        };
      });
      setMaterials(materialData);
      onModelLoad?.(materialData);
    }
  }, [onModelLoad]);

  // Handle material property changes
  const handleMaterialChange = useCallback((name, value) => {
    setMaterialProps(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle light property changes
  const handleLightChange = useCallback((lightType, prop, value) => {
    setLights(prev => ({
      ...prev,
      [lightType]: {
        ...prev[lightType],
        [prop]: value
      }
    }));
  }, []);

  // View presets
  const handleViewPreset = useCallback((preset) => {
    if (!controlsRef.current) return;
    
    const views = {
      front: { position: [0, 0, 5], target: [0, 0, 0] },
      back: { position: [0, 0, -5], target: [0, 0, 0] },
      left: { position: [-5, 0, 0], target: [0, 0, 0] },
      right: { position: [5, 0, 0], target: [0, 0, 0] },
      top: { position: [0, 5, 0], target: [0, 0, 0] },
      bottom: { position: [0, -5, 0], target: [0, 0, 0] },
      isometric: { position: [5, 5, 5], target: [0, 0, 0] }
    };
    
    const view = views[preset];
    if (view) {
      controlsRef.current.setView(view.position, view.target);
    } else if (preset === 'reset') {
      controlsRef.current.reset();
    }
  }, []);

  // Toggle camera type
  const toggleCameraType = useCallback(() => {
    setCameraType(prev => prev === 'perspective' ? 'orthographic' : 'perspective');
  }, []);

  return (
    <div 
      className={`enhanced-model-viewer ${className}`} 
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style 
      }}
    >
      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas
          camera={cameraType === 'orthographic' 
            ? { position: [5, 5, 5], zoom: 50 }
            : { position: [5, 5, 5], fov: 50 }
          }
          gl={{ antialias: true }}
          onCreated={({ gl, camera }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
        >
          <Suspense fallback={<Loader />}>
            {/* Lights */}
            {lights.ambient.visible && (
              <ambientLight 
                intensity={lights.ambient.intensity} 
              />
            )}
            
            {lights.directional.visible && (
              <directionalLight
                position={lights.directional.position}
                intensity={lights.directional.intensity}
                castShadow
              />
            )}
            
            {lights.point.visible && (
              <pointLight
                position={lights.point.position}
                intensity={lights.point.intensity}
                distance={lights.point.distance}
                decay={lights.point.decay}
              />
            )}
            
            {/* Model */}
            {modelUrl && (
              <Model 
                ref={modelRef}
                url={modelUrl}
                scale={1}
                materialProps={materialProps}
              />
            )}
            
            {/* Environment */}
            <Environment preset={environment} background={false} />
            
            {/* Grid Helper */}
            <gridHelper args={[10, 10]} />
            
            {/* Coordinate Axes */}
            <axesHelper args={[5]} />
            
            {/* Camera Controls */}
            <CameraControls 
              ref={controlsRef}
              cameraType={cameraType}
            />
            
            {/* Stats */}
            <Stats />
          </Suspense>
        </Canvas>
      </div>
      
      {/* UI Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        background: 'rgba(0,0,0,0.7)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        maxWidth: '300px',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>3D Model Viewer</h3>
        
        {/* Camera Controls */}
        <div>
          <h4>Camera</h4>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
            <button onClick={() => handleViewPreset('reset')}>Reset</button>
            <button onClick={() => handleViewPreset('front')}>Front</button>
            <button onClick={() => handleViewPreset('back')}>Back</button>
            <button onClick={() => handleViewPreset('left')}>Left</button>
            <button onClick={() => handleViewPreset('right')}>Right</button>
            <button onClick={() => handleViewPreset('top')}>Top</button>
            <button onClick={() => handleViewPreset('bottom')}>Bottom</button>
            <button onClick={toggleCameraType}>
              {cameraType === 'perspective' ? 'Orthographic' : 'Perspective'}
            </button>
          </div>
        </div>
        
        {/* Lighting Controls */}
        <div>
          <h4>Lights</h4>
          {Object.entries(lights).map(([lightType, lightProps]) => (
            <div key={lightType} style={{ marginBottom: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={lightProps.visible}
                  onChange={(e) => handleLightChange(lightType, 'visible', e.target.checked)}
                />
                {lightType.charAt(0).toUpperCase() + lightType.slice(1)} Light
              </label>
              {lightProps.visible && (
                <div style={{ marginLeft: '15px' }}>
                  <div>
                    Intensity:
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={lightProps.intensity}
                      onChange={(e) => handleLightChange(lightType, 'intensity', parseFloat(e.target.value))}
                    />
                    {lightProps.intensity.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Material Controls */}
        <div>
          <h4>Material</h4>
          <div>
            <div>
              <label>Color: </label>
              <input
                type="color"
                value={materialProps.color}
                onChange={(e) => handleMaterialChange('color', e.target.value)}
              />
            </div>
            <div>
              <label>Metalness: </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={materialProps.metalness}
                onChange={(e) => handleMaterialChange('metalness', parseFloat(e.target.value))}
              />
              {materialProps.metalness.toFixed(2)}
            </div>
            <div>
              <label>Roughness: </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={materialProps.roughness}
                onChange={(e) => handleMaterialChange('roughness', parseFloat(e.target.value))}
              />
              {materialProps.roughness.toFixed(2)}
            </div>
            <div>
              <label>Emissive: </label>
              <input
                type="color"
                value={materialProps.emissive}
                onChange={(e) => handleMaterialChange('emissive', e.target.value)}
              />
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={materialProps.wireframe}
                  onChange={(e) => handleMaterialChange('wireframe', e.target.checked)}
                />
                Wireframe
              </label>
            </div>
          </div>
        </div>
        
        {/* Environment Selector */}
        <div>
          <h4>Environment</h4>
          <select 
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            style={{ width: '100%' }}
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
    </div>
  );
};

EnhancedModelViewer.displayName = 'EnhancedModelViewer';

export default EnhancedModelViewer;
