import React from 'react';
import type { SlideData, TitleContent, TableContent, MarketContent } from '../types';

interface SlideProps {
  slideData: SlideData;
  slideNumber: number;
  onGenerateNotes?: (slideId: number, slideContent: string) => void; // Optional for preview
}

const TitleLayout: React.FC<{ content: TitleContent }> = ({ content }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-white p-8">
    <h1 className="text-5xl md:text-7xl font-bold font-poppins bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">{content.mainTitle}</h1>
    <h2 className="mt-4 text-2xl md:text-3xl text-gray-300">{content.subtitle}</h2>
    <p className="mt-6 text-lg text-purple-300 tracking-widest">{content.tagline}</p>
    <div className="absolute bottom-8 text-sm text-gray-500">{content.footer}</div>
  </div>
);

const TableLayout: React.FC<{ content: TableContent }> = ({ content }) => (
  <div className="p-8 md:p-12 text-white h-full flex flex-col">
    <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-8">{content.title}</h2>
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-gray-600">
                    <th className="p-4 text-sm font-semibold uppercase text-gray-400"></th>
                    {content.table.headers.map((header, index) => (
                        <th key={index} className="p-4 text-sm font-semibold uppercase text-gray-400">{header}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {content.table.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className={`border-b border-gray-700 ${row.highlight ? 'bg-purple-900/30' : ''}`}>
                        <td className="p-4 text-2xl">{row.icon}</td>
                        <td className="p-4">{row.regulation}</td>
                        <td className="p-4">{row.impact}</td>
                        <td className={`p-4 font-bold ${row.highlight ? 'text-red-400' : ''}`}>{row.deadline}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  </div>
);

const MarketLayout: React.FC<{ content: MarketContent }> = ({ content }) => (
    <div className="p-8 md:p-12 text-white h-full flex flex-col">
      <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-8 text-center">{content.title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow">
        {content.grid.map((item, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg text-center flex flex-col justify-center items-center border border-gray-700">
            <p className="text-lg text-gray-400">{item.category}</p>
            <p className="text-4xl font-bold text-purple-400 my-2">{item.value}</p>
            <p className="text-md text-green-400">CAGR {item.cagr}</p>
          </div>
        ))}
      </div>
    </div>
);

const DefaultLayout: React.FC<{ content: any, title: string }> = ({ content, title }) => (
    <div className="p-8 md:p-12 text-white h-full flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">{title}</h2>
        <p className="text-gray-400">Layout not implemented yet.</p>
        <pre className="mt-4 text-xs bg-gray-900 p-4 rounded-md w-full overflow-auto">
            {JSON.stringify(content, null, 2)}
        </pre>
    </div>
);

const Slide: React.FC<SlideProps> = ({ slideData, slideNumber }) => {
  const renderLayout = () => {
    switch (slideData.layout) {
      case 'Title':
        return <TitleLayout content={slideData.content} />;
      case 'Table with icons':
        return <TableLayout content={slideData.content} />;
      case 'Large numbers with icons':
        return <MarketLayout content={slideData.content} />;
      case 'Three columns with icons':
      case 'Hexagon diagram with 6 modules':
      default:
        return <DefaultLayout title={slideData.content.title || slideData.title} content={slideData.content} />;
    }
  };

  return (
    <div className="w-full aspect-video bg-gray-900 rounded-lg shadow-2xl relative overflow-hidden border border-gray-700">
      {renderLayout()}
      <div className="absolute bottom-4 right-6 text-sm font-bold text-gray-600">
        {slideNumber}
      </div>
    </div>
  );
};

export default Slide;
