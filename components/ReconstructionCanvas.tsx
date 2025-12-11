import React, { useRef, useEffect } from 'react';
import { HolographyMode, SimulationParams } from '../types';
import { Eye } from 'lucide-react';

interface ReconstructionCanvasProps {
  mode: HolographyMode;
  params: SimulationParams;
}

const ReconstructionCanvas: React.FC<ReconstructionCanvasProps> = ({ mode, params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Constants
  const WIDTH = 600;
  const HEIGHT = 320;
  const PLATE_X = 250; // Place plate near middle-left to allow space for real image
  
  const draw = (time: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // --- SETUP PARAMETERS ---
    const { wavelength, referenceAngle, objectDistance, intensity } = params;
    
    // Physics Constants
    const k = (2 * Math.PI) / wavelength;
    const omega = 0.15;
    const theta = (referenceAngle * Math.PI) / 180;
    const timePhase = time * omega;

    // Derived Geometry
    const virtualObjX = PLATE_X - objectDistance;
    const virtualObjY = HEIGHT / 2;
    
    // Real Image Geometry (Simplified approximation for visualization)
    // For Gabor (0 deg), Real Image is at PLATE_X + objectDistance
    // For Off-axis, Real Image is deflected by roughly 2*theta
    const realImgDist = objectDistance;
    const deflectionAngle = 2 * theta; 
    const realObjX = PLATE_X + realImgDist * Math.cos(deflectionAngle);
    const realObjY = HEIGHT / 2 + realImgDist * Math.sin(deflectionAngle);

    // --- RENDER PIXELS ---
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Grid
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for(let i=0; i<WIDTH; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,HEIGHT); ctx.stroke(); }
    for(let i=0; i<HEIGHT; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(WIDTH,i); ctx.stroke(); }

    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const data = imageData.data;

    // Precalc
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    for (let y = 0; y < HEIGHT; y++) {
      const y_centered = y - HEIGHT/2;
      const rowOffset = y * WIDTH;

      for (let x = 0; x < WIDTH; x++) {
        let E_total = 0;

        // 1. Reading Beam (Reference Beam)
        // Propagates everywhere, but modulated by plate at x > PLATE_X
        const phase_read = k * (x * cosTheta + y_centered * sinTheta) - timePhase;
        let E_read = intensity * Math.cos(phase_read);

        if (x < PLATE_X) {
            // Before plate: Just the reading beam
            E_total = E_read;
        } else {
            // After plate: Superposition of diffracted orders
            // We simulate this analytically for clarity
            
            // Order 0: Transmitted Reading Beam (Attenuated)
            const E_0 = E_read * 0.5;

            // Order +1: Virtual Image (Diverging from Virtual Object)
            // Behaves like spherical wave from (virtualObjX, virtualObjY)
            const dx_v = x - virtualObjX;
            const dy_v = y - virtualObjY;
            const r_v = Math.sqrt(dx_v*dx_v + dy_v*dy_v);
            const amp_v = (intensity * 100) / (Math.pow(r_v, 0.8) + 10); // Artificial decay
            const E_virt = amp_v * Math.cos(k * r_v - timePhase);

            // Order -1: Real Image (Converging to Real Object)
            // Behaves like spherical wave converging to (realObjX, realObjY)
            // or diverging from it if we are past it.
            const dx_r = x - realObjX;
            const dy_r = y - realObjY;
            const r_r = Math.sqrt(dx_r*dx_r + dy_r*dy_r);
            // Phase structure: Converging means phase decreases as we approach? 
            // Standard convention: exp(-ikr) is converging? 
            // For visual simplicity in real-valued cos:
            // Before focus: converging wavefronts. After focus: diverging.
            // We can model it as source at RealObj, but with phase reversed?
            // Actually, just drawing a source at RealObj looks like it's diverging FROM it.
            // To look converging TO it, the wavefront curvature must be opposite.
            // However, past the focus, it IS diverging. 
            // Let's just draw it as a source at RealObj for x > RealObjX, 
            // and "negative distance" source for x < RealObjX?
            // Simplification: Treat it as a source at RealObj. It looks like "Real Image" anyway once formed.
            const amp_r = (intensity * 100) / (Math.pow(r_r, 0.8) + 10);
            
            // To make it look "conjugated" or different, we can shift phase
            // Ideally, we want to see it focusing.
            // A wave converging to (rx, ry) has phase -k*distance.
            // A wave diverging from (rx, ry) has phase +k*distance.
            // Let's toggle: If x < realObjX, use converging math? 
            // It's hard to make continuous without discontinuities at focus.
            // Let's just draw diverging from RealObj point - it represents the light "forming" the image.
            const E_real = amp_r * Math.cos(k * r_r - timePhase);

            // COMPOSITE FIELD
            if (mode === HolographyMode.INLINE) {
                // Gabor: All on top of each other
                E_total = E_0 + E_virt + E_real;
            } else {
                // Off-axis: Real image is spatially separated
                // We physically mask the terms to show separation or just let them interfere?
                // Let them interfere. The geometry (deflectionAngle) handles separation.
                E_total = E_0 + E_virt + E_real;
            }
        }

        // Color Mapping
        const index = (rowOffset + x) * 4;
        const brightness = Math.min(255, 10 + (E_total + intensity) * 15);
        
        // Reconstruction is also Green Laser
        data[index] = 0;
        data[index+1] = brightness;
        data[index+2] = brightness * 0.2;
        data[index+3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // --- OVERLAYS ---

    // 1. Hologram Plate
    ctx.fillStyle = '#666';
    ctx.fillRect(PLATE_X, 10, 4, HEIGHT-20);
    ctx.fillStyle = '#fff';
    ctx.font = "10px monospace";
    ctx.fillText("Hologram", PLATE_X - 25, HEIGHT - 10);

    // 2. Reading Beam Arrow
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, HEIGHT/2 - 40);
    ctx.lineTo(80, HEIGHT/2 - 40);
    ctx.stroke();
    ctx.fillStyle = '#0f0';
    ctx.fillText("Ref Beam", 10, HEIGHT/2 - 50);

    // 3. Virtual Object (Ghost)
    if (virtualObjX > 0) {
        ctx.save();
        ctx.translate(virtualObjX, virtualObjY);
        ctx.strokeStyle = `rgba(100, 200, 255, 0.6)`;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = `rgba(100, 200, 255, 0.8)`;
        ctx.fillText("Virtual Img", -20, -15);
        ctx.restore();
    }

    // 4. Real Image (Focus)
    if (realObjX < WIDTH) {
        ctx.save();
        ctx.translate(realObjX, realObjY);
        ctx.fillStyle = `rgba(255, 100, 100, 0.9)`;
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbb';
        ctx.fillText("Real Img", -20, 20);
        ctx.restore();
    }

    // 5. Eye / Observer
    ctx.save();
    // Position eye to look at Virtual Image (through plate)
    ctx.translate(WIDTH - 40, HEIGHT/2);
    ctx.scale(0.8, 0.8);
    // Draw basic eye icon
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.quadraticCurveTo(0, -15, 15, 0);
    ctx.quadraticCurveTo(0, 15, -15, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  };

  const animate = () => {
    if (params.isPlaying) {
      timeRef.current += 1;
      draw(timeRef.current);
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (params.isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      draw(timeRef.current);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [params, mode]);

  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-700 shadow-2xl bg-black">
      <canvas
        ref={canvasRef}
        width={600}
        height={320}
        className="w-full h-auto object-contain block bg-black"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-green-400 p-1.5 rounded border border-green-900/50 font-mono">
        Reconstruction_Field(x,y,t)
      </div>
      <div className="absolute bottom-2 left-2 max-w-xs bg-black/60 p-2 rounded text-xs text-gray-300 pointer-events-none">
         {mode === HolographyMode.INLINE 
            ? "Inline: Real and Virtual images overlap on the same axis (Gabor's Problem)." 
            : "Off-axis: The Real Image is deflected away, leaving a clear view of the Virtual Image."}
      </div>
    </div>
  );
};

export default ReconstructionCanvas;