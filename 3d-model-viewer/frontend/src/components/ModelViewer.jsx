import { Canvas, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, TransformControls, Environment } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';
import { 
  Suspense, 
  useState, 
  useEffect, 
  forwardRef, 
  useRef, 
  useCallback, 
  useImperativeHandle 
} from 'react';

// OBJ Model Component - Simplified and working
const OBJModel = forwardRef(({ url, scale = 1, onMaterialUpdate }, ref) => {
  const obj = useLoader(OBJLoader, url);
  const groupRef = useRef();
  
  useEffect(() => {
    if (!obj || !groupRef.current) return;
    
    // Only process if not already processed
    if (obj.userData.processed) {
      return;
    }
    obj.userData.processed = true;
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(obj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the object at origin
    obj.position.set(-center.x, -center.y, -center.z);
    
    // Calculate scale to fit in viewport (target size ~4 units for better fit)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 4;
    const autoScale = maxDim > 0 ? targetSize / maxDim : 1;
    
    // Apply scale to the group
    groupRef.current.scale.setScalar(autoScale);
    
    // Process the loaded object
    const materialMap = {};
    let materialIndex = 0;
    
    obj.traverse((child) => {
      if (child.isMesh) {
        
        // Fix geometry normals
        if (child.geometry) {
          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }
        }
        
        // Fix or create material - Use MeshPhysicalMaterial for advanced effects
        if (!child.material) {
          child.material = new THREE.MeshPhysicalMaterial({
            color: 0xcccccc,
            metalness: 0.3,
            roughness: 0.7,
            side: THREE.DoubleSide,
          });
        } else {
          // Handle array of materials
          if (Array.isArray(child.material)) {
            child.material = child.material[0] || new THREE.MeshPhysicalMaterial({
              color: 0xcccccc,
              metalness: 0.3,
              roughness: 0.7,
              side: THREE.DoubleSide,
            });
          }
          
          // Make double-sided
          child.material.side = THREE.DoubleSide;
          
          // Ensure color exists
          if (!child.material.color) {
            child.material.color = new THREE.Color(0xcccccc);
          }
          
          // Convert to MeshPhysicalMaterial for glass support
          if (child.material.type !== 'MeshPhysicalMaterial') {
            const oldColor = child.material.color.clone();
            const oldMetalness = child.material.metalness || 0.3;
            const oldRoughness = child.material.roughness || 0.7;
            child.material = new THREE.MeshPhysicalMaterial({
              color: oldColor,
              metalness: oldMetalness,
              roughness: oldRoughness,
              side: THREE.DoubleSide,
            });
          }
        }
        
        // Store material info
        const materialName = child.material.name || `Material_${materialIndex++}`;
        child.material.name = materialName;
        
        materialMap[materialName] = {
          color: child.material.color ? child.material.color.getHexString() : 'cccccc',
          metalness: child.material.metalness !== undefined ? child.material.metalness : 0.3,
          roughness: child.material.roughness !== undefined ? child.material.roughness : 0.7,
          wireframe: false
        };
        
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    if (ref) {
      ref.current = groupRef.current;
    }
    
    if (onMaterialUpdate) {
      onMaterialUpdate(materialMap);
    }
    
    return () => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [obj]); // Only run when obj changes

  return (
    <group ref={groupRef}>
      <primitive object={obj} />
    </group>
  );
});

OBJModel.displayName = 'OBJModel';

// GLTF/GLB Model Component
const GLTFModel = forwardRef(({ url, scale = 1, onMaterialUpdate }, ref) => {
  const { scene, materials } = useGLTF(url);
  const groupRef = useRef();
  
  useEffect(() => {
    if (!scene || !groupRef.current) return;
    
    // Only process if not already processed
    if (scene.userData.processed) {
      return;
    }
    scene.userData.processed = true;
    
    // Calculate bounding box
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    // Center the scene at origin
    scene.position.set(-center.x, -center.y, -center.z);
    
    // Calculate scale to fit in viewport (target size ~4 units for better fit)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 4;
    const autoScale = maxDim > 0 ? targetSize / maxDim : 1;
    
    // Apply scale to the group
    groupRef.current.scale.setScalar(autoScale);
    
    if (materials && onMaterialUpdate) {
      onMaterialUpdate(materials);
    }
    
    if (ref) {
      ref.current = groupRef.current;
    }
    
    // Cleanup
    return () => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    };
  }, [scene]); // Only run when scene changes

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
});

GLTFModel.displayName = 'GLTFModel';

// Model wrapper that selects the right loader based on file extension
const Model = forwardRef((props, ref) => {
  const { url, fileName } = props;
  
  // Extract file extension from fileName if available, otherwise from URL
  let fileExtension = '';
  
  if (fileName) {
    // Get extension from filename
    const parts = fileName.split('.');
    if (parts.length > 1) {
      fileExtension = parts[parts.length - 1].toLowerCase();
    }
  } else {
    // Fallback: try to get extension from URL
    const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/);
    if (match) {
      fileExtension = match[1].toLowerCase();
    }
  }
  
  if (!fileExtension) {
    console.error('Could not determine file extension. URL:', url, 'FileName:', fileName);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
  
  try {
    if (fileExtension === 'obj') {
      return <OBJModel {...props} ref={ref} />;
    } else if (fileExtension === 'glb' || fileExtension === 'gltf') {
      return <GLTFModel {...props} ref={ref} />;
    } else {
      console.error('Unsupported file type:', fileExtension);
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      );
    }
  } catch (error) {
    console.error('Error loading model:', error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
});

Model.displayName = 'Model';

const CameraControls = forwardRef(({ onUpdate }, ref) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  // Expose the controls ref to parent
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    },
    setView: (position, target = [0, 0, 0]) => {
      if (controlsRef.current) {
        camera.position.set(...position);
        controlsRef.current.target.set(...target);
        controlsRef.current.update();
      }
    },
    getCamera: () => camera,
    getControls: () => controlsRef.current,
    get enabled() {
      return controlsRef.current?.enabled;
    },
    set enabled(value) {
      if (controlsRef.current) {
        controlsRef.current.enabled = value;
      }
    }
  }));

  const handleEnd = useCallback(() => {
    if (onUpdate) {
      onUpdate({
        position: [camera.position.x, camera.position.y, camera.position.z],
        rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z]
      });
    }
  }, [camera.position, camera.rotation, onUpdate]);
  
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

