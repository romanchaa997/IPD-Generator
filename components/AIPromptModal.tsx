import React, { useState } from 'react';
import { XMarkIcon, WandSparklesIcon } from './icons/HeroIcons';

interface AIPromptModalProps {
  onClose: () => void;
  onGenerate: (prompt: string) => void;
}

const AIPromptModal: React.FC<AIPromptModalProps> = ({ onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-800 p-8 rounded-2xl text-left max-w-lg w-full shadow-2xl border border-gray-700 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
          aria-label="Close AI prompt"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center space-x-3 mb-6">
            <WandSparklesIcon className="h-7 w-7 text-purple-400"/>
            <h2 className="text-2xl font-bold font-poppins text-white">Create Slides with AI</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Describe your presentation idea
            </label>
            <textarea
              id="ai-prompt"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A 5-slide pitch deck for 'QuantumLeap,' an AI platform for drug discovery, targeting biotech investors."
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
             <p className="text-xs text-gray-500 mt-2">The more detail you provide, the better the result.</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={handleGenerateClick}
            disabled={!prompt.trim()}
            className="w-full bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <WandSparklesIcon className="h-5 w-5" />
            <span>Generate Slides</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;
