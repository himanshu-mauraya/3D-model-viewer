import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const ModelUploader = ({ onModelLoaded }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = URL.createObjectURL(file);
      onModelLoaded({
        url,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
    };
    reader.readAsDataURL(file);
  }, [onModelLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'model/gltf-binary': ['.glb'],
      'model/gltf+json': ['.gltf'],
      'model/obj': ['.obj']
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`dropzone ${isDragActive ? 'active' : ''}`}
      style={{
        border: '2px dashed #666',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
        backgroundColor: isDragActive ? 'rgba(74, 107, 255, 0.1)' : 'transparent',
        borderColor: isDragActive ? '#4a6bff' : '#666'
      }}
    >
      <input {...getInputProps()} />
      <p>Drag & drop a 3D model here, or click to select</p>
      <small>Supports: .glb, .gltf, .obj</small>
    </div>
  );
};

export default ModelUploader;
