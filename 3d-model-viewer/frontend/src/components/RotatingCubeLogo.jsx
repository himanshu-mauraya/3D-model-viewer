import React, { useEffect, useRef } from 'react';

const RotatingCubeLogo = ({ size = 40, strokeColor = '#4A90E2', strokeWidth = 1.5 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const centerX = w / 2;
    const centerY = h / 2;

    // Cube vertices (normalized to -1 to 1)
    const vertices = [
      // Front face
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [0.5, 0.5, 0.5],
      [-0.5, 0.5, 0.5],
      // Back face
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5],
      [0.5, 0.5, -0.5],
      [-0.5, 0.5, -0.5],
    ];

    // Cube edges (vertex indices)
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Front face
      [4, 5], [5, 6], [6, 7], [7, 4], // Back face
      [0, 4], [1, 5], [2, 6], [3, 7], // Back connections
    ];

    // Rotation matrices
    const rotateX = (point, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        point[0],
        point[1] * cos - point[2] * sin,
        point[1] * sin + point[2] * cos,
      ];
    };

    const rotateY = (point, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        point[0] * cos + point[2] * sin,
        point[1],
        -point[0] * sin + point[2] * cos,
      ];
    };

    const rotateZ = (point, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [
        point[0] * cos - point[1] * sin,
        point[0] * sin + point[1] * cos,
        point[2],
      ];
    };

    const animate = () => {
      // Update rotation
      rotationRef.current.x += 0.003;
      rotationRef.current.y += 0.005;
      rotationRef.current.z += 0.002;

      // Clear canvas with dark background
      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, w, h);

      // Transform and project vertices
      const projectedVertices = vertices.map((vertex) => {
        let point = [...vertex];
        point = rotateX(point, rotationRef.current.x);
        point = rotateY(point, rotationRef.current.y);
        point = rotateZ(point, rotationRef.current.z);

        // Perspective projection
        const scale = 5 / (5 + point[2]);
        const x = centerX + point[0] * scale * (w / 3);
        const y = centerY + point[1] * scale * (h / 3);
        const z = point[2];

        return { x, y, z };
      });

      // Sort edges by average z-depth (painter's algorithm - simplified)
      const edgesWithDepth = edges.map((edge) => {
        const avgZ = (projectedVertices[edge[0]].z + projectedVertices[edge[1]].z) / 2;
        return { edge, avgZ };
      });

      edgesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

      // Draw edges
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      edgesWithDepth.forEach(({ edge }) => {
        const start = projectedVertices[edge[0]];
        const end = projectedVertices[edge[1]];

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [strokeColor, strokeWidth]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        display: 'block',
        background: 'transparent',
      }}
    />
  );
};

export default RotatingCubeLogo;
