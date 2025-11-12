import React from 'react';
import { XMarkIcon } from './icons/HeroIcons';

interface VideoPlayerModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ videoUrl, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
    <div className="bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl relative aspect-video">
      <button 
        onClick={onClose} 
        className="absolute -top-3 -right-3 p-1.5 bg-gray-700 hover:bg-red-600 rounded-full text-white transition-colors z-10"
        aria-label="Close video player"
      >
        <XMarkIcon className="h-6 w-6" />
      </button>
      <video src={videoUrl} controls autoPlay className="w-full h-full rounded-lg" />
    </div>
  </div>
);

// Add a simple fade-in animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);


export default VideoPlayerModal;
