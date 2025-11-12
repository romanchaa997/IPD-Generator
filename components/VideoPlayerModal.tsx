import React from 'react';
import { XMarkIcon } from './icons/HeroIcons';

interface VideoPlayerModalProps {
  videoUrl: string;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ videoUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 p-4 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors z-10"
          aria-label="Close video player"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="aspect-video">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
