import React, { useRef, useEffect } from 'react';
import { HolographyMode, SimulationParams } from '../types';

interface SimulationCanvasProps {
  mode: HolographyMode;
  params: SimulationParams;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ mode, params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hologramRef = useRef<HTMLCanvasElement>(null);
  // Fixed: Initialize useRef with 0 (or null) as it expects an initial value
  const requestRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Constants
  const WIDTH = 600;
  const HEIGHT = 320;
  
  // Physics & Drawing
  const draw = (time: number) => {
    if (!canvasRef.current || !hologramRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const ctxHolo = hologramRef.current.getContext('2d');
    if (!ctx || !ctxHolo) return;

    // --- SETUP PARAMETERS ---
    const { wavelength, referenceAngle, objectDistance, intensity, objectOpacity, objectPhase } = params;
    
    // Derived Physics
    const k = (2 * Math.PI) / wavelength;
    const omega = 0.15; // Animation speed
    const theta = (referenceAngle * Math.PI) / 180;
    
    // Geometry
    const plateX = WIDTH - 40;
    const objectX = plateX - objectDistance;
    const objectY = HEIGHT / 2;
    
    // --- MAIN CANVAS RENDERING (Wave Field) ---
    ctx.fillStyle = '#020202';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Grid lines for "Optical Bench" feel
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for(let i=0; i<WIDTH; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,HEIGHT); ctx.stroke(); }
    for(let i=0; i<HEIGHT; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(WIDTH,i); ctx.stroke(); }

    // 1. COMPUTE FIELD PIXEL BY PIXEL
    const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const data = imageData.data;

    // Pre-calculate constants for inner loop
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);
    const timePhase = time * omega;

