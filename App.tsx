import React, { useState } from 'react';
import { Layout, Play, Pause, RefreshCw, MessageSquare, BookOpen, Activity, Settings2, Eye, Zap, RefreshCcw } from 'lucide-react';
import SimulationCanvas from './components/SimulationCanvas';
import ReconstructionCanvas from './components/ReconstructionCanvas';
import TheorySection from './components/TheorySection';
import AITutor from './components/AITutor';
import { HolographyMode, SimulationParams, Tab } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SIMULATION);
  const [mode, setMode] = useState<HolographyMode>(HolographyMode.INLINE);
  
  // Simulation State
  const [simParams, setSimParams] = useState<SimulationParams>({
    wavelength: 20, 
    referenceAngle: 0,
    objectDistance: 120,
    intensity: 4,
    objectOpacity: 1.0,
    objectPhase: 0,
    isPlaying: true
  });

  const handleModeChange = (newMode: HolographyMode) => {
    setMode(newMode);
    setSimParams(prev => ({
      ...prev,
      referenceAngle: newMode === HolographyMode.OFFAXIS ? 15 : 0
    }));
  };

  const togglePlay = () => {
    setSimParams(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#050505] text-gray-200">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="text-laser-DEFAULT w-6 h-6 animate-pulse" />
            <h1 className="text-xl font-bold tracking-wider text-white">
              Holo<span className="text-laser-DEFAULT">Learn</span>
            </h1>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <button 
              onClick={() => setActiveTab(Tab.SIMULATION)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${activeTab === Tab.SIMULATION ? 'bg-laser-dim text-white border border-laser-dim' : 'text-gray-400 hover:text-white'}`}
            >
              <Layout size={18} /> <span className="hidden sm:inline">Record</span>
            </button>
            <button 
              onClick={() => setActiveTab(Tab.RECONSTRUCTION)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${activeTab === Tab.RECONSTRUCTION ? 'bg-laser-dim text-white border border-laser-dim' : 'text-gray-400 hover:text-white'}`}
            >
              <RefreshCcw size={18} /> <span className="hidden sm:inline">Reconstruct</span>
            </button>
            <button 
              onClick={() => setActiveTab(Tab.THEORY)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${activeTab === Tab.THEORY ? 'bg-laser-dim text-white border border-laser-dim' : 'text-gray-400 hover:text-white'}`}
            >
              <BookOpen size={18} /> <span className="hidden sm:inline">Theory</span>
            </button>
            <button 
              onClick={() => setActiveTab(Tab.TUTOR)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${activeTab === Tab.TUTOR ? 'bg-purple-900/50 text-purple-200 border border-purple-500/30' : 'text-gray-400 hover:text-white'}`}
            >
              <MessageSquare size={18} /> <span className="hidden sm:inline">AI Tutor</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls (Span 4) */}
        <div className={`lg:col-span-4 space-y-6 ${activeTab === Tab.TUTOR ? 'hidden lg:block' : ''}`}>
           
           {/* Mode Selector */}
           <div className="bg-dark-800 p-5 rounded-xl border border-gray-800 shadow-xl">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                <Settings2 size={14}/> Setup Configuration
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  onClick={() => handleModeChange(HolographyMode.INLINE)}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${mode === HolographyMode.INLINE ? 'bg-laser-dim/20 border-laser-DEFAULT text-white shadow-[0_0_15px_rgba(0,255,0,0.1)]' : 'border-gray-700 text-gray-500 hover:bg-dark-700 hover:text-gray-300'}`}
                >
                  <div className="font-bold tracking-tight">INLINE</div>
                  <span className="text-[10px] text-gray-400">Gabor (1948)</span>
                </button>
                <button
                  onClick={() => handleModeChange(HolographyMode.OFFAXIS)}
                  className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all ${mode === HolographyMode.OFFAXIS ? 'bg-laser-dim/20 border-laser-DEFAULT text-white shadow-[0_0_15px_rgba(0,255,0,0.1)]' : 'border-gray-700 text-gray-500 hover:bg-dark-700 hover:text-gray-300'}`}
                >
                  <div className="font-bold tracking-tight">OFF-AXIS</div>
                  <span className="text-[10px] text-gray-400">Leith-Upatnieks (1962)</span>
                </button>
              </div>
           </div>

           {/* Optical Bench Controls */}
           <div className="bg-dark-800 p-5 rounded-xl border border-gray-800 shadow-xl space-y-6 relative overflow-hidden">
              {/* Decorative grid bg */}
              <div className="absolute inset-0 opacity-5 pointer-events-none" 
                   style={{backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
              </div>

              <div className="flex items-center justify-between relative z-10">
                 <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <Zap size={14}/> Laser Parameters
                 </h3>
                 <button onClick={togglePlay} className="text-laser-DEFAULT hover:text-laser-glow transition-colors bg-dark-900 p-1.5 rounded-md border border-gray-700">
                    {simParams.isPlaying ? <Pause size={16} /> : <Play size={16} />}
                 </button>
              </div>

              {/* Angle */}
              <div className={`space-y-2 ${mode === HolographyMode.INLINE ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                <div className="flex justify-between text-xs text-gray-300 font-mono">
                  <span>Reference Angle</span>
                  <span className="text-laser-DEFAULT">{simParams.referenceAngle}°</span>
                </div>
                <input 
                  type="range" min="5" max="45" step="1"
                  value={simParams.referenceAngle}
                  onChange={(e) => setSimParams({...simParams, referenceAngle: parseInt(e.target.value)})}
                  className="w-full accent-laser-DEFAULT h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Wavelength */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-300 font-mono">
                  <span>Wavelength (λ)</span>
                  <span className="text-laser-DEFAULT">{simParams.wavelength}px</span>
                </div>
                <input 
                  type="range" min="15" max="40" step="1"
                  value={simParams.wavelength}
                  onChange={(e) => setSimParams({...simParams, wavelength: parseInt(e.target.value)})}
                  className="w-full accent-laser-DEFAULT h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <hr className="border-gray-700/50" />

              {/* Object Controls */}
              <div className="space-y-4 relative z-10">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                   <Eye size={14}/> Object Properties
                </h3>

                {/* Object Distance */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-300 font-mono">
                    <span>Position (Z)</span>
                    <span className="text-blue-400">{simParams.objectDistance}px</span>
                  </div>
                  <input 
                    type="range" min="50" max="250" 
                    value={simParams.objectDistance}
                    onChange={(e) => setSimParams({...simParams, objectDistance: parseInt(e.target.value)})}
                    className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-300 font-mono">
                    <span>Scattering Amplitude</span>
                    <span className="text-blue-400">{simParams.objectOpacity.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.1"
                    value={simParams.objectOpacity}
                    onChange={(e) => setSimParams({...simParams, objectOpacity: parseFloat(e.target.value)})}
                    className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                 {/* Phase */}
                 <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-300 font-mono">
                    <span>Phase Shift (φ)</span>
                    <span className="text-blue-400">{(simParams.objectPhase / Math.PI).toFixed(2)}π</span>
                  </div>
                  <input 
                    type="range" min="0" max={Math.PI * 2} step="0.1"
                    value={simParams.objectPhase}
                    onChange={(e) => setSimParams({...simParams, objectPhase: parseFloat(e.target.value)})}
                    className="w-full accent-blue-500 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setSimParams({...simParams, referenceAngle: mode === HolographyMode.OFFAXIS ? 15 : 0, wavelength: 20, objectDistance: 120, objectOpacity: 1, objectPhase: 0})}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-white bg-dark-900 hover:bg-gray-800 rounded-lg transition-colors border border-gray-700"
                >
                  <RefreshCw size={12} /> Reset Experiment
                </button>
              </div>
           </div>
        </div>

        {/* Center/Right: Simulation View (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           {activeTab === Tab.SIMULATION && (
             <div className="flex flex-col gap-6 animate-in fade-in duration-500">
               <SimulationCanvas mode={mode} params={simParams} />
               
               {/* Context Card */}
               <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <Activity size={20} className="text-laser-DEFAULT"/>
                    Experimental Observation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-400 leading-relaxed">
                    <p>
                      The <strong className="text-white">Wave Tank</strong> above simulates coherent light propagation.
                      The <strong className="text-white">Hologram Plate</strong> strip shows the recorded intensity pattern $I(y)$.
                      Notice how the fringe spacing (carrier frequency) changes when you adjust the reference angle.
                    </p>
                    <p>
                       <span className="text-blue-400 font-medium">Try this:</span> Reduce the <em>Object Scattering Amplitude</em> to see how the interference contrast (fringe visibility) decreases. 
                       Change the <em>Phase Shift</em> to see the fringes shift position—this encodes the object's depth/shape information!
                    </p>
                  </div>
               </div>
             </div>
           )}
           
           {activeTab === Tab.RECONSTRUCTION && (
             <div className="flex flex-col gap-6 animate-in fade-in duration-500">
               <ReconstructionCanvas mode={mode} params={simParams} />
               
               {/* Reconstruction Context Card */}
               <div className="bg-dark-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <RefreshCcw size={20} className="text-laser-DEFAULT"/>
                    Holographic Reconstruction
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-400 leading-relaxed">
                    <p>
                       We now illuminate the developed hologram with the reference beam. 
                       The hologram acts as a diffraction grating, creating three wavefronts: the 0th order (direct), the +1 order (Virtual Image), and the -1 order (Real Image).
                    </p>
                    <p>
                       {mode === HolographyMode.INLINE 
                         ? <span className="text-red-400">In Inline mode, the Virtual and Real images overlap. This makes the Virtual image (the one you look at) blurry or noisy.</span>
                         : <span className="text-green-400">In Off-axis mode, the Real Image is diffracted at a steep angle, leaving the Virtual Image clear and isolated. This is the key innovation of Leith & Upatnieks.</span>}
                    </p>
                  </div>
               </div>
             </div>
           )}

           {activeTab === Tab.THEORY && (
             <TheorySection mode={mode} />
           )}

           {activeTab === Tab.TUTOR && (
             <AITutor />
           )}
        </div>

      </main>

      <footer className="border-t border-gray-800 bg-black py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
           <p>&copy; {new Date().getFullYear()} HoloLearn. Physics Engine v1.0.</p>
           <p>Simulating Scalar Diffraction Theory (Fresnel Approximation)</p>
        </div>
      </footer>
    </div>
  );
};

export default App;