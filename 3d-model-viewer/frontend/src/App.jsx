import { useState, useRef, useCallback } from 'react';
import { SceneProvider, useScene } from './context/SceneContext';
import ModelViewer from './components/ModelViewer';
import ModelUploader from './components/ModelUploader';
import BuiltinModel from './components/BuiltinModel';
import GeometricShapes from './components/GeometricShapes';
import ArtisticShapes from './components/ArtisticShapes';
import AdvancedShapes from './components/AdvancedShapes';
import RotatingCubeLogo from './components/RotatingCubeLogo';
import './App.css';

function AppContent() {
  const { scenes, currentScene, addScene, updateScene, removeScene, clearScenes, setCurrentScene } = useScene();
  const [activeTab, setActiveTab] = useState('models');
  const [artisticMaterialType, setArtisticMaterialType] = useState('standard');
  const [shapesMode, setShapesMode] = useState('basic'); // 'basic' or 'advanced'
  const [addReplaceMode, setAddReplaceMode] = useState('replace'); // 'add' or 'replace'
  const modelRef = useRef();

  const handleDeleteScene = (sceneId, e) => {
    e.stopPropagation(); // Prevent selecting the scene when clicking delete
    if (window.confirm('Are you sure you want to delete this model?')) {
      removeScene(sceneId);
    }
  };

  const handleModelLoaded = (modelData) => {
    if (addReplaceMode === 'replace' && scenes.length > 0) {
      clearScenes();
    }
    
    addScene({
      ...modelData,
      materials: {},
      cameraState: null,
      artisticMaterialType: 'standard'
    });
  };

  const handleResetScene = useCallback(() => {
    clearScenes();
  }, [clearScenes]);

  const handleMaterialChange = (materialName, newMaterial) => {
    if (!currentScene) return;
    
    updateScene(currentScene.id, {
      materials: {
        ...currentScene.materials,
        [materialName]: newMaterial
      }
    });
  };

  const handleCameraUpdate = (cameraState) => {
    if (currentScene) {
      updateScene(currentScene.id, { cameraState });
    }
  };

  const handleMaterialsLoaded = (materials) => {
    if (!currentScene) return;
    
    // Materials are already processed with hex strings from ModelViewer
    updateScene(currentScene.id, {
      materials: materials
    });
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="app-header" style={{display:'flex',alignItems:'center',gap:'12px'}}>
          {/* Rotating 3D wireframe cube logo */}
          <div className="logo" style={{width:44,height:44,background:'#0F172A',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',padding:'4px'}}>
            <RotatingCubeLogo size={36} strokeColor="#4A90E2" strokeWidth={1.2} />
          </div>
          <div>
            <h1>3D Visualizer</h1>
            <p>Professional 3D Rendering</p>
          </div>
        </div>
        <div className="tabs">
          <button 
            className={activeTab === 'models' ? 'active' : ''}
            onClick={() => setActiveTab('models')}
          >
            Models
          </button>
          <button 
            className={activeTab === 'shapes' ? 'active' : ''}
            onClick={() => setActiveTab('shapes')}
          >
            Shapes
          </button>
        </div>

        <div className="panel-content">
          {activeTab === 'models' ? (
            <>
              {/* Add/Replace Mode Toggle */}
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15))',
                borderRadius: '8px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                marginBottom: '15px'
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 'bold', 
                  color: 'white', 
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📦 Upload Mode
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setAddReplaceMode('replace')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: addReplaceMode === 'replace' ? '#6366f1' : '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    🔄 Replace
                  </button>
                  <button
                    onClick={() => setAddReplaceMode('add')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: addReplaceMode === 'add' ? '#6366f1' : '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    ➕ Add
                  </button>
                </div>
                <p style={{ 
                  fontSize: '11px', 
                  color: 'var(--text-muted)', 
                  marginTop: '8px', 
                  marginBottom: '0',
                  fontStyle: 'italic' 
                }}>
                  {addReplaceMode === 'replace' 
                    ? 'New models will replace existing ones' 
                    : 'New models will be added to the scene'}
                </p>
              </div>

              <ModelUploader onModelLoaded={handleModelLoaded} />

              {/* Artistic Material Picker for Models */}
              <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(74,144,226,0.06)', borderRadius: '8px', border: '1px solid rgba(74,144,226,0.12)' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>✨ Artistic Material Style</label>
                <select value={artisticMaterialType} onChange={(e) => setArtisticMaterialType(e.target.value)} style={{ width: '100%', marginTop: '8px', padding: '10px', backgroundColor: 'var(--bg-dark)', color: 'white', borderRadius: '6px' }}>
                  <option value="standard" style={{ color: 'black' }}>Standard PBR</option>
                  <option value="wireframe" style={{ color: 'black' }}>Wireframe</option>
                  <option value="metallic" style={{ color: 'black' }}>Liquid Metal</option>
                  <option value="neon" style={{ color: 'black' }}>Neon Glow</option>
                  <option value="crystal" style={{ color: 'black' }}>Crystal / Low Poly</option>
                  <option value="glass" style={{ color: 'black' }}>Liquid Glass</option>
                  <option value="toon" style={{ color: 'black' }}>Toon Shader</option>
                </select>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>This style will be applied to uploaded models immediately.</p>
              </div>

              {/* Quick Presets / Templates */}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => addScene({ name: 'Wireframe Logo', builtin: true, builtinType: 'wireframeLogo', artisticMaterialType })}
                  style={{ flex: 1, padding: '10px', background: '#111827', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Demo: Wireframe Logo
                </button>
                <button
                  onClick={() => addScene({ name: 'Sample Shapes', builtin: true, builtinType: 'sampleShapes', artisticMaterialType })}
                  style={{ flex: 1, padding: '10px', background: '#111827', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Sample Shapes
                </button>
              </div>
              
              {scenes.length > 0 ? (
                <div>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '12px', 
                    marginTop: '16px', 
                    marginBottom: '8px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    📁 Uploaded Models ({scenes.length})
                  </div>
                  <div className="scene-list">
                    {scenes.map(scene => (
                  <div 
                    key={scene.id} 
                    className={`scene-item ${currentScene?.id === scene.id ? 'active' : ''}`}
                    onClick={() => {
                      if (currentScene?.id !== scene.id) {
                        setCurrentScene(scene);
                      }
                    }}
                  >
                    <span style={{ flex: 1 }}>{scene.name}</span>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteScene(scene.id, e)}
                      title="Delete this model"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
                  </div>
                </div>
              ) : (
                <div style={{
                  marginTop: '20px',
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  No models uploaded yet. <br />
                  Drag & drop a file above to get started! 🚀
                </div>
              )}
            </>
          ) : activeTab === 'shapes' ? (
            <div className="shapes-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>🔷 Shapes</h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <label style={{ fontSize: '12px', color: '#aaa' }}>Basic</label>
                  <button onClick={() => setShapesMode('basic')} style={{ padding: '6px 10px', background: shapesMode === 'basic' ? '#6366f1' : '#333', color: 'white', borderRadius: '6px' }}>Shapes</button>
                  <button onClick={() => setShapesMode('advanced')} style={{ padding: '6px 10px', background: shapesMode === 'advanced' ? '#6366f1' : '#333', color: 'white', borderRadius: '6px' }}>Advanced</button>
                </div>
              </div>

              <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.35)', borderRadius: '8px' }}>
                <p style={{ fontSize: '13px', color: 'rgb(32, 31, 31)', margin: 0 }}>Pick from basic geometric shapes or switch to advanced shapes which include parametric and shader-driven options.</p>
              </div>

              {/* Artistic Material Picker for Shapes */}
              <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.12)' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>✨ Artistic Material Style</label>
                <select value={artisticMaterialType} onChange={(e) => setArtisticMaterialType(e.target.value)} style={{ width: '100%', marginTop: '8px', padding: '10px', backgroundColor: 'var(--bg-dark)', color: 'white', borderRadius: '6px' }}>
                  <option value="standard" style={{ color: 'black' }}>Standard PBR</option>
                  <option value="wireframe" style={{ color: 'black' }}>Wireframe</option>
                  <option value="metallic" style={{ color: 'black' }}>Liquid Metal</option>
                  <option value="neon" style={{ color: 'black' }}>Neon Glow</option>
                  <option value="crystal" style={{ color: 'black' }}>Crystal / Low Poly</option>
                  <option value="glass" style={{ color: 'black' }}>Liquid Glass</option>
                  <option value="toon" style={{ color: 'black' }}>Toon Shader</option>
                </select>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>This style will be applied to all shapes in the canvas.</p>
              </div>
            </div>
          ) : activeTab === 'artistic' ? (
            <div className="shapes-info">
              <h3>✨ Artistic Forms</h3>
              <p style={{ fontSize: '13px', color: '#877c7c', marginBottom: '15px' }}>
                Great for showcasing Three.js power
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="shape-info-card" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 255, 0.05))' }}>
                  <strong>💧 Liquid Metal Blob</strong>
                  <p>Animated, soft-mesh object with morphing effects</p>
                </div>
                <div className="shape-info-card" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 255, 0.05))' }}>
                  <strong>🕸️ Wireframe Mesh</strong>
                  <p>Skeleton-style rendering of objects</p>
                </div>
                <div className="shape-info-card" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 255, 0.05))' }}>
                  <strong>💎 Crystal/Low Poly</strong>
                  <p>Faceted shape with hard edges</p>
                </div>
                <div className="shape-info-card" style={{ background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(255, 0, 255, 0.05))' }}>
                  <strong>🌐 Neon Grid / Tron</strong>
                  <p>Sci-fi inspired glowing shapes</p>
                </div>
              </div>
            </div>
          ) : activeTab === 'advanced' ? (
            <div className="shapes-info">
              <h3>🚀 Advanced Shapes</h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                Using Three.js libraries and shaders
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="shape-info-card">
                  <strong>🔸 Shape Generator</strong>
                  <p>Customize height, radius, faces, roughness</p>
                </div>
                <div className="shape-info-card">
                  <strong>🌀 Parametric Playground</strong>
                  <p>Input math formulas (sin/cos) to render shapes</p>
                </div>
                <div className="shape-info-card">
                  <strong>🫧 Marching Cubes</strong>
                  <p>Generate metaballs with organic blending</p>
                </div>
                <div className="shape-info-card">
                  <strong>📊 Instanced Meshes</strong>
                  <p>Render 1000s of objects with performance</p>
                </div>
              </div>
              
              <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(74, 144, 226, 0.1)', borderRadius: '8px', border: '1px solid rgba(74, 144, 226, 0.3)' }}>
                <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  🎨 Material Options
                </p>
                <p style={{ fontSize: '11px', color: '#999', margin: 0, lineHeight: '1.5' }}>
                  Solid • Metallic • Glass • Neon • Wireframe • Transparent
                </p>
              </div>
            </div>
          ) : (
            <div className="material-panel">
              {currentScene ? (
                <>
                  <div className="material-group" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(236, 72, 153, 0.1))', borderColor: 'var(--primary)' }}>
                    <h4 style={{ fontSize: '18px', marginBottom: '12px' }}>✨ Artistic Material Style</h4>
                    <div className="form-group">
                      <label htmlFor="artistic-material-type">Material Type</label>
                      <select 
                        id="artistic-material-type"
                        name="artistic-material-type"
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          backgroundColor: 'var(--bg-light)', 
                          color: 'white', 
                          border: '2px solid var(--border)', 
                          borderRadius: 'var(--radius-md)', 
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                        value={currentScene?.artisticMaterialType || 'standard'}
                        onChange={(e) => {
                          updateScene(currentScene.id, {
                            artisticMaterialType: e.target.value
                          });
                        }}
                      >
                        <option value="standard" style={{ color: 'black' }}>⚪ Standard PBR</option>
                        <option value="wireframe" style={{ color: 'black' }}>🕸️ Wireframe</option>
                        <option value="metallic" style={{ color: 'black' }}>⚙️ Liquid Metal</option>
                        <option value="neon" style={{ color: 'black' }}>🌟 Neon Glow (Wireframe + Glow)</option>
                        <option value="crystal" style={{ color: 'black' }}>💎 Crystal/Low Poly</option>
                        <option value="glass" style={{ color: 'black' }}>🔵 Liquid Glass (Apple-style)</option>
                        <option value="toon" style={{ color: 'black' }}>🎨 Toon Shader</option>
                      </select>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
                        <strong>✨ Neon Glow:</strong> Colored wireframe with emissive glow<br/>
                        <strong>💧 Liquid Glass:</strong> Transparent with refraction & reflections<br/>
                        <em>Note: Previous effects are cleared when switching materials</em>
                      </p>
                    </div>
                  </div>
                  
                  {Object.entries(currentScene.materials || {}).map(([name, material]) => {
                    const materialId = name.replace(/\s+/g, '-').toLowerCase();
                    return (
                    <div key={name} className="material-group">
                      <h4>{name}</h4>
                      <div className="form-group">
                        <label htmlFor={`${materialId}-color`}>Color</label>
                        <input
                          id={`${materialId}-color`}
                          name={`${materialId}-color`}
                          type="color"
                          value={`#${material.color}`}
                          onChange={(e) => handleMaterialChange(name, {
                            ...material,
                            color: e.target.value.replace('#', '')
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`${materialId}-metalness`}>Metalness: {material.metalness.toFixed(2)}</label>
                        <input
                          id={`${materialId}-metalness`}
                          name={`${materialId}-metalness`}
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={material.metalness}
                          onChange={(e) => handleMaterialChange(name, {
                            ...material,
                            metalness: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`${materialId}-roughness`}>Roughness: {material.roughness.toFixed(2)}</label>
                        <input
                          id={`${materialId}-roughness`}
                          name={`${materialId}-roughness`}
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={material.roughness}
                          onChange={(e) => handleMaterialChange(name, {
                            ...material,
                            roughness: parseFloat(e.target.value)
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor={`${materialId}-wireframe`}>
                          <input
                            id={`${materialId}-wireframe`}
                            name={`${materialId}-wireframe`}
                            type="checkbox"
                            checked={material.wireframe || false}
                            onChange={(e) => handleMaterialChange(name, {
                              ...material,
                              wireframe: e.target.checked
                            })}
                            style={{ marginRight: '8px' }}
                          />
                          Wireframe Mode
                        </label>
                      </div>
                    </div>
                  );
                  })}
                </>
              ) : (
                <p>No model selected</p>
              )}
            </div>
          )}
        </div>
      </aside>

      <main className="viewer-container">
        {activeTab === 'shapes' ? (
          shapesMode === 'basic' ? (
            <GeometricShapes artisticMaterialType={artisticMaterialType} />
          ) : (
            <AdvancedShapes artisticMaterialType={artisticMaterialType} />
          )
        ) : currentScene ? (
          <ModelViewer 
            modelUrl={currentScene.url}
            fileName={currentScene.name} 
            ref={modelRef}
            onCameraUpdate={handleCameraUpdate}
            onMaterialsLoaded={handleMaterialsLoaded}
            onResetScene={handleResetScene}
            artisticMaterialType={artisticMaterialType}
            materials={currentScene.materials || {}}
            builtinType={currentScene.builtinType}
          />
        ) : (
          <div className="empty-state">
            <div className="empty-state-logo">
              <RotatingCubeLogo size={100} strokeColor="#4A90E2" strokeWidth={2} />
            </div>
            <p>Upload a 3D model to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <SceneProvider>
      <AppContent />
    </SceneProvider>
  );
}
