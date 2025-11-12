
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';

import Sidebar from './components/Sidebar';
import Slide from './components/Slide';
import { WandSparklesIcon, VideoCameraIcon, DocumentPlusIcon, ArrowPathIcon } from './components/icons/HeroIcons';
import { PITCH_DECK_DATA } from './data/pitchDeckData';
import type { SlideData } from './types';

import AIPromptModal from './components/AIPromptModal';
import SlideReviewModal from './components/SlideReviewModal';
import VideoConfigModal from './components/VideoConfigModal';
import LoadingModal from './components/LoadingModal';
import VideoPlayerModal from './components/VideoPlayerModal';


const LOCAL_STORAGE_KEY = 'pitchDeckData';

const DeckView: React.FC = () => {
    const navigate = useNavigate();
    const { slideIndex } = useParams();
    const currentSlideIndex = slideIndex ? parseInt(slideIndex, 10) - 1 : 0;

    const getInitialSlides = (): SlideData[] => {
        try {
            const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Basic validation
                if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].id) {
                    return parsedData;
                }
            }
        } catch (error) {
            console.error("Failed to parse slides from localStorage", error);
        }
        return PITCH_DECK_DATA;
    };

    const [slidesData, setSlidesData] = useState<SlideData[]>(getInitialSlides);
    const [isApiKeySelected, setIsApiKeySelected] = useState(false);

    // Modal States
    const [isAIPromptOpen, setIsAIPromptOpen] = useState(false);
    const [isReviewingSlides, setIsReviewingSlides] = useState(false);
    const [generatedSlides, setGeneratedSlides] = useState<SlideData[]>([]);
    const [isVideoConfigOpen, setIsVideoConfigOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

    const aiRef = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(slidesData));
        } catch (error) {
            console.error("Failed to save slides to localStorage", error);
        }
    }, [slidesData]);
    
    useEffect(() => {
        // Ensure slideIndex is valid, redirect if not
        if (currentSlideIndex < 0 || currentSlideIndex >= slidesData.length) {
            navigate('/slide/1', { replace: true });
        }
    }, [currentSlideIndex, slidesData.length, navigate]);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
            setIsApiKeySelected(true);
            return true;
        }
        return false;
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);
    
    const initializeAi = () => {
        if (process.env.API_KEY) {
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } else {
            console.error("API Key is missing.");
            setIsApiKeySelected(false);
        }
    };
    
    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setIsApiKeySelected(true);
        }
    };

    const handleGenerateSlidesWithAI = async (prompt: string) => {
        setIsAIPromptOpen(false);
        setIsLoading(true);
        setLoadingStatus('Initializing AI model...');
        setProgress(10);
        
        initializeAi();
        if (!aiRef.current) {
            alert("AI Client not initialized. Please ensure your API key is set.");
            setIsLoading(false);
            return;
        }
    
        setLoadingStatus('Generating presentation content...');
        setProgress(30);
    
        const fullPrompt = `Based on the following idea, generate a JSON array for a 5-slide pitch deck: "${prompt}". 
          Each object in the array should represent a slide and strictly follow this TypeScript interface:
          \`\`\`
          interface SlideData {
            id: number;
            title: string;
            layout: 'Title' | 'Table with icons' | 'Large numbers with icons' | 'Three columns with icons' | 'Hexagon diagram with 6 modules' | 'Default';
            content: any;
            speakerNotes: string;
            visualElements: string[];
          }
          \`\`\`
          The 'id' should be a unique number. The 'visualElements' array should be empty to start.
          Ensure the generated JSON is valid and can be parsed directly. The 'content' object should be structured appropriately for the chosen 'layout'. For a 'Title' layout, 'content' must have 'mainTitle', 'subtitle', etc.`;
    
        try {
            const response = await aiRef.current.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
                config: {
                    responseMimeType: 'application/json',
                }
            });
    
            setLoadingStatus('Parsing AI response...');
            setProgress(80);
            
            const generatedJson = JSON.parse(response.text);
            
            // Validate and assign unique IDs
            const newSlides = generatedJson.map((slide: Omit<SlideData, 'id'>, index: number) => ({
                ...slide,
                id: Date.now() + index, // Ensure unique ID
                visualElements: slide.visualElements || [], // Ensure array exists
            }));
            
            setGeneratedSlides(newSlides);
            setIsReviewingSlides(true);
        } catch (error) {
            console.error("Error generating slides:", error);
            alert("Failed to generate slides. The AI may have returned an invalid format. Please check the console for details.");
        } finally {
            setIsLoading(false);
            setProgress(100);
        }
      };

    const handleAcceptSlides = (finalSlides: SlideData[]) => {
        const newSlides = [...slidesData, ...finalSlides];
        setSlidesData(newSlides);
        setIsReviewingSlides(false);
        setGeneratedSlides([]);
        navigate(`/slide/${slidesData.length + 1}`);
    };

    const handleDiscardSlides = () => {
        setIsReviewingSlides(false);
        setGeneratedSlides([]);
    };
    
    const generateThumbnail = (videoFileUrl: string): Promise<string> => {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = videoFileUrl;
            video.crossOrigin = "anonymous"; // Important for canvas
            video.onloadeddata = () => {
                video.currentTime = 1; // Seek to 1 second
            };
            video.onseeked = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg'));
                } else {
                    resolve('');
                }
            };
            video.onerror = () => {
                resolve(''); // Resolve with empty on error
            };
        });
    };

    const handleGenerateVideo = async (config: {
        aspectRatio: '16:9' | '9:16';
        resolution: '720p' | '1080p';
        customTitle: string;
        logoBase64: string | null;
        primaryColor: string;
        accentColor: string;
    }) => {
        if (!await checkApiKey()) {
            handleSelectKey();
            return;
        }
        
        setIsVideoConfigOpen(false);
        setIsLoading(true);

        let brandingInstructions = '';
        if (config.logoBase64) {
            brandingInstructions += `
              - Incorporate the following brand logo as a subtle watermark in the bottom-right corner of the video. The logo is provided as a Base64 encoded string: "${config.logoBase64}".
            `;
        }
        brandingInstructions += `
          - Use these brand colors for on-screen text, graphics, and highlights. Primary Color: ${config.primaryColor}, Accent Color: ${config.accentColor}.
        `;

        const videoPrompt = `
          Create a dynamic, professional, and engaging video pitch based on the following presentation slides.
          Video Title: "${config.customTitle}"
          The video should be a summary of the key points from the deck.
          ---
          DECK CONTENT:
          ${slidesData.map(s => `Slide ${s.id} (${s.title}):\n${JSON.stringify(s.content)}\nSpeaker Notes: ${s.speakerNotes}`).join('\n\n')}
          ---
          Instructions:
          - Use a confident, professional voiceover.
          - Use dynamic transitions and on-screen text overlays to highlight key data and concepts.
          - Generate relevant, abstract background visuals that match the tech-focused theme.
          ${brandingInstructions}
        `;
        let operation: any = null;
        try {
          setLoadingStatus("Initializing video generation...");
          setProgress(0);
    
          initializeAi();
          if (!aiRef.current) {
            throw new Error("AI client not initialized.");
          }
          
          setLoadingStatus("Sending request to VEO model...");
          setProgress(10);
          operation = await aiRef.current.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: videoPrompt,
            config: {
              numberOfVideos: 1,
              resolution: config.resolution,
              aspectRatio: config.aspectRatio,
            }
          });
          
          setLoadingStatus("Video is processing in the background...");
          setProgress(25);
    
          while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            setProgress(p => Math.min(p + 10, 80));
            operation = await aiRef.current.operations.getVideosOperation({ operation });
          }
          
          setLoadingStatus("Finalizing and fetching video...");
          setProgress(90);
    
          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (downloadLink && process.env.API_KEY) {
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
            const videoBlob = await videoResponse.blob();
            const newVideoUrl = URL.createObjectURL(videoBlob);
            setVideoUrl(newVideoUrl);
            
            setLoadingStatus("Generating video thumbnail...");
            setProgress(95);
            const thumbUrl = await generateThumbnail(newVideoUrl);
            setThumbnailUrl(thumbUrl);

          } else {
            throw new Error("Video generation completed, but no download link was found or API key is missing.");
          }
          
          setProgress(100);
        } catch (error: any) {
          console.error("Error generating video:", error);
          let errorMessage = "An unknown error occurred during video generation.";
           if (error.message?.includes("API_KEY_INVALID") || operation?.error?.message?.includes("API_KEY_INVALID")) {
            errorMessage = "Your API Key is invalid. Please select a valid key and try again.";
            setIsApiKeySelected(false);
          } else if (error.message?.includes("PERMISSION_DENIED") || operation?.error?.message?.includes("PERMISSION_DENIED")) {
            errorMessage = "Permission denied. Please ensure your API key has the 'Generative Language API' enabled and billing is active.";
             setIsApiKeySelected(false);
          } else if (error.message?.includes("RESOURCE_EXHAUSTED") || operation?.error?.message?.includes("RESOURCE_EXHAUSTED")) {
            errorMessage = "You have exceeded your API quota. Please check your usage limits or upgrade your plan.";
          } else if (error.message?.includes("Failed to fetch")) {
            errorMessage = "A network error occurred. Please check your connection and try again.";
          }
          alert(errorMessage);
        } finally {
          setIsLoading(false);
        }
    };
    
    const handleAddNewSlide = () => {
        const newSlide: SlideData = {
            id: Date.now(),
            title: 'New Slide',
            layout: 'Default',
            content: { title: 'New Slide Title', text: 'Start adding your content here.' },
            visualElements: [],
            speakerNotes: 'Add your speaker notes for this new slide.'
        };
        const newSlides = [...slidesData, newSlide];
        setSlidesData(newSlides);
        navigate(`/slide/${newSlides.length}`);
    };
    
    const handleResetDeck = () => {
        if (window.confirm("Are you sure you want to reset the deck? All your changes will be lost.")) {
            setSlidesData(PITCH_DECK_DATA);
            navigate('/slide/1');
        }
    };
    
    const handleUpdateSlideData = (updatedSlide: SlideData) => {
        setSlidesData(prevSlides => {
            const slideIndexToUpdate = prevSlides.findIndex(s => s.id === updatedSlide.id);
            if (slideIndexToUpdate === -1) return prevSlides;
            const newSlides = [...prevSlides];
            newSlides[slideIndexToUpdate] = updatedSlide;
            return newSlides;
        });
    };
    
    const handleGenerateSpeakerNotes = async (slideId: number, slideContent: string) => {
        initializeAi();
        if (!aiRef.current) {
            alert("AI Client not initialized.");
            return;
        }

        const prompt = `Based on the following slide content, generate concise and professional speaker notes for a pitch deck presentation. The notes should elaborate on the key points without being verbose.\n\nSlide Content:\n${slideContent}`;
        
        try {
            const response = await aiRef.current.models.generateContentStream({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });

            let currentNotes = "";
            // Clear existing notes for the target slide
            setSlidesData(prev => prev.map(s => s.id === slideId ? { ...s, speakerNotes: "" } : s));

            for await (const chunk of response) {
                currentNotes += chunk.text;
                // Stream updates to the specific slide's speaker notes
                setSlidesData(prev => prev.map(s => s.id === slideId ? { ...s, speakerNotes: currentNotes } : s));
            }
        } catch (error) {
            console.error("Error generating speaker notes:", error);
            alert("Failed to generate speaker notes. Please check the console.");
            // Optional: Revert to original notes on error
        }
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex">
          <Sidebar
            slides={slidesData}
            currentSlideIndex={currentSlideIndex}
            onSelectSlide={(index) => navigate(`/slide/${index + 1}`)}
          />
          <main className="flex-1 md:pl-64 flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl">
                {slidesData[currentSlideIndex] && (
                    <Slide 
                        key={slidesData[currentSlideIndex].id} // Add key for re-rendering on edit
                        slideData={slidesData[currentSlideIndex]} 
                        slideNumber={currentSlideIndex + 1}
                        onGenerateNotes={handleGenerateSpeakerNotes}
                        onUpdateSlide={handleUpdateSlideData}
                    />
                )}
            </div>
             <div className="mt-8 flex items-center justify-center space-x-2 md:space-x-4 flex-wrap gap-y-2">
                <button 
                  onClick={() => setIsAIPromptOpen(true)}
                  className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                  title="Generate new slides using AI"
                >
                  <WandSparklesIcon className="h-5 w-5" />
                  <span>Create with AI</span>
                </button>
                 <button
                  onClick={handleAddNewSlide}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm font-bold hover:bg-gray-500 transition-colors"
                  title="Add a new blank slide"
                >
                  <DocumentPlusIcon className="h-5 w-5" />
                  <span>Add New Slide</span>
                </button>
                 <button
                  onClick={() => setIsVideoConfigOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                  title="Generate a video summary of the deck"
                >
                  <VideoCameraIcon className="h-5 w-5" />
                  <span>Generate Video</span>
                </button>
                 <button
                  onClick={handleResetDeck}
                  className="flex items-center space-x-2 bg-red-800 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                  title="Reset deck to original template"
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  <span>Reset Deck</span>
                </button>
            </div>
          </main>
    
          {/* Modals */}
          {isAIPromptOpen && <AIPromptModal onClose={() => setIsAIPromptOpen(false)} onGenerate={handleGenerateSlidesWithAI} />}
          {isReviewingSlides && <SlideReviewModal slides={generatedSlides} onAccept={handleAcceptSlides} onDiscard={handleDiscardSlides} aiRef={aiRef} />}
          {isVideoConfigOpen && <VideoConfigModal onClose={() => setIsVideoConfigOpen(false)} onGenerate={handleGenerateVideo} />}
          {isLoading && <LoadingModal status={loadingStatus} progress={progress} />}
          {videoUrl && <VideoPlayerModal videoUrl={videoUrl} thumbnailUrl={thumbnailUrl} onClose={() => setVideoUrl(null)} />}
        </div>
      );
};


const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/slide/:slideIndex" element={<DeckView />} />
            <Route path="/" element={<Navigate to="/slide/1" replace />} />
        </Routes>
    );
};

export default App;
