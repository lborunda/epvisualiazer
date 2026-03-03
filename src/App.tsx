import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AnalysisPanel } from './components/AnalysisPanel';
import { EpistemicVisualizer } from './components/EpistemicVisualizer';
import { AnalysisResult } from './services/epistemicService';

function App() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Left: 3D Visualization Area */}
      <div className="flex-1 relative">
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <h2 className="text-white/50 text-xs uppercase tracking-[0.2em]">Epistemic Space</h2>
        </div>
        
        <Canvas camera={{ position: [8, 6, 8], fov: 45 }}>
          <color attach="background" args={['#050508']} />
          <fog attach="fog" args={['#050508', 5, 30]} />
          
          <Suspense fallback={null}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <EpistemicVisualizer 
              scores={analysisData?.scores || []} 
              cohesion={analysisData?.cohesionScore || 0} 
            />
            <OrbitControls 
              enablePan={false} 
              minDistance={5} 
              maxDistance={20} 
              autoRotate={!analysisData} 
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>

        {/* Overlay Legend */}
        <div className="absolute bottom-6 left-6 z-10 pointer-events-none space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
           {/* Foundational */}
           <div className="space-y-1">
             <h4 className="text-[9px] uppercase text-white/30 font-bold mb-1">Foundational</h4>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#FF00FF]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Hume (Empiricism)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-white"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Kant (Transcendental)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#00FFFF]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Popper (Falsification)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#FFD700]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Dewey (Pragmatism)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#DDA0DD]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Peirce (Abduction)</span>
             </div>
           </div>

           {/* Structural/Complex */}
           <div className="space-y-1">
             <h4 className="text-[9px] uppercase text-white/30 font-bold mb-1 mt-2">Structural & Complex</h4>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#0088FF]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Lakatos (Programs)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#00FF00]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Pearl (Bayesian)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#FF3333]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Bhaskar (Crit Realism)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#9D00FF]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Prigogine (Complexity)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#708090]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Ioannidis (Metascience)</span>
             </div>
           </div>

           {/* Critical/Situated */}
           <div className="space-y-1">
             <h4 className="text-[9px] uppercase text-white/30 font-bold mb-1 mt-2">Critical & Situated</h4>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#FF8800]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Kuhn (Interpretive)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#FF0088]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Foucault (Post-Struct)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#FF99CC]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Harding (Feminist)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#00CC99]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Kimmerer (Indigenous)</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#AAAAFF]"></div>
               <span className="text-[10px] uppercase tracking-wider text-white/60">Husserl (Phenom)</span>
             </div>
           </div>
        </div>
      </div>

      {/* Right: Analysis Panel */}
      <div className="w-[450px] relative z-20 shadow-2xl shadow-black">
        <AnalysisPanel onAnalyze={setAnalysisData} />
      </div>
    </div>
  );
}

export default App;
