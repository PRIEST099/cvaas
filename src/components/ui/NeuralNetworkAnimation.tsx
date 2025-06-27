import React from 'react';

interface NeuralNetworkAnimationProps {
  text?: string;
  subText?: string;
}

export function NeuralNetworkAnimation({ 
  text = "AI is optimizing your CV content...",
  subText = "This may take a few seconds"
}: NeuralNetworkAnimationProps) {
  // Generate random positions for nodes in each layer
  const generateNodes = (count: number, layerIndex: number) => {
    const nodes = [];
    const layerWidth = 100; // SVG viewBox width percentage
    const xPos = (layerIndex * layerWidth) / 4; // Distribute layers evenly
    
    for (let i = 0; i < count; i++) {
      nodes.push({
        id: `node-${layerIndex}-${i}`,
        x: xPos,
        y: 10 + (i * 80 / count), // Distribute nodes vertically
        delay: (layerIndex * 0.1) + (i * 0.05) // Staggered animation delay
      });
    }
    return nodes;
  };

  // Create 4 layers with varying node counts
  const layer1 = generateNodes(4, 0); // Input layer
  const layer2 = generateNodes(6, 1); // Hidden layer 1
  const layer3 = generateNodes(6, 2); // Hidden layer 2
  const layer4 = generateNodes(3, 3); // Output layer
  
  // All nodes combined
  const allNodes = [...layer1, ...layer2, ...layer3, ...layer4];
  
  // Generate connections between layers
  const generateConnections = (sourceLayer: any[], targetLayer: any[]) => {
    const connections = [];
    for (const source of sourceLayer) {
      for (const target of targetLayer) {
        connections.push({
          id: `conn-${source.id}-${target.id}`,
          x1: source.x,
          y1: source.y,
          x2: target.x,
          y2: target.y,
          delay: (source.delay + target.delay) / 2 // Average delay for smooth flow
        });
      }
    }
    return connections;
  };
  
  // Create connections between adjacent layers
  const connections1to2 = generateConnections(layer1, layer2);
  const connections2to3 = generateConnections(layer2, layer3);
  const connections3to4 = generateConnections(layer3, layer4);
  
  // All connections combined
  const allConnections = [...connections1to2, ...connections2to3, ...connections3to4];

  return (
    <div className="neural-network-container text-center py-12">
      <div className="inline-block">
        <svg 
          className="neural-network-svg" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="xMidYMid meet"
          width="240" 
          height="120"
        >
          {/* Render connections first (so they appear behind nodes) */}
          {allConnections.map((conn) => (
            <line
              key={conn.id}
              x1={`${conn.x1}%`}
              y1={`${conn.y1}%`}
              x2={`${conn.x2}%`}
              y2={`${conn.y2}%`}
              className={`connection line-flow delay-${Math.floor(conn.delay * 20)}`}
            />
          ))}
          
          {/* Render nodes */}
          {allNodes.map((node) => (
            <circle
              key={node.id}
              cx={`${node.x}%`}
              cy={`${node.y}%`}
              r="2"
              className={`node node-pulse delay-${Math.floor(node.delay * 20)}`}
            />
          ))}
        </svg>
      </div>
      <div className="text-blue-600 font-medium mt-4">{text}</div>
      <p className="text-sm text-gray-500 mt-2">{subText}</p>
    </div>
  );
}