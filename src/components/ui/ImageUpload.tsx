import React, { useState } from 'react';
import { UploadCloud, Loader2, X } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, className = '' }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/content/upload/guest-document`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.url) {
                onChange(data.url);
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Upload failed', err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`w-full ${className}`}>
            {value ? (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video group bg-white/5 flex flex-col items-center justify-center p-2">
                    <img 
                        src={value} 
                        alt="Uploaded preview" 
                        className="max-h-[80%] max-w-full object-contain" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => onChange('')}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploading ? (
                            <Loader2 className="w-8 h-8 text-luxGold animate-spin mb-2" />
                        ) : (
                            <UploadCloud className="w-8 h-8 text-white/20 mb-2" />
                        )}
                        <p className="text-sm text-white/40">
                            {isUploading ? 'Uploading...' : 'Click to upload guest photo'}
                        </p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                </label>
            )}
        </div>
    );
};
