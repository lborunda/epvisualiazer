import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EpistemicScore } from '../services/epistemicService';

interface VisualizerProps {
  scores: EpistemicScore[];
  cohesion: number;
}

// Thinker positions in 3D space (Semantic Cloud of 13 Systems)
const THINKERS = {
  // --- Core / Foundational (Inner Ring) ---
  "Empiricism (Hume)": new THREE.Vector3(-2, -2, 2),
  "Transcendental (Kant)": new THREE.Vector3(0, 3, 0),
  "Positivism (Popper)": new THREE.Vector3(2, -2, 2),
  "Falsificationism (Popper)": new THREE.Vector3(2, -2, 2),
  "Pragmatism (Dewey)": new THREE.Vector3(0, -3, 0), // Grounded/Practical
  "Abduction (Peirce)": new THREE.Vector3(-1, -1, 1), // Close to Empiricism but distinct

  // --- Structural / Methodological (Middle Ring) ---
  "Research Programmes (Lakatos)": new THREE.Vector3(4, -1, -2),
  "Bayesianism (Pearl)": new THREE.Vector3(3, 2, 3),
  "Critical Realism (Bhaskar)": new THREE.Vector3(-3, -3, -3),
  "Complex Systems (Prigogine)": new THREE.Vector3(3, 3, -3),
  "Metascience (Ioannidis)": new THREE.Vector3(4, -4, 4), // Rigorous/Checking

  // --- Critical / Situated / Interpretive (Outer Ring) ---
  "Interpretive (Kuhn)": new THREE.Vector3(-4, 1, -2),
  "Post-Structuralism (Foucault)": new THREE.Vector3(-5, 2, 2), // Deconstructing power
  "Feminist (Harding)": new THREE.Vector3(-4, -2, 4), // Situated
  "Indigenous (Kimmerer)": new THREE.Vector3(0, -5, 2), // Deeply grounded/relational
  "Phenomenology (Husserl)": new THREE.Vector3(-3, 4, -2), // Subjective experience
};

const THINKER_COLORS = {
  "Empiricism (Hume)": "#FF00FF",        // Magenta
  "Transcendental (Kant)": "#FFFFFF",    // White
  "Falsificationism (Popper)": "#00FFFF",      // Cyan
  "Pragmatism (Dewey)": "#FFD700",       // Gold (Utility)
  "Abduction (Peirce)": "#DDA0DD",       // Plum (Inference)
  
  "Research Programmes (Lakatos)": "#0088FF", // Blue
  "Bayesianism (Pearl)": "#00FF00",      // Lime (Probabilistic)
  "Critical Realism (Bhaskar)": "#FF3333", // Red (Ontology)
  "Complex Systems (Prigogine)": "#9D00FF", // Purple (Chaos)
  "Metascience (Ioannidis)": "#708090",  // Slate Gray (Rigour)
  
  "Interpretive (Kuhn)": "#FF8800",      // Orange
  "Post-Structuralism (Foucault)": "#FF0088", // Pink/Red (Critique)
  "Feminist (Harding)": "#FF99CC",       // Soft Pink (Standpoint)
  "Indigenous (Kimmerer)": "#00CC99",    // Teal/Earth (Relational)
  "Phenomenology (Husserl)": "#AAAAFF",  // Periwinkle (Consciousness)
};

const ParticleCloud = ({ targetPosition, cohesion, color }: { targetPosition: THREE.Vector3, cohesion: number, color: string }) => {
  const count = 100;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Initial random positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = (Math.random() - 0.5) * 10;
      const speed = 0.01 + Math.random() / 200;
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      temp.push({ t, factor, speed, x, y, z, mx: 0, my: 0, mz: 0 });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;

    // Calculate scatter based on cohesion (High cohesion = low scatter)
    // Cohesion 0-100. 100 = tight cluster. 0 = wide scatter.
    const scatterRadius = 4 * (1 - cohesion / 100) + 0.5; 

    particles.forEach((particle, i) => {
      let { t, speed, x, y, z } = particle;
      t = particle.t += speed / 2;
      
      // Move towards target
      const dt = 0.05;
      particle.mx += (targetPosition.x - particle.mx) * dt;
      particle.my += (targetPosition.y - particle.my) * dt;
      particle.mz += (targetPosition.z - particle.mz) * dt;

      // Add noise/orbit
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      
      dummy.position.set(
        particle.mx + Math.cos(t * particle.factor) * scatterRadius + (Math.sin(t) * 0.5),
        particle.my + Math.sin(t * particle.factor) * scatterRadius + (Math.cos(t) * 0.5),
        particle.mz + (Math.sin(t) * Math.cos(t)) * scatterRadius
      );
      
      const s = Math.cos(t);
      dummy.scale.setScalar(s > 0 ? s * 0.15 : 0.05); // Pulse size
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshPhongMaterial color={color} emissive={color} emissiveIntensity={2} toneMapped={false} />
    </instancedMesh>
  );
};

const ThinkerNode = ({ name, position, color, score, critique }: { name: string, position: THREE.Vector3, color: string, score: number, critique: string }) => {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position.y + Math.sin(clock.getElapsedTime() + position.x) * 0.2;
    }
  });

  // Normalize score for visual size/opacity
  const intensity = Math.max(0.2, score / 100);

  return (
    <group ref={ref} position={position}>
      {/* Core Sphere */}
      <mesh 
        onPointerOver={() => setHovered(true)} 
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3 + (intensity * 0.3), 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={hovered ? 3 : intensity * 2} 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.3}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {name.split(' (')[0]}
      </Text>
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.2}
        color="#aaaaaa"
        anchorX="center"
        anchorY="middle"
      >
        {score > 0 ? `${score}%` : ''}
      </Text>

      {/* Critique Tooltip (3D) */}
      {hovered && score > 0 && (
         <Html position={[0, 1.5, 0]} center distanceFactor={10} zIndexRange={[100, 0]}>
         <div className="bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-lg w-64 text-white pointer-events-none select-none">
           <h4 className="font-bold text-sm mb-1" style={{ color }}>{name} asks:</h4>
           <p className="text-xs italic leading-relaxed">"{critique}"</p>
         </div>
       </Html>
      )}
    </group>
  );
};

