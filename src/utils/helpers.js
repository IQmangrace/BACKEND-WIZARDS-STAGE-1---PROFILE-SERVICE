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
  'Turkey': 'TR',
  'israel': 'IL',
  'saudi arabia': 'SA',
  'united arab emirates': 'AE',
  'hong kong': 'HK',
  'singapore': 'SG',
  'malaysia': 'MY',
  'new zealand': 'NZ'
};
export const parseNaturalLanguageQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return { status: "error", message: "Unable to interpret query" };
  }

  const words = query.toLowerCase().trim().split(/\s+/);
  const filters = {};
  let i = 0;

  while (i < words.length) {
    const word = words[i];

    if (word === 'male' || word === 'males') {
      filters.gender = 'male';
    } else if (word === 'female' || word === 'females') {
      filters.gender = 'female';
    } else if (['child', 'children', 'teenager', 'teenagers', 'adult', 'adults', 'senior', 'seniors'].includes(word)) {
      filters.age_group = word;
    } else if (word === 'young') {
      filters.min_age = 16;
      filters.max_age = 24;
    } else if ((word === 'above' || word === 'over') && i + 1 < words.length) {
      const age = parseInt(words[i + 1]);
      if (!isNaN(age)) {
        filters.min_age = age;
        i++;
      }
    } else if ((word === 'below' || word === 'under') && i + 1 < words.length) {
      const age = parseInt(words[i + 1]);
      if (!isNaN(age)) {
        filters.max_age = age;
        i++;
      }
    } else if (word === 'from' && i + 1 < words.length) {
      let countryName = '';
      let j = i + 1;
      while (j < words.length && !['male', 'female', 'young', 'above', 'below'].includes(words[j])) {
        countryName += words[j] + ' ';
        j++;
      }
      countryName = countryName.trim();
      const countryId = Object.keys(countryNames).find(key => key === countryName);
      if (countryId) {
        filters.country_id = countryNames[countryId];
        i = j - 1;
      } else {
        return { status: "error", message: "Unable to interpret query" };
      }
    } else if (word === 'and') {
      // skip
    } else {
      return { status: "error", message: "Unable to interpret query" };
    }
    i++;
  }

  if (Object.keys(filters).length === 0) {
    return { status: "error", message: "Unable to interpret query" };
  }

  return filters;
};
export const getAgeGroup = (age) => {
  if (age === null || age === undefined || isNaN(age)) {
    return null;
  }
  if (age >= 0 && age <= 12) return "child";
  if (age >= 13 && age <= 19) return "teenager";
  if (age >= 20 && age <= 59) return "adult";
  if (age >= 60) return "senior";
  return null;
};

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

export default getPrimaryCountry;