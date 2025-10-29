import { useState, useCallback, useEffect } from 'react';

const MaterialEditor = ({ materials, onMaterialChange }) => {
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [textureType, setTextureType] = useState('color'); // 'color', 'roughness', 'metalness', 'normal', 'ao'
  
  // Set first material as active by default
  useEffect(() => {
    if (materials && Object.keys(materials).length > 0 && !activeMaterial) {
      setActiveMaterial(Object.keys(materials)[0]);
    }
  }, [materials, activeMaterial]);

  const handleColorChange = (e) => {
    if (!activeMaterial) return;
    onMaterialChange(activeMaterial, 'color', e.target.value);
  };

  const handleSliderChange = (property, value) => {
    if (!activeMaterial) return;
    onMaterialChange(activeMaterial, property, parseFloat(value));
  };

  const handleTextureUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      onMaterialChange(activeMaterial, `${type}Map`, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  if (!materials || Object.keys(materials).length === 0) {
    return <div style={styles.noMaterials}>No materials found in the model</div>;
  }

  const currentMaterial = activeMaterial ? materials[activeMaterial] : null;

  return (
    <div style={styles.container}>
      <div style={styles.materialSelector}>
        <label style={styles.label}>Material:</label>
        <select 
          value={activeMaterial || ''}
          onChange={(e) => setActiveMaterial(e.target.value)}
          style={styles.select}
        >
          {Object.keys(materials).map((name) => (
            <option key={name} value={name}>
              {name || 'Unnamed Material'}
            </option>
          ))}
        </select>
      </div>

      {currentMaterial && (
        <div style={styles.materialControls}>
          <div style={styles.tabs}>
            <button 
              style={{...styles.tab, ...(textureType === 'color' ? styles.activeTab : {})}}
              onClick={() => setTextureType('color')}
            >
              Color
            </button>
            <button 
              style={{...styles.tab, ...(textureType === 'textures' ? styles.activeTab : {})}}
              onClick={() => setTextureType('textures')}
            >
              Textures
            </button>
            <button 
              style={{...styles.tab, ...(textureType === 'advanced' ? styles.activeTab : {})}}
              onClick={() => setTextureType('advanced')}
            >
              Advanced
            </button>
          </div>

          <div style={styles.content}>
            {textureType === 'color' && (
              <div>
                <div style={styles.controlGroup}>
                  <label style={styles.label}>Base Color</label>
                  <input
                    type="color"
                    value={currentMaterial.color || '#ffffff'}
                    onChange={handleColorChange}
                    style={styles.colorInput}
                  />
                </div>
                
                <div style={styles.controlGroup}>
                  <label style={styles.label}>
                    Metalness: {currentMaterial.metalness?.toFixed(2) || '0.00'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentMaterial.metalness || 0}
                    onChange={(e) => handleSliderChange('metalness', e.target.value)}
                    style={styles.slider}
                  />
                </div>

                <div style={styles.controlGroup}>
                  <label style={styles.label}>
                    Roughness: {currentMaterial.roughness?.toFixed(2) || '0.50'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentMaterial.roughness ?? 0.5}
                    onChange={(e) => handleSliderChange('roughness', e.target.value)}
                    style={styles.slider}
                  />
                </div>

                <div style={styles.controlGroup}>
                  <label style={styles.label}>
                    Emissive: {currentMaterial.emissiveIntensity?.toFixed(2) || '0.00'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={currentMaterial.emissiveIntensity || 0}
                    onChange={(e) => handleSliderChange('emissiveIntensity', e.target.value)}
                    style={styles.slider}
                  />
                </div>
              </div>
            )}

            {textureType === 'textures' && (
              <div>
                <div style={styles.textureUpload}>
                  <label style={styles.label}>Color Map</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleTextureUpload(e, 'map')}
                    style={styles.fileInput}
                  />
                </div>

                <div style={styles.textureUpload}>
                  <label style={styles.label}>Normal Map</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleTextureUpload(e, 'normal')}
                    style={styles.fileInput}
                  />
                </div>

                <div style={styles.textureUpload}>
                  <label style={styles.label}>Roughness Map</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleTextureUpload(e, 'roughness')}
                    style={styles.fileInput}
                  />
                </div>

                <div style={styles.textureUpload}>
                  <label style={styles.label}>Metalness Map</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleTextureUpload(e, 'metalness')}
                    style={styles.fileInput}
                  />
                </div>

                <div style={styles.textureUpload}>
                  <label style={styles.label}>Ambient Occlusion</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleTextureUpload(e, 'ao')}
                    style={styles.fileInput}
                  />
                </div>
              </div>
            )}

            {textureType === 'advanced' && (
              <div>
                <div style={styles.controlGroup}>
                  <label style={styles.label}>
                    Opacity: {currentMaterial.opacity?.toFixed(2) || '1.00'}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={currentMaterial.opacity ?? 1}
                    onChange={(e) => handleSliderChange('opacity', e.target.value)}
                    style={styles.slider}
                  />
                </div>

                <div style={styles.controlGroup}>
                  <label style={styles.label}>
                    Wireframe
                    <input
                      type="checkbox"
                      checked={currentMaterial.wireframe || false}
                      onChange={(e) => onMaterialChange(activeMaterial, 'wireframe', e.target.checked)}
                      style={styles.checkbox}
                    />
                  </label>
                </div>

                <div style={styles.controlGroup}>
                  <label style={styles.label}>
                    Flat Shading
                    <input
                      type="checkbox"
                      checked={currentMaterial.flatShading || false}
                      onChange={(e) => onMaterialChange(activeMaterial, 'flatShading', e.target.checked)}
                      style={styles.checkbox}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    color: '#fff',
    padding: '10px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '13px',
  },
  materialSelector: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#ccc',
    fontSize: '12px',
  },
  select: {
    width: '100%',
    padding: '6px',
    backgroundColor: '#333',
    color: '#fff',
    border: '1px solid #555',
    borderRadius: '4px',
    fontSize: '12px',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #444',
    marginBottom: '10px',
  },
  tab: {
    flex: 1,
    padding: '6px 0',
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '12px',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#fff',
    borderBottom: '2px solid #4a6bff',
  },
  content: {
    padding: '10px 0',
  },
  controlGroup: {
    marginBottom: '12px',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#4a6bff',
  },
  colorInput: {
    width: '100%',
    height: '30px',
    padding: '0',
    border: '1px solid #444',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  textureUpload: {
    marginBottom: '10px',
  },
  fileInput: {
    width: '100%',
    fontSize: '11px',
  },
  checkbox: {
    marginLeft: '8px',
    verticalAlign: 'middle',
  },
  noMaterials: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px',
  },
};

export default MaterialEditor;
