import { createContext, useContext, useState, useCallback } from 'react';

const SceneContext = createContext();

export function SceneProvider({ children }) {
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState(null);

  const addScene = useCallback((scene) => {
    const newScene = { 
      ...scene, 
      id: Date.now(),
      createdAt: new Date().toISOString(),
      materials: {}
    };
    
    setScenes(prev => [...prev, newScene]);
    setCurrentScene(newScene);
    
    return newScene;
  }, []);

  const removeScene = useCallback((sceneId) => {
    setScenes(prev => prev.filter(s => s.id !== sceneId));
    setCurrentScene(prev => prev?.id === sceneId ? null : prev);
  }, []);

  const updateScene = useCallback((sceneId, updates) => {
    setScenes(prev => 
      prev.map(scene => 
        scene.id === sceneId ? { ...scene, ...updates } : scene
      )
    );
    setCurrentScene(prev => 
      prev?.id === sceneId ? { ...prev, ...updates } : prev
    );
  }, []);

  const clearScenes = useCallback(() => {
    setScenes([]);
    setCurrentScene(null);
  }, []);

  return (
    <SceneContext.Provider 
      value={{ 
        scenes, 
        currentScene, 
        addScene, 
        removeScene, 
        updateScene,
        clearScenes,
        setCurrentScene 
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export const useScene = () => {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error('useScene must be used within a SceneProvider');
  }
  return context;
};
