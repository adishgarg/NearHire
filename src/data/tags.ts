export const popularTags = [
  // Programming & Development
  'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python', 'java', 'php', 'html', 'css',
  'angular', 'vue', 'express', 'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'docker', 'kubernetes',
  'frontend', 'backend', 'fullstack', 'api', 'rest', 'graphql', 'microservices', 'mobile', 'ios', 'android',
  'flutter', 'react-native', 'swift', 'kotlin', 'unity', 'game-development', 'blockchain', 'web3', 'smart-contracts',
  
  // Design & Creative
  'ui-design', 'ux-design', 'web-design', 'graphic-design', 'logo-design', 'branding', 'illustration',
  'photoshop', 'figma', 'sketch', 'adobe-illustrator', 'after-effects', 'video-editing', 'animation',
  '3d-modeling', 'blender', 'maya', 'cinema4d', 'wireframing', 'prototyping', 'user-research',
  
  // Digital Marketing
  'seo', 'social-media', 'facebook-ads', 'google-ads', 'content-marketing', 'email-marketing',
  'influencer-marketing', 'ppc', 'analytics', 'conversion-optimization', 'copywriting', 'blog-writing',
  'digital-strategy', 'marketing-automation', 'lead-generation',
  
  // Business & Consulting
  'business-plan', 'market-research', 'financial-modeling', 'data-analysis', 'excel', 'powerpoint',
  'project-management', 'agile', 'scrum', 'consulting', 'strategy', 'operations', 'process-improvement',
  
  // Writing & Translation
  'content-writing', 'technical-writing', 'creative-writing', 'proofreading', 'editing', 'translation',
  'localization', 'spanish', 'french', 'german', 'chinese', 'japanese', 'arabic',
  
  // Video & Audio
  'video-production', 'video-editing', 'motion-graphics', 'audio-editing', 'podcast-editing',
  'voiceover', 'sound-design', 'music-production', 'jingle', 'commercial',
  
  // Data & AI
  'data-science', 'machine-learning', 'artificial-intelligence', 'data-visualization', 'python',
  'r-programming', 'sql', 'tableau', 'power-bi', 'statistics', 'deep-learning', 'nlp',
  
  // E-commerce & Sales
  'shopify', 'woocommerce', 'amazon', 'ebay', 'product-listing', 'inventory-management',
  'sales-funnel', 'conversion-rate-optimization', 'customer-service',
  
  // Education & Training
  'online-course', 'curriculum-development', 'instructional-design', 'training', 'tutoring',
  'educational-content', 'presentation', 'workshop',
];

export const categoryTags: Record<string, string[]> = {
  'programming-tech': [
    'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python', 'java', 'php',
    'frontend', 'backend', 'fullstack', 'api', 'mobile', 'web-development'
  ],
  'graphics-design': [
    'ui-design', 'ux-design', 'web-design', 'graphic-design', 'logo-design', 'branding',
    'photoshop', 'figma', 'illustration', 'animation'
  ],
  'digital-marketing': [
    'seo', 'social-media', 'facebook-ads', 'google-ads', 'content-marketing', 'email-marketing',
    'copywriting', 'analytics', 'ppc'
  ],
  'writing-translation': [
    'content-writing', 'technical-writing', 'creative-writing', 'proofreading', 'editing',
    'translation', 'copywriting', 'blog-writing'
  ],
  'video-animation': [
    'video-editing', 'motion-graphics', 'animation', 'after-effects', 'video-production',
    '3d-modeling', 'blender'
  ],
  'music-audio': [
    'audio-editing', 'music-production', 'voiceover', 'sound-design', 'podcast-editing',
    'jingle', 'commercial'
  ],
  'business': [
    'business-plan', 'market-research', 'data-analysis', 'consulting', 'project-management',
    'excel', 'powerpoint', 'strategy'
  ],
  'data': [
    'data-science', 'machine-learning', 'data-analysis', 'python', 'sql', 'tableau',
    'statistics', 'data-visualization'
  ]
};

export function getTagSuggestions(query: string, category?: string): string[] {
  const searchQuery = query.toLowerCase().trim();
  
  if (!searchQuery) {
    // Return category-specific tags if available, otherwise popular tags
    if (category && categoryTags[category]) {
      return categoryTags[category].slice(0, 10);
    }
    return popularTags.slice(0, 10);
  }
  
  // Filter all tags based on search query
  const relevantTags = category && categoryTags[category] ? categoryTags[category] : popularTags;
  
  return relevantTags
    .filter(tag => tag.includes(searchQuery))
    .slice(0, 8);
}