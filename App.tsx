import React, { useState } from 'react';
import { Home } from './components/Home';
import { Gallery } from './components/Gallery';
import { Maker } from './components/Maker';
import { Photo, Category } from './types';
import { Palette, X, RotateCw, Sliders } from 'lucide-react';

// Initial Categories - Only Default
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Unsorted', isDefault: true },
];

// Start with empty photos
const INITIAL_PHOTOS: Photo[] = [];

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  
  // Custom Gradient State
  const [bgColors, setBgColors] = useState({ start: '#ffdde1', end: '#ee9ca7' });
  const [bgSettings, setBgSettings] = useState({ angle: 135, split: 50 });
  const [showBgPicker, setShowBgPicker] = useState(false);

  // Navigation State
  const [view, setView] = useState<'home' | 'gallery' | 'maker'>('home');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  // --- ACTIONS ---

  // 1. Bulk Upload
  const handleBulkUpload = (files: FileList) => {
    if (!activeCategoryId) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: Photo = {
          id: Date.now().toString() + Math.random(),
          url: reader.result as string,
          tag: activeCategoryId, // Links to Category ID
          timestamp: Date.now()
        };
        setPhotos(prev => [newPhoto, ...prev]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 2. Delete Photo
  const handleDeletePhoto = (id: string) => {
    // Confirmation handled in UI components before calling this
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // 3. Category Management
  const createCategory = (name: string) => {
    const newCat: Category = {
        id: Date.now().toString(),
        name,
        isDefault: false
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (id: string, name: string, coverImage?: string) => {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, name, coverImage } : c));
  };

  const deleteCategory = (id: string) => {
      if (confirm("Delete this folder? Photos inside will be moved to Unsorted.")) {
          // Move photos to Unsorted (ID 1)
          setPhotos(prev => prev.map(p => p.tag === id ? { ...p, tag: '1' } : p));
          setCategories(prev => prev.filter(c => c.id !== id));
      }
  };

  // 4. Navigation
  const navigateToGallery = (cat: Category) => {
      setActiveCategoryId(cat.id);
      setView('gallery');
  };

  const navigateToMaker = (photo: Photo) => {
      setSelectedPhoto(photo);
      setView('maker');
  };

  const goBack = () => {
      if (view === 'maker') {
          setView('gallery');
          setSelectedPhoto(null);
      } else {
          setView('home');
          setActiveCategoryId(null);
      }
  };

  const bgStyle = {
      background: `linear-gradient(${bgSettings.angle}deg, ${bgColors.start} 0%, ${bgColors.start} ${bgSettings.split - 20}%, ${bgColors.end} ${bgSettings.split + 20}%, ${bgColors.end} 100%)`,
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed'
  };

  return (
    <div 
        className="min-h-screen text-slate-800 font-sans selection:bg-pink-200 transition-all duration-700 ease-in-out"
        style={bgStyle}
    >
      {/* Background Picker Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button 
            onClick={() => setShowBgPicker(!showBgPicker)}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 shadow-lg border border-white/30"
        >
            {showBgPicker ? <X size={20} /> : <Palette size={20} />}
        </button>
        {showBgPicker && (
            <div className="absolute top-12 right-0 bg-white p-5 rounded-2xl shadow-xl w-72 space-y-5 animate-fade-in z-50 text-slate-700">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-500">Theme</h4>
                    <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full">{bgSettings.angle}°</span>
                </div>
                
                {/* Color Pickers */}
                <div className="flex gap-4">
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-slate-400">Start</label>
                        <input 
                            type="color" 
                            value={bgColors.start}
                            onChange={(e) => setBgColors(prev => ({ ...prev, start: e.target.value }))}
                            className="w-full h-8 rounded-lg cursor-pointer border-2 border-slate-100 p-0"
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-slate-400">End</label>
                        <input 
                            type="color" 
                            value={bgColors.end}
                            onChange={(e) => setBgColors(prev => ({ ...prev, end: e.target.value }))}
                            className="w-full h-8 rounded-lg cursor-pointer border-2 border-slate-100 p-0"
                        />
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <RotateCw size={12} />
                            <span>Direction ({bgSettings.angle}°)</span>
                        </div>
                        <input 
                            type="range" min="0" max="360" 
                            value={bgSettings.angle}
                            onChange={(e) => setBgSettings(prev => ({ ...prev, angle: parseInt(e.target.value) }))}
                            className="w-full accent-pink-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Sliders size={12} />
                            <span>Position ({bgSettings.split}%)</span>
                        </div>
                        <input 
                            type="range" min="0" max="100" 
                            value={bgSettings.split}
                            onChange={(e) => setBgSettings(prev => ({ ...prev, split: parseInt(e.target.value) }))}
                            className="w-full accent-purple-500 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Preview Strip */}
                <div className="h-10 w-full rounded-xl shadow-inner" style={{ background: `linear-gradient(${bgSettings.angle}deg, ${bgColors.start} ${bgSettings.split - 20}%, ${bgColors.end} ${bgSettings.split + 20}%)` }}></div>
            </div>
        )}
      </div>

      {view === 'home' && (
        <Home 
          categories={categories}
          photos={photos}
          onSelectCategory={navigateToGallery}
          onCreateCategory={createCategory}
          onUpdateCategory={updateCategory}
          onDeleteCategory={deleteCategory}
        />
      )}

      {view === 'gallery' && activeCategory && (
        <Gallery 
          category={activeCategory}
          photos={photos.filter(p => p.tag === activeCategory.id)} 
          onBack={goBack}
          onUpload={handleBulkUpload}
          onDeletePhoto={handleDeletePhoto}
          onSelectForMaker={navigateToMaker}
        />
      )}

      {view === 'maker' && selectedPhoto && (
        <Maker 
          photo={selectedPhoto}
          onBack={goBack}
        />
      )}
    </div>
  );
};

export default App;
