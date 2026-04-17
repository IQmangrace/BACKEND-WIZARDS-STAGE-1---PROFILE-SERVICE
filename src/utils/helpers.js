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
    return { country_id: null, country_probability: null };
  }

  const sorted = [...countries].sort((a, b) => b.probability - a.probability);
  
  return {
    country_id: sorted[0].country_id,
    country_probability: sorted[0].probability
  };
};
export default getPrimaryCountry;