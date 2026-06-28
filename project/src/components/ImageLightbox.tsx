import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImageLightbox({ imageUrl, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageUrl) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [imageUrl]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.25, 0.5);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: MouseEvent<HTMLImageElement>) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {imageUrl && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md">
          {/* Overlay click to close */}
          <div className="absolute inset-0 cursor-zoom-out" onClick={onClose} />

          {/* Header Action Controls */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-matte-black/80 border border-primary-red/20 rounded-full px-5 py-2 z-[110] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-primary-red/10 rounded-full text-silver-white hover:text-primary-red transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-primary-red/10 rounded-full text-silver-white hover:text-primary-red transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-primary-red/10 rounded-full text-silver-white hover:text-primary-red transition-all cursor-pointer"
              title="Reset Zoom"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <span className="text-xs font-black uppercase text-silver-white/60 select-none px-2 border-l border-white/10">
              {Math.round(scale * 100)}%
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 bg-matte-black border border-primary-red/20 hover:bg-primary-red/20 rounded-full text-silver-white hover:text-primary-red transition-all z-[110] cursor-pointer"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoomable Image Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-[90vw] max-h-[85vh] overflow-hidden flex items-center justify-center z-[105]"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Zoomed Poster Preview"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className={`max-w-full max-h-[80vh] object-contain rounded-lg transition-transform select-none ${
                scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
              }`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              }}
            />
          </motion.div>

          <p className="absolute bottom-6 text-center text-xs text-silver-white/40 uppercase tracking-widest pointer-events-none select-none">
            {scale > 1 ? 'Drag to pan around details' : 'Use controls above to inspect image quality'}
          </p>
        </div>
      )}
    </AnimatePresence>
  );
}
export default ImageLightbox;
