import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

// Annotation marker component
const AnnotationMarker = ({ position, note, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial 
          color={isHovered ? '#ff4444' : '#ff0000'} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
      
      {isHovered && (
        <Html center>
          <div style={styles.tooltip}>
            <div style={styles.tooltipHeader}>
              <span>Note</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                style={styles.deleteButton}
              >
                ×
              </button>
            </div>
            <div style={styles.tooltipContent}>
              {note || 'No note provided'}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Main Annotation component
const Annotation = ({ modelRef, onAnnotationsChange }) => {
  const [annotations, setAnnotations] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [note, setNote] = useState('');
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const { camera, scene, gl } = useThree();

  const handleClick = (event) => {
    if (!isAdding && !editingId) return;
    
    // Calculate mouse position in normalized device coordinates
    const rect = gl.domElement.getBoundingClientRect();
    mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Update the raycaster
    raycaster.current.setFromCamera(mouse.current, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.current.intersectObject(modelRef.current, true);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      
      if (editingId) {
        // Update existing annotation
        setAnnotations(annotations.map(anno => 
          anno.id === editingId 
            ? { ...anno, position: [point.x, point.y, point.z] } 
            : anno
        ));
        setEditingId(null);
      } else {
        // Add new annotation
        const newAnnotation = {
          id: Date.now(),
          position: [point.x, point.y, point.z],
          note: note || 'New annotation',
          createdAt: new Date().toISOString()
        };
        
        setAnnotations([...annotations, newAnnotation]);
        onAnnotationsChange?.([...annotations, newAnnotation]);
        setNote('');
        setIsAdding(false);
      }
    }
  };

  const handleDelete = (id) => {
    const updated = annotations.filter(a => a.id !== id);
    setAnnotations(updated);
    onAnnotationsChange?.(updated);
  };

  const startEditing = (id) => {
    setEditingId(id);
    setIsAdding(true);
  };

  // Add click handler to the canvas
  useEffect(() => {
    if (isAdding || editingId) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
  }, [isAdding, editingId, note]);

  return (
    <>
      {annotations.map((annotation) => (
        <AnnotationMarker
          key={annotation.id}
          position={annotation.position}
          note={annotation.note}
          onEdit={() => startEditing(annotation.id)}
          onDelete={() => handleDelete(annotation.id)}
        />
      ))}
      
      {isAdding && (
        <div style={styles.annotationControls}>
          <h3 style={styles.annotationHeader}>
            {editingId ? 'Move marker to new position' : 'Click on the model to place marker'}
          </h3>
          <div style={styles.inputGroup}>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter note for this annotation"
              style={styles.textInput}
            />
            <button 
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setNote('');
              }}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    maxWidth: '200px',
    pointerEvents: 'auto',
    transform: 'translateX(-50%)',
  },
  tooltipHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
    borderBottom: '1px solid #444',
    paddingBottom: '4px',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#ff4444',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0 4px',
  },
  tooltipContent: {
    fontSize: '12px',
    lineHeight: '1.4',
  },
  annotationControls: {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '10px 15px',
    borderRadius: '4px',
    zIndex: 1000,
    color: 'white',
    textAlign: 'center',
  },
  annotationHeader: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#4a6bff',
  },
  inputGroup: {
    display: 'flex',
    gap: '8px',
  },
  textInput: {
    flex: 1,
    padding: '6px 10px',
    border: '1px solid #444',
    borderRadius: '4px',
    backgroundColor: '#333',
    color: 'white',
    fontSize: '12px',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: '#ff4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
};

export default Annotation;
