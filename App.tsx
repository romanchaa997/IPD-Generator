import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PITCH_DECK_DATA } from './data/pitchDeckData';
import Sidebar from './components/Sidebar';
import Slide from './components/Slide';
import LoadingModal from './components/LoadingModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import { ArrowLeftCircleIcon, ArrowRightCircleIcon, SparklesIcon } from './components/icons/HeroIcons';

// Note: The global window.aistudio type is defined in types.ts to prevent declaration conflicts.

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const statusIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const slideTitles = PITCH_DECK_DATA.map((slide, index) => ({
    id: index,
    title: slide.title,
    fullTitle: `Slide ${index + 1}: ${slide.title}`,
  }));

  const handleSelectSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % PITCH_DECK_DATA.length);
  }, []);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + PITCH_DECK_DATA.length) % PITCH_DECK_DATA.length);
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeySelected(true);
      setGenerationError(null);
    }
  };

  const handleGenerateVideo = async () => {
    if (!apiKeySelected) {
      handleSelectKey();
      return;
    }

    setIsGeneratingVideo(true);
    setGenerationError(null);
    setVideoUrl(null);

    const LOADING_MESSAGES = [
      'Warming up the virtual cameras...',
      'Scripting the key talking points...',
      'Generating opening sequence...',
      'Analyzing market data for visuals...',
      'Rendering the solution showcase...',
      'Adding final post-production touches...',
      'Almost ready, preparing for the premiere...',
    ];
    let messageIndex = 0;
    setGenerationStatus(LOADING_MESSAGES[messageIndex]);
    statusIntervalRef.current = window.setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setGenerationStatus(LOADING_MESSAGES[messageIndex]);
    }, 5000);

    try {
      const summary = PITCH_DECK_DATA.map(slide => `Slide: ${slide.title}. Notes: ${slide.speakerNotes}`).join('\n\n');
      const prompt = `Create a short, dynamic, and engaging promotional video summarizing this pitch deck. The video should be about 30-45 seconds. Highlight the key problem (Regulatory Tsunami), the massive market opportunity, our unique integrated solution, and the strong business case. Use visually appealing abstract graphics, data visualizations, and a confident, professional tone. Here is the content:\n\n${summary}`;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

      if (downloadLink) {
        setGenerationStatus('Downloading video...');
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      } else {
        throw new Error('Video generation failed to produce a download link.');
      }
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      let userFriendlyMessage = 'An unexpected error occurred during video generation.';
      const errorMessage = (error.message || '').toLowerCase();

      if (errorMessage.includes('api key not valid') || errorMessage.includes('requested entity was not found')) {
        userFriendlyMessage = 'Your API Key appears to be invalid. Please select a valid key and ensure it is enabled.';
        setApiKeySelected(false);
      } else if (errorMessage.includes('billing')) {
        userFriendlyMessage = 'Video generation failed. Please ensure that billing is enabled for your Google Cloud project.';
        setApiKeySelected(false);
      } else if (errorMessage.includes('quota')) {
        userFriendlyMessage = 'You have exceeded your API quota. Please check your usage limits and try again later.';
      } else if (errorMessage.includes('safety settings')) {
        userFriendlyMessage = 'The request was blocked due to safety settings. Please try modifying the content.';
      } else if (error instanceof TypeError && errorMessage.includes('failed to fetch')) {
        userFriendlyMessage = 'A network error occurred. Please check your internet connection and try again.';
      } else if (errorMessage.includes('failed to download video')) {
        userFriendlyMessage = `There was a problem downloading the video file. Please try again. (${error.message})`;
      } else {
        userFriendlyMessage = `An error occurred: ${error.message}`;
      }
      
      setGenerationError(userFriendlyMessage);
    } finally {
      setIsGeneratingVideo(false);
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
      setGenerationStatus('');
    }
  };

  return (
    <div className="flex h-screen bg-[#111827] text-gray-200 font-inter">
      <Sidebar
        slides={slideTitles}
        currentSlideIndex={currentSlide}
        onSelectSlide={handleSelectSlide}
      />
      <main className="md:pl-64 flex-1 flex flex-col p-4 md:p-8 overflow-y-auto relative">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div className="flex-1">
                <h2 className="text-xl font-bold font-poppins text-white">Presentation View</h2>
                <p className="text-sm text-gray-400">Navigate slides or generate a video summary.</p>
            </div>
             {apiKeySelected ? (
                <button 
                    onClick={handleGenerateVideo}
                    disabled={isGeneratingVideo}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-px"
                >
                    <SparklesIcon className="h-5 w-5" />
                    <span>Generate Video Summary</span>
                </button>
            ) : (
                 <button 
                    onClick={handleSelectKey}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                >
                    Select API Key to Generate Video
                </button>
            )}
        </header>

        {generationError && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4 text-center">
                <strong>Error:</strong> {generationError}
                 {!apiKeySelected && <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline ml-2">Check billing docs</a>}
            </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center">
           <Slide slideData={PITCH_DECK_DATA[currentSlide]} slideNumber={currentSlide + 1} />
        </div>

        <div className="flex justify-between items-center mt-4 sticky bottom-4">
            <button onClick={handlePrevSlide} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors backdrop-blur-sm">
                <ArrowLeftCircleIcon className="h-6 w-6" />
                <span>Prev</span>
            </button>
            <div className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-md backdrop-blur-sm">
                {currentSlide + 1} / {PITCH_DECK_DATA.length}
            </div>
            <button onClick={handleNextSlide} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors backdrop-blur-sm">
                <span>Next</span>
                <ArrowRightCircleIcon className="h-6 w-6" />
            </button>
        </div>

        {isGeneratingVideo && <LoadingModal status={generationStatus} />}
        {videoUrl && <VideoPlayerModal videoUrl={videoUrl} onClose={() => setVideoUrl(null)} />}
      </main>
    </div>
  );
};

export default App;
