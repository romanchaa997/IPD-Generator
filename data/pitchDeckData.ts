import type { SlideData, TitleContent, TableContent, MarketContent } from '../types';

export const PITCH_DECK_DATA: SlideData[] = [
  {
    id: 1,
    title: 'Title Slide',
    layout: 'Title',
    content: {
      mainTitle: 'Unified Technology Ecosystem',
      subtitle: 'Future-Proof Infrastructure for Regulated Markets',
      tagline: 'AI LegalTech • Post-Quantum • Cybersecurity • Blockchain • Smart Textile',
      logo: 'Your company logo',
      footer: 'Investor Presentation | [Date] | Confidential',
    } as TitleContent,
    visualElements: ['Purple gradient background', 'Subtle tech icons (lock, blockchain, AI chip) as watermark'],
    speakerNotes: "Thank you for joining today. We're building the only integrated platform that solves the three defining challenges facing enterprises in 2025: regulatory complexity, quantum threats, and sustainability mandates. In the next 15 minutes, I'll show you why this is a $850B opportunity and why we're positioned to win.",
  },
  {
    id: 2,
    title: 'The Problem — Regulatory Tsunami',
    layout: 'Table with icons',
    content: {
      title: 'The Perfect Storm of 2025',
      table: {
        headers: ['Regulation', 'Impact', 'Deadline'],
        rows: [
          { icon: '🇪🇺', regulation: 'EU AI Act', impact: 'Mandatory transparency, €35M penalties', deadline: 'Aug 2025 (7 months)', highlight: true },
          { icon: '⚛️', regulation: 'Quantum Threat', impact: '"Harvest now, decrypt later" attacks', deadline: '2030-2035' },
          { icon: '🇺🇸', regulation: 'CMMC 2.0', impact: 'Mandatory for US defense contractors', deadline: '2026' },
          { icon: '📱', regulation: 'Digital Product Passport', impact: 'Required for all EU textiles', deadline: '2026' },
          { icon: '🛡️', regulation: 'NIS2 Directive', impact: '160,000+ entities must comply', deadline: 'Oct 2024 (already in force)' },
        ],
      },
    } as TableContent,
    visualElements: ['Icons for each regulation', 'Red highlight on deadlines', 'Arrow graphic showing "Urgency Increasing"'],
    speakerNotes: "Enterprises face a regulatory tsunami. The EU AI Act takes effect in 7 months — 6,000+ companies are unprepared. Quantum computers will break current encryption by 2035, putting trillions of dollars of data at risk. These aren't hypothetical — these are legally binding deadlines with massive penalties. This creates inelastic demand for our platform.",
  },
   {
    id: 3,
    title: 'Market Opportunity',
    layout: 'Large numbers with icons',
    content: {
      title: '$850B+ Total Addressable Market',
      grid: [
        { category: 'Cybersecurity', value: '$300B', cagr: '12%' },
        { category: 'Blockchain', value: '$100B', cagr: '68%' },
        { category: 'Smart Textiles', value: '$400B', cagr: '20%' },
        { category: 'LegalTech', value: '$50B', cagr: '18%' },
        { category: 'Post-Quantum', value: '$15B', cagr: '45%' },
        { category: 'Our Target', value: '$120B SAM', cagr: '$2.4B SOM' },
      ]
    } as MarketContent,
    visualElements: ['Large, bold numbers', 'Icons for each segment', 'Arrows showing growth rates'],
    speakerNotes: "We're addressing a $850 billion market across five technology sectors. Our serviceable addressable market is $120 billion — targeting 6,000 AI companies in the EU, 50,000 CMMC-required defense contractors in the US, and 5,000 luxury brands needing anti-counterfeit solutions. We aim to capture 2% of this market in 5 years, generating $2.4 billion in revenue by 2029."
  },
  // Add more slides here based on the OCR content...
  {
    id: 4,
    title: 'Customer Pain Points',
    layout: 'Three columns with icons',
    content: {
      title: "What Keeps Enterprise CXOs Awake at Night",
      columns: []
    },
    visualElements: ['Icons for each persona', 'Red X marks for pain points'],
    speakerNotes: "We've talked to 100+ enterprises. CISOs are terrified of quantum threats and vendor sprawl. General Counsels can't keep up with regulations. Supply Chain VPs have zero transparency. These aren't feature requests — these are existential business problems. And no single vendor solves all three."
  },
   {
    id: 5,
    title: 'Our Solution — Unified Platform',
    layout: 'Hexagon diagram with 6 modules',
    content: {
      title: "One Platform, Six Integrated Modules",
    },
    visualElements: ['Hexagon with connecting lines', 'Purple gradient for center', 'Icons for each module'],
    speakerNotes: "We don't sell point solutions. We're the operating system for regulated enterprises. Six integrated modules that share data and insights. When a customer uses our AI LegalTech, the cybersecurity module learns from compliance requirements. When they track products on blockchain, it feeds carbon accounting. This integration is our moat — competitors would take 5 years to replicate."
  }
];
