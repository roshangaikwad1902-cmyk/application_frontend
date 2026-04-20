import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Upload, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config/constants';

interface KYCDocumentUploadProps {
  guestId: string;
  guestCount?: number;
  onSuccess?: (url: string) => void;
}

export const KYCDocumentUpload: React.FC<KYCDocumentUploadProps> = ({ guestId, guestCount = 1, onSuccess }) => {
  const [images, setImages] = useState<Record<string, string>>({});
  
  // Dynamic labels based on guest count
  const getSlots = () => {
    if (guestCount === 2) {
      return [
        { id: 'g1_front', label: 'Guest 1 Front', required: true },
        { id: 'g1_back', label: 'Guest 1 Back', required: true },
        { id: 'g2_front', label: 'Guest 2 Front', required: true },
        { id: 'g2_back', label: 'Guest 2 Back', required: true },
      ];
    }
    if (guestCount > 2) {
      return [
        { id: 'g1', label: 'Guest 1 ID', required: true },
        { id: 'g2', label: 'Guest 2 ID', required: true },
        { id: 'g3', label: 'Guest 3 ID', required: true },
        { id: 'g4', label: 'Guest 4 ID', required: true },
      ];
    }
    return [
      { id: 'aadharFront', label: 'Aadhar Front', required: true },
      { id: 'aadharBack', label: 'Aadhar Back', required: true },
      { id: 'doc3', label: 'Document 3', required: true },
      { id: 'doc4', label: 'Document 4', required: true },
    ];
  };

  const currentSlots = getSlots();

  const handleImageChange = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      return toast.error(`${file.name} exceeds 10MB limit`);
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return toast.error("Only JPG, PNG and WEBP are allowed");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImages(prev => ({ ...prev, [slotId]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const mergeImages = async (): Promise<string | null> => {
    if (Object.keys(images).length === 0) {
      toast.error("Please select at least one document image");
      return null;
    }

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Target high resolution for readability (2048x2048 total)
    const totalSize = 2048;
    const slotSize = totalSize / 2;
    canvas.width = totalSize;
    canvas.height = totalSize;

    // Background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, totalSize, totalSize);

    try {
      const loadImg = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
      });

      const loadedImages = await Promise.all(
        currentSlots.map(async slot => {
          if (!images[slot.id]) return null;
          return await loadImg(images[slot.id]);
        })
      );

      const positions = [
        { x: 0, y: 0 },
        { x: slotSize, y: 0 },
        { x: 0, y: slotSize },
        { x: slotSize, y: slotSize },
      ];

      loadedImages.forEach((img, i) => {
        const pos = positions[i];
        if (!img) return; // Skip empty slots

        // Aspect ratio calculation to fill the slot properly
        const ratio = Math.max(slotSize / img.width, slotSize / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const offsetX = (slotSize - w) / 2;
        const offsetY = (slotSize - h) / 2;
        
        ctx.save();
        ctx.beginPath();
        ctx.rect(pos.x, pos.y, slotSize, slotSize);
        ctx.clip();
        ctx.drawImage(img, pos.x + offsetX, pos.y + offsetY, w, h);
        ctx.restore();
        
        // Add subtle labeling
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = 'bold 48px sans-serif';
        ctx.fillText(currentSlots[i].label, pos.x + 30, pos.y + 70);
        
        // Add border for quadrants
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 4;
        ctx.strokeRect(pos.x, pos.y, slotSize, slotSize);
      });

      // Compress to ≤ 1MB (0.7 quality usually achieves this for 2048 grid)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      setIsProcessing(false);
      return dataUrl;
    } catch (err) {
      console.error(err);
      toast.error("Image processing failed");
      setIsProcessing(false);
      return null;
    }
  };

  const handleUpload = async () => {
    const finalImage = await mergeImages();
    if (!finalImage) return;

    setIsUploading(true);
    const tid = toast.loading("Uploading processed KYC documents...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/content/guests/${guestId}/kyc`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('hotel_token')}`
        },
        body: JSON.stringify({ image: finalImage })
      });

      const data = await res.json();
      if (data.success) {
        toast.success("KYC Uploaded Successfully", { id: tid });
        onSuccess?.(data.url);
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err.message, { id: tid });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-[var(--lux-card)] border border-[var(--lux-border)] rounded-[2rem] shadow-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-bold tracking-tight text-white">KYC Document <span className="text-[var(--lux-gold)]">Console</span></h3>
          <p className="text-[9px] font-black uppercase text-[var(--lux-muted)] tracking-widest mt-1">4-Image Consolidated Archive</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[var(--lux-gold)]/10 flex items-center justify-center text-[var(--lux-gold)]">
           <ShieldCheck size={24} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {currentSlots.map(slot => (
          <div key={slot.id} className="relative aspect-[4/3] rounded-2xl border-2 border-dashed border-white/5 overflow-hidden group hover:border-[var(--lux-gold)]/30 transition-all cursor-pointer bg-white/[0.02]">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleImageChange(slot.id, e)}
              className="absolute inset-0 opacity-0 z-10 cursor-pointer"
            />
            {images[slot.id] ? (
              <img src={images[slot.id]} alt={slot.label} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 text-[var(--lux-muted)] group-hover:text-[var(--lux-gold)] group-hover:bg-[var(--lux-gold)]/5 transition-all">
                <ImageIcon size={24} />
                <span className="text-[8px] font-black uppercase tracking-widest">{slot.label}</span>
              </div>
            )}
            {images[slot.id] && (
              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
                <CheckCircle2 size={12} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button 
          onClick={handleUpload}
          disabled={isProcessing || isUploading || Object.keys(images).length === 0}
          className="w-full py-4 bg-[var(--lux-gold)] text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-[var(--lux-gold)]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none transition-all"
        >
          {isUploading || isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          {isProcessing ? "Processing Grid..." : isUploading ? "Uploading Archive..." : "Finalize & Upload KYC"}
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
        <AlertCircle size={14} className="text-[var(--lux-gold)]" />
        <p className="text-[8px] font-bold text-[var(--lux-muted)] leading-tight">Images will be merged into a single high-security document. You can upload 1 to 4 images. Maximum 10MB per original file.</p>
      </div>
    </div>
  );
};
