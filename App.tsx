import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Slide from './components/Slide';
import LoadingModal from './components/LoadingModal';
import VideoPlayerModal from './components/VideoPlayerModal';
import VideoConfigModal from './components/VideoConfigModal';
import { PITCH_DECK_DATA } from './data/pitchDeckData';
import { FilmIcon, DocumentPlusIcon } from './components/icons/HeroIcons';
import { GoogleGenAI } from '@google/genai';
import { SlideData } from './types';

function App() {
  const [slidesData, setSlidesData] = useState<SlideData[]>(PITCH_DECK_DATA);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [apiKeySelected, setApiKeySelected] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio && (await window.aistudio.hasSelectedApiKey())) {
        setApiKeySelected(true);
      }
    };
    checkApiKey();
  }, []);

  const slideTitles = useMemo(() => slidesData.map((s, index) => ({ id: index, title: s.title, fullTitle: s.title })), [slidesData]);

  const generateThumbnail = (videoSrc: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoSrc;

      video.onloadeddata = () => {
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg'));
      };

      video.onerror = (e) => {
        reject(new Error('Failed to load video for thumbnail generation'));
      };
    });
  };


  const handleGenerateVideo = async (config: { aspectRatio: '16:9' | '9:16'; resolution: '720p' | '1080p'; customTitle: string }) => {
    setIsConfigOpen(false);

    if (!apiKeySelected) {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        setApiKeySelected(true); // Assume success to avoid race condition
      } else {
        alert("API Key selection is not available.");
        return;
      }
    }

    setIsLoading(true);
    setProgress(0);
    setLoadingStatus('Initializing video generation...');

    let operation: any;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const prompt = `Generate a dynamic and engaging video pitch with the title "${config.customTitle}". 
      The video should be professional, targeting investors. 
      Use the speaker notes as a script for a voiceover.
      The tone should be confident and visionary.
      Animate the visual elements described for each slide.
      ---
      ${slidesData.map(slide => `
      Slide ${slide.id}: ${slide.title}
      Content: ${JSON.stringify(slide.content)}
      Speaker Notes: ${slide.speakerNotes}
      `).join('\n---\n')}
      `;
      
      setProgress(10);
      setLoadingStatus('Sending request to Gemini...');
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: config.resolution,
          aspectRatio: config.aspectRatio,
        }
      });
      
      setProgress(25);
      setLoadingStatus('Processing video... this may take several minutes.');
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      if (operation.error) {
        throw new Error(operation.error.message);
      }
      
      setProgress(75);
      setLoadingStatus('Finalizing video...');
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch video file. Status: ${response.status}`);
        }
        const videoBlob = await response.blob();
        const objectUrl = URL.createObjectURL(videoBlob);
        
        setProgress(90);
        setLoadingStatus('Generating thumbnail...');
        const thumbUrl = await generateThumbnail(objectUrl).catch(err => {
            console.warn("Could not generate thumbnail:", err);
            return null;
        });
        
        setProgress(100);
        setThumbnailUrl(thumbUrl);
        setVideoUrl(objectUrl);
      } else {
        throw new Error('Video generation failed to produce a download link.');
      }
    } catch (error: any) {
      console.error('Video generation failed:', error);
      let userMessage = `An unexpected error occurred: ${error.message}`;
      const errorMessage = error.message?.toLowerCase() || '';

      if (errorMessage.includes("api key not valid") || errorMessage.includes("api_key_invalid") || errorMessage.includes("requested entity was not found")) {
        userMessage = "Your API key seems to be invalid or missing. Please select a valid API key and try again.";
        setApiKeySelected(false);
      } else if (errorMessage.includes("billing") || errorMessage.includes("permission_denied")) {
        userMessage = "Video generation failed. Please ensure that billing is enabled for your project. You can find more information at ai.google.dev/gemini-api/docs/billing.";
      } else if (errorMessage.includes("quota") || errorMessage.includes("resource exhausted")) {
        userMessage = "You have exceeded your API quota. Please check your usage limits or try again later.";
      } else if (errorMessage.includes("failed to fetch")) {
        userMessage = "A network error occurred. Please check your internet connection and try again.";
      } else if (operation?.error) {
        userMessage = `The video generation service returned an error: ${operation.error.message}`;
      }
      
      alert(userMessage);

    } finally {
      setIsLoading(false);
      setLoadingStatus('');
      setProgress(0);
    }
  };

  const handleGenerateSpeakerNotes = async (slideIndex: number) => {
    if (!apiKeySelected) {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true);
        } else {
            alert("API Key selection is not available.");
            return;
        }
    }

    const slideToUpdate = slidesData[slideIndex];
    if (!slideToUpdate) return;
    
    // Set an initial "generating" state for the specific slide
    setSlidesData(currentSlides =>
      currentSlides.map((slide, index) =>
        index === slideIndex ? { ...slide, speakerNotes: 'Generating with AI...' } : slide
      )
    );

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `You are an expert pitch deck consultant. Based on the following slide content, write professional and engaging speaker notes for a presentation to investors. The notes should be concise, impactful, and explain the key takeaways of the slide.
        ---
        Slide Title: ${slideToUpdate.title}
        Slide Content: ${JSON.stringify(slideToUpdate.content)}
        ---
        Speaker Notes:`;

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-pro",
            contents: prompt,
        });

        // Clear notes for streaming
        setSlidesData(currentSlides =>
            currentSlides.map((slide, index) =>
                index === slideIndex ? { ...slide, speakerNotes: '' } : slide
            )
        );

        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            setSlidesData(currentSlides =>
                currentSlides.map((slide, index) =>
                    index === slideIndex
                        ? { ...slide, speakerNotes: slide.speakerNotes + chunkText }
                        : slide
                )
            );
        }
    } catch (error: any) {
        console.error("Failed to generate speaker notes:", error);
        alert(`Error generating speaker notes: ${error.message}`);
        // Revert to original notes on error
        setSlidesData(currentSlides =>
            currentSlides.map((slide, index) =>
                index === slideIndex ? { ...slide, speakerNotes: slideToUpdate.speakerNotes } : slide
            )
        );
    }
  };

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setApiKeySelected(true);
    }
  }

  const handleAddNewSlide = () => {
    const newSlideId = slidesData.length > 0 ? Math.max(...slidesData.map(s => s.id)) + 1 : 1;
    const newSlide: SlideData = {
      id: newSlideId,
      title: 'Untitled Slide',
      layout: 'Default',
      content: { message: 'This is a new slide. Add your content here.' },
      visualElements: [],
      speakerNotes: 'Start writing your speaker notes for this new slide.',
    };
    const newSlidesData = [...slidesData, newSlide];
    setSlidesData(newSlidesData);
    setCurrentSlideIndex(newSlidesData.length - 1);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex font-sans">
      <Sidebar slides={slideTitles} currentSlideIndex={currentSlideIndex} onSelectSlide={setCurrentSlideIndex} />
      <main className="flex-1 md:pl-64 p-4 md:p-8 flex flex-col items-center">
        <div className="w-full flex justify-end mb-4 space-x-4">
          <button
              onClick={handleAddNewSlide}
              className="bg-gray-700 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <DocumentPlusIcon className="h-5 w-5" />
              <span>Add New Slide</span>
          </button>
          <button
            onClick={() => {
              if (apiKeySelected) {
                setIsConfigOpen(true);
              } else {
                handleSelectApiKey();
              }
            }}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
          >
            <FilmIcon className="h-5 w-5" />
            <span>{apiKeySelected ? 'Generate Video' : 'Select API Key'}</span>
          </button>
        </div>
        <Slide 
          slideData={slidesData[currentSlideIndex]} 
          slideNumber={currentSlideIndex + 1}
          onGenerateNotes={() => handleGenerateSpeakerNotes(currentSlideIndex)}
        />
      </main>
      {isConfigOpen && <VideoConfigModal onClose={() => setIsConfigOpen(false)} onGenerate={handleGenerateVideo} />}
      {isLoading && <LoadingModal status={loadingStatus} progress={progress} />}
      {videoUrl && <VideoPlayerModal 
        videoUrl={videoUrl} 
        thumbnailUrl={thumbnailUrl}
        onClose={() => {
          URL.revokeObjectURL(videoUrl);
          if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
          setVideoUrl(null);
          setThumbnailUrl(null);
        }} 
      />}
    </div>
  );
}

export default App;