const ModelViewer = forwardRef(({ modelUrl, fileName, onCameraUpdate, onMaterialsLoaded, artisticMaterialType = 'standard', materials: propMaterials = {}, onResetScene }, ref) => {
  const [materials, setMaterials] = useState({});
  const [cameraType, setCameraType] = useState('perspective');
  const [showGizmo, setShowGizmo] = useState(false);
  const [gizmoMode, setGizmoMode] = useState('translate');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modelRef = useRef();
  const controlsRef = useRef();
  const sceneRef = useRef();
  const transformControlsRef = useRef();
  const containerRef = useRef();

  const handleMaterialsLoaded = useCallback((mats) => {
    setMaterials(mats);
    onMaterialsLoaded?.(mats);
  }, [onMaterialsLoaded]);

  // Handle camera updates
  const handleCameraUpdate = useCallback((state) => {
    onCameraUpdate?.(state);
  }, [onCameraUpdate]);

  // Reset scene handler
  const handleResetScene = useCallback(() => {
    setShowGizmo(false);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    if (onResetScene) {
      onResetScene();
    }
  }, [onResetScene]);

  // Fullscreen handlers
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Apply artistic material styles to the model
  useEffect(() => {
    if (!modelRef.current) {
      return;
    }

    modelRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        
        // Store original color if not already stored
        if (!child.material.userData.originalColor) {
          child.material.userData.originalColor = child.material.color.clone();
        }
        
        // COMPLETE RESET - Clear all previous effects
        child.material.wireframe = false;
        child.material.transparent = false;
        child.material.opacity = 1.0;
        child.material.flatShading = false;
        child.material.emissiveIntensity = 0;
        child.material.emissive.set(0x000000);
        child.material.toneMapped = true;
        child.material.metalness = 0.3;
        child.material.roughness = 0.7;
        child.material.envMapIntensity = 1.0;
        child.material.transmission = 0;
        child.material.thickness = 0;
        child.material.ior = 1.5;
        child.material.clearcoat = 0;
        child.material.clearcoatRoughness = 0;
        child.material.reflectivity = 0.5;
        // Restore original color
        child.material.color.copy(child.material.userData.originalColor);
        
        switch (artisticMaterialType) {
          case 'wireframe':
            child.material.wireframe = true;
            break;
          
          case 'metallic':
            child.material.metalness = 1.0;
            child.material.roughness = 0.1;
            child.material.envMapIntensity = 1.5;
            break;
          
          case 'neon':
            // Neon glow effect with orbit blue wireframe
            child.material.wireframe = true;
            // Use orbit blue color for neon glow
            const orbitBlue = new THREE.Color(0x00D9FF); // Bright cyan/electric blue
            child.material.emissive.copy(orbitBlue);
            child.material.emissiveIntensity = 2.0;
            child.material.toneMapped = false;
            // Keep the wireframe color bright orbit blue
            child.material.color.copy(orbitBlue);
            break;
          
          case 'crystal':
            child.material.flatShading = true;
            child.material.metalness = 0.8;
            child.material.roughness = 0.2;
            child.material.envMapIntensity = 1.2;
            child.geometry.computeVertexNormals();
            break;
          
          case 'glass':
            // Use MeshPhysicalMaterial properties for proper glass
            child.material.transparent = true;
            child.material.opacity = 0.3;
            child.material.metalness = 0.0;
            child.material.roughness = 0.0;
            child.material.envMapIntensity = 1.5;
            child.material.clearcoat = 1.0;
            child.material.clearcoatRoughness = 0.0;
            // Enable transmission for glass refraction
            if (child.material.transmission !== undefined) {
              child.material.transmission = 1.0;
              child.material.thickness = 1.0;
              child.material.ior = 1.5;
            }
            // Subtle tint
            child.material.color.setRGB(0.95, 0.97, 1.0);
            break;
          
          case 'toon':
            child.material.flatShading = true;
            child.geometry.computeVertexNormals();
            break;
          
          default: // standard
            const matData = propMaterials[child.material.name];
            if (matData) {
              child.material.metalness = matData.metalness || 0.3;
              child.material.roughness = matData.roughness || 0.7;
              if (matData.color) {
                child.material.color.setHex(parseInt(matData.color, 16));
              }
              child.material.wireframe = matData.wireframe || false;
            }
            break;
        }
        
        child.material.needsUpdate = true;
      }
    });
  }, [artisticMaterialType, propMaterials, modelUrl]);

  return (
    <div ref={containerRef} className="model-viewer" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxHeight: '90vh',
        overflowY: 'auto',
        minWidth: '280px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(99, 102, 241, 0.3)'
      }}>
        {/* Header */}
        <div style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          color: 'white',
          borderBottom: '2px solid rgba(99, 102, 241, 0.5)',
          paddingBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🎮 3D Controls
        </div>

        {/* Reset Scene Button */}
        <button
          onClick={handleResetScene}
          style={{
            padding: '12px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
        >
          🎯 Reset Scene
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          style={{
            padding: '12px 20px',
            backgroundColor: isFullscreen ? '#10b981' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = isFullscreen ? '#059669' : '#4f46e5'}
          onMouseLeave={(e) => e.target.style.backgroundColor = isFullscreen ? '#10b981' : '#6366f1'}
        >
          {isFullscreen ? '🗗 Exit Fullscreen' : '⛶ Fullscreen'}
        </button>

        {/* Transform Gizmo Controls */}
        <div style={{
          padding: '15px',
          background: 'rgba(236, 72, 153, 0.15)',
          borderRadius: '8px',
          border: '1px solid rgba(236, 72, 153, 0.3)'
        }}>
          <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '15px', fontSize: '15px' }}>
            🎮 Transform Gizmo
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label htmlFor="transform-gizmo-toggle" style={{
              color: 'white',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}>
              <input
                id="transform-gizmo-toggle"
                name="transform-gizmo-toggle"
                type="checkbox"
                checked={showGizmo}
                onChange={(e) => setShowGizmo(e.target.checked)}
                style={{ marginRight: '8px', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              Enable Transform Gizmo
            </label>

            {showGizmo && (
              <div style={{ marginTop: '8px' }}>
                <label style={{ color: '#ccc', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                  Gizmo Mode:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => setGizmoMode('translate')}
                    style={{
                      padding: '8px',
                      backgroundColor: gizmoMode === 'translate' ? '#6366f1' : '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    Move
                  </button>
                  <button
                    onClick={() => setGizmoMode('rotate')}
                    style={{
                      padding: '8px',
                      backgroundColor: gizmoMode === 'rotate' ? '#6366f1' : '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    Rotate
                  </button>
                  <button
                    onClick={() => setGizmoMode('scale')}
                    style={{
                      padding: '8px',
                      backgroundColor: gizmoMode === 'scale' ? '#6366f1' : '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    Scale
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.15)',
          borderRadius: '8px',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          fontSize: '11px',
          color: '#94a3b8',
          lineHeight: '1.6'
        }}>
          <div style={{ fontWeight: 'bold', color: '#60a5fa', marginBottom: '6px' }}>💡 Tips:</div>
          <div>• Click Fullscreen for immersive view</div>
          <div>• Enable gizmo for interactive transforms</div>
          <div>• Models auto-center and scale on load</div>
          <div>• Use mouse to orbit, zoom, and pan</div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={cameraType === 'perspective' 
          ? { position: [5, 5, 5], fov: 50 }
          : { position: [5, 5, 5], zoom: 100, orthographic: true }
        }
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          physicallyCorrectLights: true
        }}
        onCreated={({ camera, gl }) => {
          // Enable tone mapping for better colors
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.0;
          
          // Save initial camera state
          handleCameraUpdate({
            position: [camera.position.x, camera.position.y, camera.position.z],
            rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z]
          });
        }}
      >
        <Suspense fallback={null}>
          {/* Environment for reflections (glass and metallic materials) */}
          <Environment preset="city" background={false} />
          
          {/* Fixed Lights */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />
          
          {/* Grid Helper */}
          <gridHelper args={[20, 20, '#444444', '#222222']} />
          
          {modelUrl && (
            <Suspense fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="#4a6bff" />
              </mesh>
            }>
              <Model 
                key={modelUrl}
                ref={modelRef}
                url={modelUrl}
                fileName={fileName}
                onMaterialUpdate={handleMaterialsLoaded}
              />
            </Suspense>
          )}
          
          {/* Transform Gizmo */}
          {showGizmo && modelRef.current && (
            <TransformControls
              ref={transformControlsRef}
              object={modelRef.current}
              mode={gizmoMode}
              onMouseDown={() => {
                if (controlsRef.current) {
                  controlsRef.current.enabled = false;
                }
              }}
              onMouseUp={() => {
                if (controlsRef.current) {
                  controlsRef.current.enabled = true;
                }
              }}
            />
          )}
          
          <CameraControls 
            ref={controlsRef}
            onUpdate={handleCameraUpdate}
          />
        </Suspense>
      </Canvas>
      </div>
    </div>
  );
});

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer;
