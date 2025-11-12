import React from 'react';
import { FilmIcon } from './icons/HeroIcons';

interface LoadingModalProps {
  status: string;
  progress: number;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ status, progress }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-gray-800 p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl border border-gray-700">
      <FilmIcon className="h-12 w-12 text-purple-400 mx-auto animate-pulse" />
      <h2 className="text-2xl font-bold mt-4 font-poppins text-white">Generating Video...</h2>
      <p className="text-gray-400 mt-2">This can take a few minutes. Please be patient.</p>
      <div className="mt-6 w-full">
        <p 
          className="text-sm text-gray-300 transition-opacity duration-500 mb-2"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {status}
        </p>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  </div>
);

export default LoadingModal;
