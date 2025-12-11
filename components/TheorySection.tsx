import React from 'react';
import { HolographyMode } from '../types';
import { BookOpen, Info, ArrowRight } from 'lucide-react';

interface TheorySectionProps {
  mode: HolographyMode;
}

const TheorySection: React.FC<TheorySectionProps> = ({ mode }) => {
  return (
    <div className="space-y-6 text-gray-300">
      <div className="bg-dark-800 p-6 rounded-xl border border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="text-laser-DEFAULT" />
          <h2 className="text-2xl font-bold text-white">
            {mode === HolographyMode.INLINE ? "Inline (Gabor) Holography" : "Off-axis (Leith-Upatnieks) Holography"}
          </h2>
        </div>
        
        {mode === HolographyMode.INLINE ? (
          <div className="space-y-4">
            <p>
              Proposed by Dennis Gabor in 1948, <strong>Inline Holography</strong> was the first type of holography invented. 
              It is often referred to as "Gabor Holography".
            </p>
            <h3 className="text-lg font-semibold text-laser-glow">The Setup</h3>
            <p>
              A single laser beam serves as both the reference and the illumination for the object. The object (usually semi-transparent) 
              is placed in the path of the beam. The scattered light (Object Wave <span className="font-mono text-yellow-300">O</span>) interferes with the unscattered background light (Reference Wave <span className="font-mono text-green-300">R</span>) directly on the photographic plate.
            </p>
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-600 font-mono text-sm">
              I = |R + O|² = |R|² + |O|² + R*O + RO*
            </div>
            <h3 className="text-lg font-semibold text-red-400">The Problem: Twin Images</h3>
            <p>
              Because the reference and object waves travel along the same axis, the reconstruction produces two overlapping images: 
              the <strong>Virtual Image</strong> (the one you want to see) and the <strong>Real Image</strong> (which appears inverted). 
              Looking at the hologram is like looking through a distorted window because the "twin" image overlaps directly with the true image.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p>
              In the early 1960s, Emmett Leith and Juris Upatnieks applied communication theory to holography and invented 
              <strong>Off-axis Holography</strong>, solving Gabor's twin-image problem.
            </p>
            <h3 className="text-lg font-semibold text-laser-glow">The Setup</h3>
            <p>
              The laser beam is split into two separate paths:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Object Beam:</strong> Illuminates the object.</li>
              <li><strong>Reference Beam:</strong> Bypasses the object and hits the plate at an angle <span className="font-serif italic">θ</span>.</li>
            </ul>
            <p>
              This angle creates a "carrier frequency" in the interference pattern.
            </p>
            <div className="bg-dark-900 p-4 rounded-lg border border-gray-600 font-mono text-sm">
              Ref Wave: R = A·exp(i·k·y·sin(θ))
            </div>
            <h3 className="text-lg font-semibold text-green-400">The Solution</h3>
            <p>
              During reconstruction, the diffraction grating formed by the interference pattern steers the different terms in different directions. 
              The <strong>Real Image</strong>, <strong>Virtual Image</strong>, and the <strong>Zero Order</strong> (direct beam) are spatially separated.
              You can view the clear, 3D virtual image without obstruction.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-800/50 flex gap-4">
        <Info className="flex-shrink-0 text-blue-400" />
        <div>
          <h4 className="font-bold text-blue-200 mb-1">Did you know?</h4>
          <p className="text-sm text-blue-100/80">
            {mode === HolographyMode.INLINE 
              ? "Gabor originally invented holography to improve the resolution of electron microscopes, not for 3D visual art!"
              : "Leith and Upatnieks used the newly invented laser (1960) for their experiments. Gabor had to use a mercury arc lamp with a pinhole, which had very poor coherence."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TheorySection;