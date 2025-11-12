import React, { useState } from 'react';
import { XMarkIcon } from './icons/HeroIcons';

interface VideoConfigModalProps {
  onClose: () => void;
  onGenerate: (config: { aspectRatio: '16:9' | '9:16'; resolution: '720p' | '1080p'; customTitle: string; }) => void;
}

const VideoConfigModal: React.FC<VideoConfigModalProps> = ({ onClose, onGenerate }) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [customTitle, setCustomTitle] = useState('Unified Technology Ecosystem Pitch');

  const handleGenerate = () => {
    onGenerate({ aspectRatio, resolution, customTitle });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-2xl text-left max-w-md w-full shadow-2xl border border-gray-700 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          aria-label="Close configuration"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold mb-6 font-poppins text-white">Video Generation Settings</h2>

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