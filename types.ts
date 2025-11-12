export interface SlideData {
  id: number;
  title: string;
  layout: string;
  content: any; // Using 'any' for flexibility, specific layouts will have their own types
  visualElements: string[];
  speakerNotes: string;
}

export interface TitleContent {
  mainTitle: string;
  subtitle: string;
  tagline: string;
  logo: string;
  footer: string;
}

export interface Regulation {
  icon: string;
  regulation: string;
  impact: string;
  deadline: string;
  highlight?: boolean;
}

export interface TableContent {
  title: string;
  table: {
    headers: string[];
    rows: Regulation[];
  };
}

export interface MarketGridItem {
  category: string;
  value: string;
  cagr: string;
}

export interface MarketContent {
  title: string;
  grid: MarketGridItem[];
}
