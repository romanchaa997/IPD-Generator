
import React, { useState, useEffect, useRef } from 'react';
import type { SlideData } from '../types';
import Slide from './Slide';
import { XMarkIcon, LightBulbIcon, CheckCircleIcon, XCircleIcon } from './icons/HeroIcons';
import { GoogleGenAI } from '@google/genai';
import { useFocusTrap } from './useFocusTrap';

interface SlideReviewModalProps {
  slides: SlideData[];
  onAccept: (finalSlides: SlideData[]) => void;
  onDiscard: () => void;
  aiRef: React.RefObject<GoogleGenAI | null>;
}

const SlideReviewModal: React.FC<SlideReviewModalProps> = ({ slides, onAccept, onDiscard, aiRef }) => {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [editableSlides, setEditableSlides] = useState<SlideData[]>(() => JSON.parse(JSON.stringify(slides)));
  const [suggestions, setSuggestions] = useState<Record<number, string[]>>({});
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const modalRef = useFocusTrap<HTMLDivElement>(true);
  
  // Ref to track which slides have had suggestions fetched
  const suggestionsFetched = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDiscard();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onDiscard]);

  const fetchVisualSuggestions = async (slideIndex: number) => {
    if (!aiRef.current || suggestionsFetched.current.has(slideIndex)) {
      return;
    }

    setIsGeneratingSuggestions(true);
    suggestionsFetched.current.add(slideIndex);
    
    const slide = editableSlides[slideIndex];
    const contentString = JSON.stringify(slide.content);
    const prompt = `Based on the following slide content, suggest 3-4 specific, actionable visual elements. Examples: "A line graph showing market growth", "An icon of a shield for security", "A photo of a team collaborating". Return the suggestions as a JSON array of strings.

    Slide Title: ${slide.title}
    Slide Content: ${contentString}
    Speaker Notes: ${slide.speakerNotes}
    `;

    try {
        const response = await aiRef.current.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        const parsedSuggestions = JSON.parse(response.text);
        if (Array.isArray(parsedSuggestions)) {
            setSuggestions(prev => ({ ...prev, [slideIndex]: parsedSuggestions }));
        }
    } catch (error) {
        console.error("Error generating visual suggestions:", error);
    } finally {
        setIsGeneratingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchVisualSuggestions(selectedSlideIndex);
  }, [selectedSlideIndex, aiRef]);
  
  const handleAcceptSuggestion = (slideIndex: number, suggestion: string) => {
      setEditableSlides(prevSlides => {
          const newSlides = [...prevSlides];
          const slideToUpdate = newSlides[slideIndex];
          if (slideToUpdate && !slideToUpdate.visualElements.includes(suggestion)) {
              slideToUpdate.visualElements = [...slideToUpdate.visualElements, suggestion];
          }
          return newSlides;
      });

      setSuggestions(prev => {
          const newSuggestions = { ...prev };
          if (newSuggestions[slideIndex]) {
              newSuggestions[slideIndex] = newSuggestions[slideIndex].filter(s => s !== suggestion);
          }
          return newSuggestions;
      });
  };

  const handleRejectSuggestion = (slideIndex: number, suggestion: string) => {
      setSuggestions(prev => {
          const newSuggestions = { ...prev };
          if (newSuggestions[slideIndex]) {
              newSuggestions[slideIndex] = newSuggestions[slideIndex].filter(s => s !== suggestion);
          }
          return newSuggestions;
      });
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSuggestions = suggestions[selectedSlideIndex] || [];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onDiscard}>
      <div 
        ref={modalRef}
        className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-7xl h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
            <div>
                <h2 id="review-modal-title" className="text-xl font-bold font-poppins text-white">Review & Refine AI Slides</h2>
                <p className="text-sm text-gray-400">Review the generated slides and accept AI suggestions for visual elements.</p>
            </div>
            <button
                onClick={onDiscard}
                className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                aria-label="Close review"
            >
                <XMarkIcon className="h-6 w-6" />
            </button>
        </header>

        <div className="flex-grow flex overflow-hidden">
            <aside className="w-64 bg-gray-800 p-2 overflow-y-auto flex-shrink-0">
                <nav className="space-y-1">
                    {editableSlides.map((slide, index) => (
                        <a
                            key={slide.id}
                            href="#"
                            onClick={(e) => { e.preventDefault(); setSelectedSlideIndex(index); }}
                            className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors text-left ${ selectedSlideIndex === index ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                        >
                            <span className="font-bold text-gray-500 mr-2">{`#${index + 1}`}</span>
                            {slide.title}
                        </a>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 bg-gray-900 p-4 md:p-8 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2">
                    <Slide 
                        slideData={editableSlides[selectedSlideIndex]} 
                        slideNumber={selectedSlideIndex + 1}
                    />
                 </div>
                 <div className="bg-gray-800 rounded-lg p-4 overflow-y-auto">
                    <div className="flex items-center space-x-2 mb-4">
                        <LightBulbIcon className="h-6 w-6 text-yellow-400" />
                        <h3 className="text-lg font-bold text-white">AI Visual Suggestions</h3>
                    </div>
                    {isGeneratingSuggestions && <p className="text-gray-400 text-sm">Generating ideas...</p>}
                    {!isGeneratingSuggestions && currentSuggestions.length === 0 && <p className="text-gray-400 text-sm">No new suggestions for this slide.</p>}
                    <div className="space-y-3">
                        {currentSuggestions.map((suggestion, index) => (
                            <div key={index} className="bg-gray-700 p-3 rounded-md">
                                <p className="text-sm text-gray-200">{suggestion}</p>
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button onClick={() => handleRejectSuggestion(selectedSlideIndex, suggestion)} className="text-gray-400 hover:text-white" title="Reject Suggestion">
                                        <XCircleIcon className="h-6 w-6" />
                                    </button>
                                    <button onClick={() => handleAcceptSuggestion(selectedSlideIndex, suggestion)} className="text-green-400 hover:text-green-300" title="Accept Suggestion">
                                        <CheckCircleIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </main>
        </div>

        <footer className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800 flex justify-end space-x-4">
            <button onClick={onDiscard} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">
                Discard
            </button>
            <button onClick={() => onAccept(editableSlides)} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors">
                Accept & Add to Deck
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SlideReviewModal;