const ConnectionLines = () => {
    const points = Object.values(THINKERS);
    // Create a web connecting all thinkers
    const lines = [];
    for(let i=0; i<points.length; i++) {
        for(let j=i+1; j<points.length; j++) {
            lines.push(
                <Line
                    key={`${i}-${j}`}
                    points={[points[i], points[j]]}
                    color="#ffffff"
                    opacity={0.05}
                    transparent
                    lineWidth={1}
                />
            )
        }
    }
    return <group>{lines}</group>;
}

const AxisLabels = () => {
  return (
    <group>
      {/* X Axis */}
      <Text position={[6, 0, 0]} fontSize={0.2} color="#444" anchorX="left">Rational</Text>
      <Text position={[-6, 0, 0]} fontSize={0.2} color="#444" anchorX="right">Empirical</Text>
      
      {/* Y Axis */}
      <Text position={[0, 6, 0]} fontSize={0.2} color="#444" anchorY="bottom">Abstract</Text>
      <Text position={[0, -6, 0]} fontSize={0.2} color="#444" anchorY="top">Practical</Text>
      
      {/* Z Axis - Rotated for visibility */}
      <Text position={[0, 0, 6]} fontSize={0.2} color="#444" rotation={[0, -Math.PI / 2, 0]} anchorX="left">Critical</Text>
      <Text position={[0, 0, -6]} fontSize={0.2} color="#444" rotation={[0, -Math.PI / 2, 0]} anchorX="right">Structural</Text>
    </group>
  );
};

export const EpistemicVisualizer: React.FC<VisualizerProps> = ({ scores, cohesion }) => {
  // Calculate weighted center of the inquiry
  const targetPosition = useMemo(() => {
    const target = new THREE.Vector3(0, 0, 0);
    let totalScore = 0;

    scores.forEach(s => {
      // Find matching thinker key using robust matching
      const key = Object.keys(THINKERS).find(k => {
          const serviceName = s.thinker.toLowerCase();
          const constantName = k.toLowerCase();
          return constantName.includes(serviceName) || serviceName.includes(constantName.split(' ')[0].toLowerCase());
      });

      if (key) {
        const pos = THINKERS[key as keyof typeof THINKERS];
        target.add(pos.clone().multiplyScalar(s.score));
        totalScore += s.score;
      }
    });

    if (totalScore > 0) {
      target.divideScalar(totalScore);
    }
    return target;
  }, [scores]);

  // Determine dominant color
  const dominantColor = useMemo(() => {
    if (scores.length === 0) return "#ffffff";
    const top = scores.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    
    const key = Object.keys(THINKER_COLORS).find(k => {
        const serviceName = top.thinker.toLowerCase();
        const constantName = k.toLowerCase();
        return constantName.includes(serviceName) || serviceName.includes(constantName.split(' ')[0].toLowerCase());
    });
    
    return key ? THINKER_COLORS[key as keyof typeof THINKER_COLORS] : "#ffffff";
  }, [scores]);

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* The Octotree/Grid Context */}
      <gridHelper args={[20, 20, 0x222222, 0x111111]} position={[0, -4, 0]} />
      <AxisLabels />
      <ConnectionLines />

      {/* Thinker Nodes */}
      {Object.entries(THINKERS).map(([name, pos]) => {
        // Robust matching: Check if the thinker name from service is contained in the constant key or vice versa
        const scoreData = scores.find(s => {
            const serviceName = s.thinker.toLowerCase();
            const constantName = name.toLowerCase();
            return constantName.includes(serviceName) || serviceName.includes(constantName.split(' ')[0].toLowerCase());
        }) || { score: 0, critique: "" };
        
        return (
          <ThinkerNode 
            key={name} 
            name={name} 
            position={pos} 
            color={THINKER_COLORS[name as keyof typeof THINKER_COLORS]} 
            score={scoreData.score}
            critique={scoreData.critique}
          />
        );
      })}

      {/* The Inquiry Cloud */}
      {scores.length > 0 && (
        <ParticleCloud targetPosition={targetPosition} cohesion={cohesion} color={dominantColor} />
      )}
    </group>
  );
};
