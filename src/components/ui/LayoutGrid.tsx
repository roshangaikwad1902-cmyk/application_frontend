import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Camera, Trash2, ChevronRight } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

export const ModulePlaceholder = ({ title }: { title: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center h-[70vh] text-center"
  >
    <div className="w-20 h-20 bg-[var(--lux-glass)] rounded-full flex items-center justify-center mb-6 border border-[var(--lux-border)]">
       <Sparkles size={40} className="text-[var(--lux-gold)] opacity-20" />
    </div>
    <h2 className="text-2xl font-display font-bold mb-2 uppercase tracking-tighter">{title}</h2>
    <p className="text-[var(--lux-muted)] text-[8px] uppercase font-black tracking-widest leading-relaxed">Enterprise module under development. Architecting next release.</p>
  </motion.div>
);

export const NormalInput = ({ label, value, onChange, placeholder, type = 'text', min, required = false }: any) => (
  <div className="space-y-1">
     <label className="normal-label">{label} {required && '*'}</label>
     <input 
       type={type} min={min} required={required} placeholder={placeholder} value={value} 
       onChange={e => onChange(e.target.value)}
       className="normal-input" 
     />
  </div>
);

export const NormalSelect = ({ label, value, onChange, options, required = false, placeholder = "Select Option" }: any) => (
  <div className="space-y-1">
     <label className="normal-label">{label} {required && '*'}</label>
     <div className="relative group">
        <select 
          required={required} value={value} onChange={e => onChange(e.target.value)}
          className="normal-input appearance-none pr-10"
        >
           <option value="">{placeholder}</option>
           {options?.map((o: any) => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--lux-muted)] group-focus-within:text-[var(--lux-gold)] transition-colors">
           <ChevronRight size={14} className="rotate-90" />
        </div>
     </div>
  </div>
);

export const NormalUploader = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
     <label className="normal-label truncate">{label}</label>
     <div className="relative h-24 rounded-lg border-2 border-dashed border-[var(--lux-border)] bg-[var(--lux-bg)] flex flex-col items-center justify-center p-2 group hover:border-[var(--lux-gold)] transition-colors overflow-hidden">
        {value ? (
           <div className="relative w-full h-full group">
              <img src={value} alt={label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                 <button type="button" onClick={() => onChange('')} className="p-1 bg-red-500 rounded-md text-white"><Trash2 size={12} /></button>
              </div>
           </div>
        ) : (
           <>
              <Camera size={16} className="text-[var(--lux-muted)]" />
              <span className="text-[8px] font-bold uppercase mt-1">Upload</span>
              <ImageUpload value={value} onChange={onChange} className="absolute inset-0 opacity-0 cursor-pointer" />
           </>
        )}
     </div>
  </div>
);
