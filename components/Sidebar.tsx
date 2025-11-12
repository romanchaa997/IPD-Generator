import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon, PresentationChartBarIcon } from './icons/HeroIcons';

interface SlideTitle {
  id: number;
  title: string;
  fullTitle: string;
}

interface SidebarProps {
  slides: SlideTitle[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ slides, currentSlideIndex, onSelectSlide }) => {
    const [isOpen, setIsOpen] = useState(false);

    const navContent = (
      <>
        <div className="px-4 py-6">
            <div className="flex items-center space-x-3">
                <PresentationChartBarIcon className="h-8 w-8 text-[#764ba2]"/>
                <h1 className="text-xl font-bold text-white font-poppins">Pitch Deck</h1>
            </div>
            <p className="text-sm text-gray-400 mt-1">Unified Technology Ecosystem</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {slides.map((slide) => (
            <a
              key={slide.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSelectSlide(slide.id);
                setIsOpen(false);
              }}
              className={`flex items-start rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                currentSlideIndex === slide.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className={`w-10 flex-shrink-0 font-bold ${currentSlideIndex === slide.id ? 'text-[#9476ea]' : 'text-gray-500'}`}>
                {`#${slide.id + 1}`}
              </span>
              <span>{slide.title}</span>
            </a>
          ))}
        </nav>
      </>
    );

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden fixed top-4 left-4 z-30">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md text-gray-400 bg-gray-800 hover:text-white hover:bg-gray-700">
                    {isOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>
            </div>
            
            {/* Mobile Sidebar (off-canvas) */}
            <div className={`fixed inset-0 z-20 flex md:hidden transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="w-64 flex-shrink-0 bg-gray-800 flex flex-col">
                    {navContent}
                </div>
                <div className="flex-1 bg-black/50" onClick={() => setIsOpen(false)}></div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
                <div className="flex flex-col flex-grow bg-gray-800 pt-5 overflow-y-auto">
                    {navContent}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
