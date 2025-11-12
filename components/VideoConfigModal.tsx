
import React, { useState, useEffect } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, XCircleIcon } from './icons/HeroIcons';
import { useFocusTrap } from './useFocusTrap';

interface VideoConfigModalProps {
  onClose: () => void;
  onGenerate: (config: {
    aspectRatio: '16:9' | '9:16';
    resolution: '720p' | '1080p';
    customTitle: string;
    logoBase64: string | null;
    primaryColor: string;
    accentColor: string;
  }) => void;
}

const VideoConfigModal: React.FC<VideoConfigModalProps> = ({ onClose, onGenerate }) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [customTitle, setCustomTitle] = useState('Unified Technology Ecosystem Pitch');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#667eea');
  const [accentColor, setAccentColor] = useState('#f5576c');
  const modalRef = useFocusTrap<HTMLDivElement>(true);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = () => {
    const cleanLogoBase64 = logoBase64 ? logoBase64.split(',')[1] : null;
    onGenerate({ aspectRatio, resolution, customTitle, logoBase64: cleanLogoBase64, primaryColor, accentColor });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-gray-800 p-8 rounded-2xl text-left max-w-md w-full shadow-2xl border border-gray-700 relative" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-config-title"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          aria-label="Close configuration"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <h2 id="video-config-title" className="text-2xl font-bold mb-6 font-poppins text-white">Video Generation Settings</h2>

        <div className="space-y-6">
           <div>
            <label htmlFor="custom-title" className="block text-sm font-medium text-gray-300 mb-2">Custom Video Title</label>
            <input
              type="text"
              id="custom-title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g., Q3 Investor Update"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
            <div className="flex space-x-4">
              {(['16:9', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors w-full ${
                    aspectRatio === ratio ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
            <div className="flex space-x-4">
              {(['720p', '1080p'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors w-full ${
                    resolution === res ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6 mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white">Branding (Optional)</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Brand Logo</label>
            {logoBase64 ? (
              <div className="flex items-center space-x-4">
                <img src={logoBase64} alt="Logo Preview" className="h-12 w-auto object-contain bg-white rounded-md p-1" />
                <button
                  onClick={() => setLogoBase64(null)}
                  className="text-red-400 hover:text-red-300"
                  aria-label="Remove logo"
                  title="Remove logo"
                >
                  <XCircleIcon className="h-7 w-7" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="logo-upload"
                className="relative flex justify-center w-full h-24 px-6 pt-5 pb-6 mt-1 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-gray-500 transition-all"
              >
                <div className="space-y-1 text-center">
                  <ArrowUpTrayIcon className="w-10 h-10 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-400">
                    Click to upload a logo
                  </p>
                </div>
                <input id="logo-upload" name="logo-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileChange} />
              </label>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Brand Colors</label>
            <div className="flex items-center space-x-4">
                <div className="flex-1">
                    <label htmlFor="primary-color" className="block text-xs text-gray-400">Primary</label>
                    <input id="primary-color" type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-full h-10 p-0 bg-transparent border-none rounded-md cursor-pointer" />
                </div>
                <div className="flex-1">
                    <label htmlFor="accent-color" className="block text-xs text-gray-400">Accent</label>
                    <input id="accent-color" type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-full h-10 p-0 bg-transparent border-none rounded-md cursor-pointer" />
                </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={handleGenerate}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity"
          >
            Generate Pitch Video
          </button>
          <p className="text-xs text-gray-500 mt-3 text-center">
            Note: Video generation can take a few minutes.
            <br />
            Ensure your project has <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-300">billing enabled</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoConfigModal;
