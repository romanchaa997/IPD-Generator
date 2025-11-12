import React, { useEffect } from 'react';
import { XMarkIcon, TwitterIcon, LinkedInIcon } from './icons/HeroIcons';
import { useFocusTrap } from './useFocusTrap';

interface VideoPlayerModalProps {
  videoUrl: string;
  thumbnailUrl: string | null;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ videoUrl, thumbnailUrl, onClose }) => {
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

  const shareText = "Check out this AI-generated pitch deck video summary!";
  const shareTitle = "Unified Technology Ecosystem Pitch Deck";
  const encodedVideoUrl = encodeURIComponent(videoUrl);
  
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedVideoUrl}`;
  const linkedInShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedVideoUrl}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(shareText)}`;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div 
        ref={modalRef}
        className="bg-gray-900 p-4 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl relative" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-player-title"
      >
        <h2 id="video-player-title" className="sr-only">Generated Video Player</h2>
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
            poster={thumbnailUrl || ''}
            className="w-full h-full rounded-lg bg-black"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-center space-x-4">
            <span className="text-sm font-medium text-gray-400">Share on:</span>
            <a 
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-[#1DA1F2] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
              aria-label="Share on Twitter"
            >
              <TwitterIcon className="h-5 w-5" />
              <span>Twitter</span>
            </a>
            <a
              href={linkedInShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-[#0A66C2] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
              aria-label="Share on LinkedIn"
            >
                <LinkedInIcon className="h-5 w-5" />
                <span>LinkedIn</span>
            </a>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerModal;
