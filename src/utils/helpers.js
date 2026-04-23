const countryNames = {
  'nigeria': 'NG',
  'ghana': 'GH',
  'kenya': 'KE',
  'uganda': 'UG',
  'south africa': 'ZA',
  'egypt': 'EG',
  'tanzania': 'TZ',
  'cameroon': 'CM',
  'ethiopia': 'ET',
  'senegal': 'SN',
  'côte d\'ivoire': 'CI',
  'benin': 'BJ',
  'congo': 'CD',
  'sudan': 'SD',
  'niger': 'NE',
  'mali': 'ML',
  'burundi': 'BI',
  'rwanda': 'RW',
  'zambia': 'ZM',
  'zimbabwe': 'ZW',
  'botswana': 'BW',
  'namibia': 'NA',
  'mozambique': 'MZ',
  'malawi': 'MW',
  'lesotho': 'LS',
  'madagascar': 'MG',
  'mauritius': 'MU',
  'cape verde': 'CV',
  'gambia': 'GM',
  'guinea': 'GN',
  'sierra leone': 'SL',
  'liberia': 'LR',
  'togo': 'TG',
  'angola': 'AO',
  'united states': 'US',
  'united kingdom': 'GB',
  'canada': 'CA',
  'india': 'IN',
  'australia': 'AU',
  'china': 'CN',
  'japan': 'JP',
  'germany': 'DE',
  'france': 'FR',
  'brazil': 'BR',
  'mexico': 'MX',
  'pakistan': 'PK',
  'bangladesh': 'BD',
  'philippines': 'PH',
  'indonesia': 'ID',
  'thailand': 'TH',
  'vietnam': 'VN',
  'south korea': 'KR',
  'spain': 'ES',
  'italy': 'IT',
  'netherlands': 'NL',
  'belgium': 'BE',
  'switzerland': 'CH',
  'sweden': 'SE',
  'norway': 'NO',
  'denmark': 'DK',
  'finland': 'FI',
  'russia': 'RU',
  'poland': 'PL',
  'greece': 'GR',
  'turkey': 'TR',
  'israel': 'IL',
  'saudi arabia': 'SA',
  'united arab emirates': 'AE',
  'hong kong': 'HK',
  'singapore': 'SG',
  'malaysia': 'MY',
  'new zealand': 'NZ'
};

/**
 * Parse natural language queries into filter objects
 * Examples:
 *   "young males from nigeria" → { gender: 'male', min_age: 16, max_age: 24, country_id: 'NG' }
 *   "females above 30" → { gender: 'female', min_age: 30 }
 *   "adult males from kenya" → { gender: 'male', age_group: 'adult', country_id: 'KE' }
 */
export const parseNaturalLanguageQuery = (query) => {
  if (!query || typeof query !== 'string' || query.trim() === '') {
    return { status: 'error', message: 'Unable to interpret query' };
  }

  const words = query.toLowerCase().trim().split(/\s+/);
  const filters = {};
  let i = 0;

  while (i < words.length) {
    const word = words[i];

    // Gender
    if (word === 'male' || word === 'males') {
      filters.gender = 'male';
    } else if (word === 'female' || word === 'females') {
      filters.gender = 'female';
    }
    // Age group
    else if (word === 'child' || word === 'children') {
      filters.age_group = 'child';
    } else if (word === 'teenager' || word === 'teenagers') {
      filters.age_group = 'teenager';
    } else if (word === 'adult' || word === 'adults') {
      filters.age_group = 'adult';
    } else if (word === 'senior' || word === 'seniors') {
      filters.age_group = 'senior';
    }
    // Special case: "young" maps to ages 16-24
    else if (word === 'young') {
      filters.min_age = 16;
      filters.max_age = 24;
    }
    // Age comparisons: "above", "over"
    else if ((word === 'above' || word === 'over') && i + 1 < words.length) {
      const ageStr = words[i + 1];
      const age = parseInt(ageStr, 10);
      if (!isNaN(age) && age >= 0) {
        filters.min_age = age;
        i++;
      } else {
        return { status: 'error', message: 'Unable to interpret query' };
      }
    }
    // Age comparisons: "below", "under"
    else if ((word === 'below' || word === 'under') && i + 1 < words.length) {
      const ageStr = words[i + 1];
      const age = parseInt(ageStr, 10);
      if (!isNaN(age) && age >= 0) {
        filters.max_age = age;
        i++;
      } else {
        return { status: 'error', message: 'Unable to interpret query' };
      }
    }
    // Country: "from" or "in"
    else if ((word === 'from' || word === 'in') && i + 1 < words.length) {
      // Look ahead for country name (could be multiple words)
      let countryName = '';
      let j = i + 1;

      // Collect words until we hit a keyword
      const keywords = ['male', 'males', 'female', 'females', 'young', 'above', 'over', 'below', 'under', 'adult', 'adults', 'child', 'children', 'teenager', 'teenagers', 'senior', 'seniors', 'and'];
      
      while (j < words.length && !keywords.includes(words[j])) {
        countryName += (countryName ? ' ' : '') + words[j];
        j++;
      }

      countryName = countryName.trim();
      const countryCode = countryNames[countryName];

      if (!countryCode) {
        return { status: 'error', message: 'Unable to interpret query' };
      }

      filters.country_id = countryCode;
      i = j - 1;
    }
    // Ignore "and"
    else if (word === 'and') {
      // Skip
    }
    // Unknown word
    else {
      return { status: 'error', message: 'Unable to interpret query' };
    }

    i++;
  }

  // If no filters were parsed, it's an error
  if (Object.keys(filters).length === 0) {
    return { status: 'error', message: 'Unable to interpret query' };
  }

  return filters;
};

/**
 * Get age group based on age
 */
export const getAgeGroup = (age) => {
  if (age === null || age === undefined || isNaN(age)) {
    return null;
  }
  if (age >= 0 && age <= 12) return 'child';
  if (age >= 13 && age <= 19) return 'teenager';
  if (age >= 20 && age <= 59) return 'adult';
  if (age >= 60) return 'senior';
  return null;
};

/**
 * Get primary country from array of countries
 */
export const getPrimaryCountry = (countries) => {
  if (!countries || countries.length === 0) {
    return { country_id: null, country_name: null, country_probability: null };
  }
  const sorted = [...countries].sort((a, b) => b.probability - a.probability);
  const primary = sorted[0];
  return {
    country_id: primary.country_id,
    country_name: Object.keys(countryNames).find(key => countryNames[key] === primary.country_id),
    country_probability: primary.probability
  };
};

export default { parseNaturalLanguageQuery, getAgeGroup, getPrimaryCountry };