    for (let y = 0; y < HEIGHT; y++) {
      const y_centered = y - HEIGHT/2;
      const rowOffset = y * WIDTH;
      
      for (let x = 0; x < WIDTH; x++) {
        // Skip area behind plate for wave drawing
        if (x > plateX) continue;

        let E_total = 0;

        // --- REFERENCE WAVE ---
        const phase_ref = k * (x * cosTheta + y_centered * sinTheta) - timePhase;
        const E_ref = intensity * Math.cos(phase_ref);

        // --- OBJECT WAVE ---
        let E_obj = 0;
        if (x > objectX) {
           const dx = x - objectX;
           const dy = y - objectY;
           const rSq = dx*dx + dy*dy;
           const r = Math.sqrt(rSq);
           
           // Amplitude falloff
           const amp_obj = (intensity * objectOpacity * 40) / (Math.pow(r, 0.7) + 5);
           
           // Phase
           const incidentPhaseAtObject = k * (objectX * cosTheta); // Simplified incident phase
           const phase_obj = incidentPhaseAtObject + objectPhase + k * r - timePhase;
           
           E_obj = amp_obj * Math.cos(phase_obj);
        }

        E_total = E_ref + E_obj;

        // Visualization: Map Field to Color (Green Laser)
        const index = (rowOffset + x) * 4;
        const brightness = Math.min(255, 10 + (E_total + intensity) * 15);
        
        data[index] = 0; 
        data[index+1] = brightness; 
        data[index+2] = brightness * 0.1; 
        data[index+3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // --- DRAW COMPONENTS (OVERLAY) ---

    // 1. Laser Source
    ctx.fillStyle = '#222';
    ctx.fillRect(0, HEIGHT/2 - 20, 30, 40);
    ctx.fillStyle = '#00ff00';
    ctx.font = "10px monospace";
    ctx.fillText("LASER", 2, HEIGHT/2 - 25);
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, HEIGHT/2); ctx.lineTo(WIDTH, HEIGHT/2); ctx.stroke();

    // 2. Object
    ctx.save();
    ctx.translate(objectX, objectY);
    ctx.fillStyle = `rgba(59, 130, 246, ${0.5 + objectOpacity * 0.5})`;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("Obj", -10, -15);
    ctx.restore();

    // 3. Plate
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(plateX, 10, 8, HEIGHT - 20);
    ctx.fillStyle = '#fff';
    ctx.fillText("Hologram Plate", plateX - 40, HEIGHT - 10);


    // --- SECONDARY CANVAS: HOLOGRAM STRIP & GRAPH ---
    
    // Clear Hologram Canvas with technical background
    ctxHolo.fillStyle = '#111';
    ctxHolo.fillRect(0, 0, WIDTH, 150);

    // Calculate Intensity Profile I(y)
    const intensities: number[] = [];
    const maxI_estimate = (intensity + intensity*objectOpacity*2) ** 2; // Estimation for normalization

    for (let y = 0; y < HEIGHT; y++) {
       // Ref Term at plate
       const y_centered = y - HEIGHT/2;
       const phi_ref = k * (plateX * cosTheta + y_centered * sinTheta);
       const A_ref = intensity;
       
       // Obj Term at plate
       const dx = plateX - objectX;
       const dy = y - objectY;
       const r = Math.sqrt(dx*dx + dy*dy);
       const A_obj = (intensity * objectOpacity * 40) / (Math.pow(r, 0.7) + 5);
       
       const incidentPhaseAtObject = k * (objectX * cosTheta);
       const phi_obj = incidentPhaseAtObject + objectPhase + k * r;
       
       // Interference: I = |E|^2
       const I = A_ref*A_ref + A_obj*A_obj + 2*A_ref*A_obj * Math.cos(phi_ref - phi_obj);
       intensities.push(I);
    }

    // --- 1. DRAW HOLOGRAM STRIP ---
    const stripY = 20;
    const stripHeight = 50;
    const scaleYtoX = WIDTH / HEIGHT;

    // Label
    ctxHolo.fillStyle = '#fff';
    ctxHolo.font = "11px sans-serif";
    ctxHolo.fillText("Interference Pattern (Simulated Film)", 10, stripY - 6);

    // Draw film background
    ctxHolo.fillStyle = '#000';
    ctxHolo.fillRect(0, stripY, WIDTH, stripHeight);
    
    // Render Fringes with texture
    const stripImg = ctxHolo.createImageData(WIDTH, stripHeight);
    const sData = stripImg.data;
    
    for (let x = 0; x < WIDTH; x++) {
        // Map x (canvas) -> y (plate)
        const plateYIndex = Math.min(Math.floor(x / scaleYtoX), HEIGHT-1);
        const val = intensities[plateYIndex];
        
        // Normalize 0-1
        const norm = Math.min(1, Math.max(0, val / (maxI_estimate * 1.1)));
        
        // Add "Film Grain" noise
        const noise = (Math.random() - 0.5) * 30;
        
        // Color mapping: Green Laser Hologram style
        // Bright green for constructive, dark for destructive
        let g = (norm * 255) + noise;
        g = Math.min(255, Math.max(0, g));
        
        for (let sy = 0; sy < stripHeight; sy++) {
            const idx = (sy * WIDTH + x) * 4;
            sData[idx] = 0;     // R
            sData[idx+1] = g;   // G
            sData[idx+2] = g * 0.2; // B
            sData[idx+3] = 255; // A
        }
    }
    ctxHolo.putImageData(stripImg, 0, stripY);
    
    // Border for strip
    ctxHolo.strokeStyle = '#444';
    ctxHolo.strokeRect(0, stripY, WIDTH, stripHeight);


    // --- 2. DRAW INTENSITY GRAPH ---
    const graphTop = 90;
    const graphBottom = 140;
    const graphLeft = 40;
    const graphRight = WIDTH - 20;
    const graphHeight = graphBottom - graphTop;
    
    // Axes & Grid
    ctxHolo.beginPath();
    ctxHolo.strokeStyle = '#333';
    ctxHolo.lineWidth = 1;
    
    // Horizontal Grid lines
    for(let i=0; i<=2; i++) {
        const y = graphTop + (i * graphHeight / 2);
        ctxHolo.moveTo(graphLeft, y);
        ctxHolo.lineTo(graphRight, y);
    }
    // Vertical Grid lines
    for(let i=0; i<=4; i++) {
        const x = graphLeft + (i * (graphRight-graphLeft) / 4);
        ctxHolo.moveTo(x, graphTop);
        ctxHolo.lineTo(x, graphBottom);
    }
    ctxHolo.stroke();

    // Axis Lines
    ctxHolo.beginPath();
    ctxHolo.strokeStyle = '#666';
    ctxHolo.moveTo(graphLeft, graphTop);
    ctxHolo.lineTo(graphLeft, graphBottom); // Y-axis
    ctxHolo.lineTo(graphRight, graphBottom); // X-axis
    ctxHolo.stroke();

    // Axis Labels
    ctxHolo.fillStyle = '#888';
    ctxHolo.textAlign = 'right';
    ctxHolo.font = "9px monospace";
    ctxHolo.fillText("Int (I)", graphLeft - 5, graphTop + 10);
    ctxHolo.textAlign = 'center';
    ctxHolo.fillText("Position (y)", WIDTH/2, graphBottom + 12);

    // Plot Data
    ctxHolo.beginPath();
    ctxHolo.strokeStyle = '#00ff00';
    ctxHolo.lineWidth = 2;
    ctxHolo.shadowBlur = 4;
    ctxHolo.shadowColor = '#00ff00';

    for (let y = 0; y < HEIGHT; y++) {
       const plotX = graphLeft + (y / HEIGHT) * (graphRight - graphLeft);
       
       const normI = intensities[y] / (maxI_estimate * 1.1);
       const plotY = graphBottom - (normI * graphHeight);
       
       if (y===0) ctxHolo.moveTo(plotX, plotY);
       else ctxHolo.lineTo(plotX, plotY);
    }
    ctxHolo.stroke();
    ctxHolo.shadowBlur = 0;
    ctxHolo.textAlign = 'left'; // Reset alignment
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
    <div className="flex flex-col gap-2">
      {/* Main Wave Tank */}
      <div className="relative rounded-lg overflow-hidden border border-gray-700 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={600}
          height={320}
          className="w-full h-auto object-contain block bg-black"
          style={{ imageRendering: 'pixelated' }}
        />
        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[10px] text-green-400 p-1.5 rounded border border-green-900/50 font-mono">
          E_field(x,y,t)
        </div>
      </div>

      {/* Hologram Inspector */}
      <div className="relative rounded-lg overflow-hidden border border-gray-700 shadow-xl bg-gray-900">
         <canvas
            ref={hologramRef}
            width={600}
            height={150}
            className="w-full h-auto block"
         />
          <div className="absolute bottom-2 right-2 text-[10px] text-gray-500 font-mono">
            Spatial Domain (y)
          </div>
      </div>
    </div>
  );
};

export default SimulationCanvas;