import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';

const AppearanceSettings = () => {
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      type === 'avatar' ? setAvatar(url) : setBanner(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Aparência</h1>

        {/* Upload do Avatar */}
        <div className="mb-10 flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500 shadow-md">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                <UploadCloud size={32} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'avatar')}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-sm text-gray-400">Clique para alterar o avatar do torneio</span>
        </div>

        {/* Upload do Banner */}
        <div className="mb-10">
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border-4 border-blue-500 shadow-md">
            {banner ? (
              <img src={banner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                <UploadCloud size={32} />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'banner')}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <span className="block text-sm text-center text-gray-400 mt-2">
            Clique para alterar o banner do torneio
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
