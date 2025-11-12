import React from 'react';
import type { SlideData, TitleContent, TableContent, MarketContent } from '../types';
import { LockClosedIcon, CpuChipIcon, CubeTransparentIcon } from './icons/HeroIcons';

interface SlideProps {
  slideData: SlideData;
  slideNumber: number;
}

const Slide: React.FC<SlideProps> = ({ slideData, slideNumber }) => {
  const { title, layout, content, speakerNotes } = slideData;

  const renderContent = () => {
    switch (layout) {
      case 'Title':
        const titleContent = content as TitleContent;
        return (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-purple-gradient rounded-xl shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 opacity-10">
                <LockClosedIcon className="absolute h-24 w-24 top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 rotate-12" />
                <CpuChipIcon className="absolute h-32 w-32 bottom-1/4 right-1/4 transform translate-x-1/2 translate-y-1/2 -rotate-12" />
                <CubeTransparentIcon className="absolute h-20 w-20 top-1/2 right-1/3 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold font-montserrat text-white">{titleContent.mainTitle}</h1>
                <p className="mt-4 text-xl md:text-2xl text-purple-200">{titleContent.subtitle}</p>
                <p className="mt-8 text-sm md:text-base font-semibold tracking-widest text-white uppercase">{titleContent.tagline}</p>
            </div>
          </div>
        );

      case 'Table with icons':
        const tableContent = content as TableContent;
        return (
            <div className="w-full max-w-5xl p-6 bg-gray-800 rounded-lg">
                <h2 className="text-3xl font-bold mb-6 text-center font-poppins"><span className="mr-3">🌊</span>{tableContent.title}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto">
                        <thead>
                            <tr className="border-b-2 border-gray-600">
                                {tableContent.table.headers.map((header, i) => <th key={i} className="p-4 uppercase text-sm text-gray-400">{header}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {tableContent.table.rows.map((row, i) => (
                                <tr key={i} className="border-b border-gray-700">
                                    <td className="p-4 flex items-center gap-2 font-semibold"><span>{row.icon}</span> {row.regulation}</td>
                                    <td className="p-4 text-gray-300">{row.impact}</td>
                                    <td className={`p-4 font-bold ${row.highlight ? 'text-pink-400' : 'text-gray-300'}`}>{row.deadline}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
      
      case 'Large numbers with icons':
        const marketContent = content as MarketContent;
        return (
             <div className="w-full max-w-5xl p-6 bg-gray-800 rounded-lg">
                <h2 className="text-3xl font-bold mb-8 text-center font-poppins"><span className="mr-3">💰</span>{marketContent.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    {marketContent.grid.map((item, i) => (
                        <div key={i} className="bg-gray-700 p-6 rounded-lg">
                            <p className="text-sm text-gray-400 uppercase">{item.category}</p>
                            <p className="text-4xl font-bold my-2 brand-text-gradient">{item.value}</p>
                            <p className="font-semibold text-green-400">{item.cagr} CAGR</p>
                        </div>
                    ))}
                </div>
             </div>
        )

      default:
        return (
          <div className="w-full max-w-4xl p-8 bg-gray-800 rounded-lg">
            <h2 className="text-3xl font-bold mb-4 font-poppins">{title}</h2>
            <pre className="whitespace-pre-wrap text-gray-300">{JSON.stringify(content, null, 2)}</pre>
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 h-full">
        <div className="flex-grow aspect-[16/9] w-full max-w-6xl mx-auto bg-gray-900 rounded-xl shadow-lg flex flex-col items-center justify-center p-2">
            {renderContent()}
        </div>
        <div className="w-full max-w-6xl mx-auto bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="font-bold text-sm uppercase text-purple-400 mb-2">Speaker Notes</h3>
            <p className="text-gray-300 text-sm md:text-base">{speakerNotes}</p>
        </div>
    </div>
  );
};

export default Slide;
