// AI Review Sentiment Analyzer & Rating Summarizer Service
// Performs sentiment classification, theme extraction, and AI property summaries

const POSITIVE_KEYWORDS = [
  'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'clean', 'spacious', 
  'love', 'loved', 'beautiful', 'comfortable', 'quiet', 'friendly', 'helpful', 
  'perfect', 'best', 'superb', 'awesome', 'convenient', 'peaceful', 'spotless',
  'cozy', 'modern', 'well-maintained', 'highly recommend', 'enjoyed'
];

const NEGATIVE_KEYWORDS = [
  'bad', 'dirty', 'poor', 'terrible', 'horrible', 'noisy', 'small', 'cramped',
  'broken', 'smelly', 'rude', 'unhelpful', 'worst', 'uncomfortable', 'disappointed',
  'issue', 'problem', 'leak', 'drain', 'ac not working', 'cold', 'stark',
  'overpriced', 'avoid', 'filthy', 'dark', 'maintenance'
];

const THEME_DICTIONARY = {
  Location: ['location', 'near', 'close', 'beach', 'center', 'downtown', 'view', 'station', 'metro', 'bus', 'walk', 'neighborhood'],
  Cleanliness: ['clean', 'spotless', 'dirty', 'filthy', 'dust', 'smell', 'hygiene', 'neat', 'tidy'],
  HostService: ['host', 'owner', 'manager', 'service', 'responsive', 'friendly', 'helpful', 'rude', 'staff', 'check-in'],
  ValueForMoney: ['price', 'value', 'cheap', 'expensive', 'cost', 'worth', 'overpriced', 'budget', 'affordable'],
  Amenities: ['ac', 'wifi', 'bed', 'bathroom', 'kitchen', 'pool', 'parking', 'balcony', 'furniture', 'water', 'tv', 'elevator']
};

/**
 * Analyzes individual review comment for sentiment score and label
 */
export function analyzeSentiment(comment = '', rating = 5) {
  const text = (comment || '').toLowerCase();
  let score = 0;

  // Base rating weight
  if (rating >= 4) score += 2;
  else if (rating === 3) score += 0;
  else score -= 2;

  // Keyword sentiment scoring
  POSITIVE_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) score += 1.5;
  });

  NEGATIVE_KEYWORDS.forEach(kw => {
    if (text.includes(kw)) score -= 2;
  });

  let label = 'NEUTRAL';
  let emoji = '😐';
  let color = 'var(--accent-amber, #f59e0b)';
  let bg = 'rgba(245, 158, 11, 0.15)';
  let border = 'rgba(245, 158, 11, 0.3)';

  if (score >= 1.5 || (score >= 0 && rating >= 4)) {
    label = 'POSITIVE';
    emoji = '😊';
    color = 'var(--accent-emerald, #10b981)';
    bg = 'rgba(16, 185, 129, 0.15)';
    border = 'rgba(16, 185, 129, 0.3)';
  } else if (score <= -1 || rating <= 2) {
    label = 'NEGATIVE';
    emoji = '😟';
    color = 'var(--accent-rose, #f43f5e)';
    bg = 'rgba(244, 63, 94, 0.15)';
    border = 'rgba(244, 63, 94, 0.3)';
  }

  // Extract theme tags
  const themes = [];
  Object.entries(THEME_DICTIONARY).forEach(([theme, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      themes.push(theme);
    }
  });

  if (themes.length === 0) {
    if (rating >= 4) themes.push('OverallStay');
    else themes.push('GeneralFeedback');
  }

  return {
    label,
    emoji,
    score,
    color,
    bg,
    border,
    themes
  };
}

/**
 * Synthesizes overall AI Executive Summary for a list of property reviews
 */
export function generateAIPropertySummary(reviews = [], propertyTitle = 'this property') {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return {
      summary: `No tenant reviews recorded yet for ${propertyTitle}.`,
      positivityRate: 0,
      topThemes: [],
      recommendation: 'Awaiting initial guest feedback.'
    };
  }

  const analyzed = reviews.map(r => ({
    ...r,
    analysis: analyzeSentiment(r.comment, r.rating)
  }));

  const positiveCount = analyzed.filter(a => a.analysis.label === 'POSITIVE').length;
  const negativeCount = analyzed.filter(a => a.analysis.label === 'NEGATIVE').length;
  const total = analyzed.length;
  const positivityRate = Math.round((positiveCount / total) * 100);

  // Aggregate theme frequencies
  const themeCounts = {};
  analyzed.forEach(a => {
    a.analysis.themes.forEach(t => {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    });
  });

  const sortedThemes = Object.keys(themeCounts).sort((a, b) => themeCounts[b] - themeCounts[a]);
  const topThemes = sortedThemes.slice(0, 3);

  const avgRating = (analyzed.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / total).toFixed(1);

  let summaryText = '';
  let recommendation = '';

  if (positivityRate >= 80) {
    summaryText = `Highly praised by guests (Average ${avgRating}/5.0 stars). Guests frequently highlight excellent ${topThemes.join(' & ')}.`;
    recommendation = 'Top Performing Listing — High guest satisfaction.';
  } else if (positivityRate >= 50) {
    summaryText = `Generally positive overall (${positivityRate}% positive feedback). Guests appreciate ${topThemes[0] || 'the stay'}, but minor areas for touch-ups remain.`;
    recommendation = 'Good Performance — Minor amenity updates recommended.';
  } else {
    summaryText = `Requires attention (${negativeCount} critical feedback reviews). Main guest concerns revolve around ${topThemes.join(', ') || 'property condition'}.`;
    recommendation = 'Attention Required — Review guest complaints with owner.';
  }

  return {
    summary: summaryText,
    positivityRate,
    positiveCount,
    negativeCount,
    neutralCount: total - positiveCount - negativeCount,
    totalReviews: total,
    topThemes,
    recommendation,
    avgRating
  };
}

export default {
  analyzeSentiment,
  generateAIPropertySummary
};
