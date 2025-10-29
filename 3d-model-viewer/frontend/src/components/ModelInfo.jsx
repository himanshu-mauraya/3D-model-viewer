import { useEffect, useState } from 'react';
import * as THREE from 'three';

const ModelInfo = ({ modelRef, fileName, fileType }) => {
  const [modelInfo, setModelInfo] = useState({
    vertices: 0,
    triangles: 0,
    dimensions: { width: 0, height: 0, depth: 0 },
    materials: 0
  });

  useEffect(() => {
    if (!modelRef?.current) return;

    const updateModelInfo = () => {
      const scene = modelRef.current;
      if (!scene) return;

      let totalVertices = 0;
      let totalTriangles = 0;
      let materialCount = 0;
      const bbox = new THREE.Box3().setFromObject(scene);
      const dimensions = new THREE.Vector3();
      bbox.getSize(dimensions);

      scene.traverse((child) => {
        if (child.isMesh) {
          const geometry = child.geometry;
          if (geometry) {
            if (geometry.isBufferGeometry) {
              totalVertices += geometry.attributes.position?.count || 0;
              totalTriangles += (geometry.index?.count || geometry.attributes.position?.count || 0) / 3;
            }
            if (child.material) {
              materialCount++;
            }
          }
        }
      });

      setModelInfo({
        vertices: totalVertices.toLocaleString(),
        triangles: Math.floor(totalTriangles).toLocaleString(),
        dimensions: {
          width: dimensions.x.toFixed(2),
          height: dimensions.y.toFixed(2),
          depth: dimensions.z.toFixed(2)
        },
        materials: materialCount
      });
    };

    // Use requestAnimationFrame to ensure the model is loaded
    const timer = setTimeout(updateModelInfo, 500);
    return () => clearTimeout(timer);
  }, [modelRef]);

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>Model Information</h3>
      
      <div style={styles.infoGrid}>
        <div style={styles.infoRow}>
          <span style={styles.label}>File Name:</span>
          <span style={styles.value} title={fileName}>
            {fileName || 'N/A'}
          </span>
        </div>
        
        <div style={styles.infoRow}>
          <span style={styles.label}>File Type:</span>
          <span style={styles.value}>
            {fileType ? fileType.toUpperCase() : 'N/A'}
          </span>
        </div>
        
        <div style={styles.infoRow}>
          <span style={styles.label}>Vertices:</span>
          <span style={styles.value}>{modelInfo.vertices}</span>
        </div>
        
        <div style={styles.infoRow}>
          <span style={styles.label}>Triangles:</span>
          <span style={styles.value}>{modelInfo.triangles}</span>
        </div>
        
        <div style={styles.infoRow}>
          <span style={styles.label}>Materials:</span>
          <span style={styles.value}>{modelInfo.materials}</span>
        </div>
        
        <div style={styles.infoRow}>
          <span style={styles.label}>Dimensions:</span>
          <span style={styles.value}>
            W: {modelInfo.dimensions.width} × H: {modelInfo.dimensions.height} × D: {modelInfo.dimensions.depth}
          </span>
        </div>
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
    fontSize: '13px',
    marginBottom: '15px',
  },
  header: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    color: '#fff',
    borderBottom: '1px solid #444',
    paddingBottom: '8px',
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#aaa',
    marginRight: '10px',
  },
  value: {
    color: '#fff',
    fontWeight: '500',
    maxWidth: '150px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

export default ModelInfo;
