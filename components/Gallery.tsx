import React, { useState } from 'react';
import { Photo, Category } from '../types';
import { Button } from './ui/Button';
import { Upload, ArrowLeft, Heart, Sparkles, Trash2, X, ZoomIn, Info } from 'lucide-react';

interface GalleryProps {
  category: Category;
  photos: Photo[];
  onBack: () => void;
  onUpload: (files: FileList) => void;
  onDeletePhoto: (id: string) => void;
  onSelectForMaker: (photo: Photo) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ 
  category,
  photos, 
  onBack,
  onUpload, 
  onDeletePhoto,
  onSelectForMaker,
}) => {
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in relative">
      
      {/* Lightbox Modal - Full Screen View */}
      {previewPhoto && (
        <div 
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setPreviewPhoto(null)}
        >
            <button 
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
                <X size={24} />
            </button>
            <div 
                className="relative max-w-5xl max-h-[90vh] w-full flex flex-col items-center justify-center gap-6" 
                onClick={e => e.stopPropagation()}
            >
                <img 
                    src={previewPhoto.url} 
                    alt="Preview" 
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl" 
                />
                <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                     <Button 
                        onClick={() => {
                            onSelectForMaker(previewPhoto);
                            setPreviewPhoto(null);
                        }}
                        className="shadow-xl bg-white text-slate-900 hover:bg-pink-50"
                     >
                        <Sparkles size={18} /> Make Card
                     </Button>
                     <div className="h-8 w-[1px] bg-white/20"></div>
                     <button 
                        onClick={() => {
                            if (confirm('Delete this photo permanently?')) {
                                onDeletePhoto(previewPhoto.id);
                                setPreviewPhoto(null);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-200 rounded-xl transition-colors"
                    >
                        <Trash2 size={18} /> Delete Photo
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header & Upload */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl shadow-purple-500/5">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} size="sm" className="bg-white/50">
             <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <Heart className="fill-pink-400 text-pink-500" /> {category.name}
            </h1>
            <p className="text-slate-600 mt-1">{photos.length} memories collected.</p>
          </div>
        </div>
        
        <label className="cursor-pointer group">
          <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
          <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-md group-hover:shadow-lg transition-all border border-pink-100 hover:scale-105 active:scale-95">
            <div className="p-2 bg-gradient-to-tr from-pink-400 to-purple-400 rounded-full text-white">
              <Upload size={20} />
            </div>
            <span className="font-semibold text-slate-700">Add Photos</span>
          </div>
        </label>
      </div>

      {/* Info Tip */}
      <div className="flex items-center gap-2 text-slate-500 text-sm px-4">
        <Info size={14} /> <span>Click any photo to view full size and access options.</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map(photo => (
          <div key={photo.id} className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-pink-200/50 transition-all duration-500 bg-white border-4 border-white">
            <div 
                className="w-full h-full cursor-zoom-in"
                onClick={() => setPreviewPhoto(photo)}
            >
                <img 
                src={photo.url} 
                alt="Memory" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </div>
            
            {/* Always Visible Delete Button for accessibility/obviousness */}
            <div className="absolute top-2 right-2 z-20">
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); // Critical: Prevent opening preview/maker
                        if (confirm('Are you sure you want to delete this photo?')) {
                            onDeletePhoto(photo.id);
                        }
                    }}
                    className="p-2 bg-white/70 hover:bg-red-500 hover:text-white text-slate-500 rounded-full shadow-lg backdrop-blur-sm transition-all transform hover:scale-110"
                    title="Delete Photo"
                    aria-label="Delete Photo"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Hover Actions */}
            <div className="absolute bottom-2 inset-x-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                <Button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectForMaker(photo);
                    }}
                    className="w-full bg-white/90 text-purple-600 hover:bg-white shadow-lg text-xs py-2"
                >
                    <Sparkles size={14} /> Make Card
                </Button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {photos.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-100">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4 shadow-sm border border-white/30">
                    <Upload size={32} className="opacity-80" />
                </div>
                <h3 className="text-xl font-bold mb-1">It's empty here!</h3>
                <p className="opacity-80 mb-6">Upload your first photo of {category.name}</p>
            </div>
        )}
      </div>
    </div>
  );
};
