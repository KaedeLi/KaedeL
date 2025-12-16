import React, { useState } from 'react';
import { Category, Photo } from '../types';
import { Button } from './ui/Button';
import { FolderPlus, X, Edit2, Image as ImageIcon, ShoppingBag, Trash2 } from 'lucide-react';

interface HomeProps {
  categories: Category[];
  photos: Photo[];
  onSelectCategory: (category: Category) => void;
  onCreateCategory: (name: string) => void;
  onUpdateCategory: (id: string, name: string, coverImage?: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  categories,
  photos,
  onSelectCategory,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const getCoverImage = (cat: Category) => {
    if (cat.coverImage) return cat.coverImage;
    // Fallback to the most recent photo in this category
    const catPhotos = photos.filter(p => p.tag === cat.id || p.tag === cat.name).sort((a, b) => b.timestamp - a.timestamp);
    return catPhotos.length > 0 ? catPhotos[0].url : null;
  };

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onCreateCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCreating(false);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>, catId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const category = categories.find(c => c.id === catId);
        if (category) {
            onUpdateCategory(catId, category.name, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-5xl font-bold text-white drop-shadow-md flex items-center justify-center gap-3">
           <ShoppingBag className="text-white" size={48} /> MyBag
        </h1>
        <p className="text-white/80 text-lg font-medium">Curate your collection.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        {/* Create New Card */}
        <div 
          onClick={() => setIsCreating(true)}
          className="aspect-square bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-dashed border-white/40 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group"
        >
          {isCreating ? (
            <form onSubmit={handleSubmitCreate} className="w-full px-4" onClick={e => e.stopPropagation()}>
                <input 
                    autoFocus
                    type="text" 
                    placeholder="Name..."
                    className="w-full bg-white/50 px-3 py-2 rounded-xl text-center placeholder-slate-500 text-slate-800 outline-none"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    onBlur={() => !newCategoryName && setIsCreating(false)}
                />
                <Button type="submit" size="sm" className="w-full mt-2">Add</Button>
            </form>
          ) : (
            <>
                <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FolderPlus className="text-white" size={32} />
                </div>
                <span className="text-white font-bold">New Collection</span>
            </>
          )}
        </div>

        {/* Categories */}
        {categories.map(cat => {
            const cover = getCoverImage(cat);
            const count = photos.filter(p => p.tag === cat.id || p.tag === cat.name).length;

            return (
                <div key={cat.id} className="group relative aspect-square bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                    {/* Cover Image */}
                    <div 
                        onClick={() => onSelectCategory(cat)}
                        className="w-full h-full cursor-pointer relative"
                    >
                        {cover ? (
                            <img src={cover} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                                <ImageIcon className="text-slate-300" size={48} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                    </div>

                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent pt-12">
                         <h3 className="text-white font-bold text-xl truncate shadow-black drop-shadow-sm">{cat.name}</h3>
                         <p className="text-white/80 text-sm">{count} items</p>
                    </div>

                    {/* Actions Toolbar - Always visible on mobile, or hover on desktop */}
                    {!cat.isDefault && (
                        <div className="absolute top-2 right-2 flex gap-1">
                             <label 
                                onClick={e => e.stopPropagation()}
                                className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur rounded-full text-white cursor-pointer transition-all"
                                title="Change Cover"
                             >
                                <ImageIcon size={14} />
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCoverUpload(e, cat.id)} />
                             </label>
                             <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteCategory(cat.id);
                                }}
                                className="p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur rounded-full text-white transition-all"
                                title="Delete Collection"
                             >
                                <X size={14} />
                             </button>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};
