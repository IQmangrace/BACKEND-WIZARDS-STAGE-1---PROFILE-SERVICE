import axios from 'axios';

export const fetchAllApis = async (name) => {
  try {
    const [genderData, ageData, nationalizeData] = await Promise.all([
      axios.get(`https://api.genderize.io?name=${encodeURIComponent(name)}`)
        .then(r => r.data),
      axios.get(`https://api.agify.io?name=${encodeURIComponent(name)}`)
        .then(r => r.data),
      axios.get(`https://api.nationalize.io?name=${encodeURIComponent(name)}`)
        .then(r => r.data)
    ]);
    return { genderData, ageData, nationalizeData };
  } catch (error) {
    console.error("External API Error:", error.message);
    const err = new Error("Failed to fetch data from external APIs");
    err.status = 502; // Add status code
    throw err;
  }
};

export default fetchAllApis;