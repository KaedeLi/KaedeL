import React, { useState, useRef } from 'react';
import { Photo, FilterType, PhotoTransform } from '../types';
import { Button } from './ui/Button';
import { ArrowLeft, Sparkles, Type, Layout, Download, Move, ZoomIn, RefreshCw, Box, ArrowRightLeft, ArrowUpDown, Palette } from 'lucide-react';

interface MakerProps {
  photo: Photo;
  onBack: () => void;
}

// Declare html2canvas on window
declare global {
  interface Window {
    html2canvas: any;
  }
}

export const Maker: React.FC<MakerProps> = ({ photo, onBack }) => {
  // Border State
  const [borderColor, setBorderColor] = useState('#ffffff');
  const [borderWidth, setBorderWidth] = useState(16);
  const [isHolo, setIsHolo] = useState(false);

  // Filter & Text State
  const [filter, setFilter] = useState<FilterType>('none');
  const [text, setText] = useState<string>('');
  
  // Transform State
  const [transform, setTransform] = useState<PhotoTransform>({ scale: 1, rotate: 0, x: 0, y: 0 });
  
  // 3D State
  const [is3DMode, setIs3DMode] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 3D Logic ---

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!is3DMode || !containerRef.current) return;

    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // Limit tilt to 20deg for subtle 3D effect without flipping
    setTilt({ x: -y * 20, y: x * 20 });
  };

  const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
  };

  // --- Render Logic ---

  const getFilterClass = () => {
    switch(filter) {
      case 'grayscale': return 'grayscale contrast-125';
      case 'vintage': return 'sepia brightness-90 contrast-90';
      case 'vibrant': return 'saturate-150 contrast-110';
      case 'dreamy': return 'brightness-110 contrast-90 saturate-125 blur-[0.5px]';
      default: return '';
    }
  };

  const handleSave = async () => {
    if (cardRef.current && window.html2canvas) {
        try {
            // Temporarily disable 3D for flat capture
            const originalTransform = cardRef.current.style.transform;
            cardRef.current.style.transform = 'none';
            
            const canvas = await window.html2canvas(cardRef.current, {
                scale: 3, // Higher resolution
                backgroundColor: null,
                useCORS: true,
                logging: false,
                allowTaint: true,
            });

            cardRef.current.style.transform = originalTransform;

            const link = document.createElement('a');
            link.download = `mybag-card-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error("Save failed:", error);
            alert("Oops! Could not save. Try again.");
        }
    } else {
        alert("Saving library not loaded yet.");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 h-[calc(100vh-2rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <Button onClick={onBack} variant="secondary" size="sm">
          <ArrowLeft size={16} /> Back
        </Button>
        <h2 className="text-xl md:text-2xl font-bold text-white drop-shadow-md">MyBag Maker</h2>
        <div className="flex gap-2">
            <Button 
                onClick={() => setIs3DMode(!is3DMode)} 
                variant={is3DMode ? "primary" : "secondary"}
                className={is3DMode ? "ring-2 ring-purple-300" : ""}
            >
                <Box size={18} /> {is3DMode ? 'Stop 3D' : '3D Mode'}
            </Button>
            <Button onClick={handleSave} className="bg-green-400 hover:bg-green-500 text-white border-none shadow-green-200">
                <Download size={18} /> Save
            </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center overflow-hidden">
        
        {/* PREVIEW AREA */}
        <div 
            ref={containerRef}
            className="flex-1 w-full flex items-center justify-center p-4 lg:p-8 bg-white/20 rounded-3xl border border-white/30 backdrop-blur-md shadow-inner perspective-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
          <div 
            ref={cardRef}
            className={`
              relative w-[300px] h-[460px] transition-transform duration-100 ease-out
              shadow-2xl rounded-2xl flex-shrink-0 bg-white preserve-3d
              ${is3DMode && isHolo ? 'animate-shimmer' : ''}
            `}
            style={{
                transform: is3DMode ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : 'none',
                backgroundColor: borderColor,
                padding: `${borderWidth}px`,
                // Holo effect on border container if active
                boxShadow: isHolo ? '0 0 20px rgba(255,182,193,0.5), inset 0 0 20px rgba(255,255,255,0.5)' : '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            }}
          >
            {/* --- FRONT OF CARD --- */}
            <div className="relative w-full h-full bg-white overflow-hidden rounded-sm backface-hidden">
                
                {/* Image Layer */}
                <div className="w-full h-full overflow-hidden relative">
                    <img 
                        src={photo.url} 
                        className={`w-full h-full object-cover origin-center ${getFilterClass()}`}
                        style={{
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
                        }}
                        alt="Card Preview" 
                        crossOrigin="anonymous" 
                    />
                </div>

                {/* Holo Overlay */}
                {isHolo && (
                    <div className="absolute inset-0 pointer-events-none z-20 holo-effect opacity-40 mix-blend-overlay"></div>
                )}

                {/* Text Label */}
                {text && (
                    <div className="absolute bottom-6 left-0 right-0 text-center z-50 pointer-events-none">
                        <span className={`
                        inline-block px-4 py-1 rounded-full backdrop-blur-md 
                        text-lg font-bold tracking-widest uppercase
                        bg-white/80 text-slate-800 shadow-sm
                        `}>
                        {text}
                        </span>
                    </div>
                )}
            </div>
          </div>
          
          {is3DMode && (
              <div className="absolute bottom-4 text-white/70 text-sm animate-pulse">
                  Move mouse to tilt card
              </div>
          )}
        </div>

        {/* CONTROLS AREA */}
        <div className="w-full lg:w-[400px] bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-xl overflow-y-auto max-h-[40vh] lg:max-h-[600px] no-scrollbar">
          
          <div className="space-y-8">
            
             {/* 1. Photo Edit */}
             <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Move size={16} /> Edit Photo
              </h3>
              <div className="space-y-4 px-2">
                
                <div className="flex items-center gap-3">
                    <ZoomIn size={16} className="text-slate-400" />
                    <input 
                        type="range" min="0.5" max="3" step="0.1" 
                        value={transform.scale}
                        onChange={(e) => setTransform({...transform, scale: parseFloat(e.target.value)})}
                        className="w-full accent-pink-500 h-1 bg-slate-200 rounded-lg appearance-none"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <RefreshCw size={16} className="text-slate-400" />
                    <input 
                        type="range" min="-180" max="180" step="1" 
                        value={transform.rotate}
                        onChange={(e) => setTransform({...transform, rotate: parseInt(e.target.value)})}
                        className="w-full accent-purple-500 h-1 bg-slate-200 rounded-lg appearance-none"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <ArrowRightLeft size={16} className="text-slate-400" />
                    <input 
                        type="range" min="-150" max="150" step="1" 
                        value={transform.x}
                        onChange={(e) => setTransform({...transform, x: parseInt(e.target.value)})}
                        className="w-full accent-blue-400 h-1 bg-slate-200 rounded-lg appearance-none"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <ArrowUpDown size={16} className="text-slate-400" />
                    <input 
                        type="range" min="-200" max="200" step="1" 
                        value={transform.y}
                        onChange={(e) => setTransform({...transform, y: parseInt(e.target.value)})}
                        className="w-full accent-blue-400 h-1 bg-slate-200 rounded-lg appearance-none"
                    />
                </div>
              </div>
            </section>

            {/* 2. Custom Borders */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layout size={16} /> Border Style
              </h3>
              
              <div className="space-y-4 bg-white/50 p-4 rounded-xl">
                 {/* Color Picker */}
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                        <Palette size={14} /> Color
                    </span>
                    <input 
                        type="color" 
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm cursor-pointer"
                    />
                 </div>

                 {/* Width Slider */}
                 <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>Width</span>
                        <span>{borderWidth}px</span>
                    </div>
                    <input 
                        type="range" min="0" max="40" step="1"
                        value={borderWidth}
                        onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                        className="w-full accent-slate-600 h-1 bg-slate-200 rounded-lg appearance-none"
                    />
                 </div>

                 {/* Holo Toggle */}
                 <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs font-semibold text-slate-500">Holographic Overlay</span>
                    <button 
                        onClick={() => setIsHolo(!isHolo)}
                        className={`w-10 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${isHolo ? 'bg-gradient-to-r from-pink-400 to-cyan-400' : 'bg-slate-300'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isHolo ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                 </div>
              </div>
            </section>

            {/* 3. Filters */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={16} /> Filters
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['none', 'grayscale', 'vintage', 'vibrant', 'dreamy'].map((f) => (
                  <Button 
                    key={f}
                    size="sm"
                    active={filter === f} 
                    onClick={() => setFilter(f as FilterType)} 
                    variant="secondary"
                    className="capitalize"
                  >
                    {f}
                  </Button>
                ))}
              </div>
            </section>

            {/* 4. Text Label (Front) */}
            <section>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Type size={16} /> Front Label
              </h3>
              <input 
                type="text" 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Wonyoung"
                className="w-full bg-white border border-pink-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-300 transition-all text-slate-700"
              />
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};
