'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';

export default function ImageSearch({ onSearchQuery }: { onSearchQuery?: (query: string) => void }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      alert('Image search feature coming soon!');
      if (e.target) {
        e.target.value = '';
      }
    } catch (err) {
      console.error('[ImageSearch] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type='button'
        onClick={() => fileInputRef.current?.click()}
        className='p-2 hover:bg-emerald-50 rounded-full transition-colors'
        disabled={loading}
        title='Image search'
      >
        {loading ? (
          <Loader2
            size={20}
            className='text-emerald-600 animate-spin'
          />
        ) : (
          <Camera size={20} className='text-emerald-600' />
        )}
      </button>
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleImageUpload}
        className='hidden'
      />
    </>
  );
}