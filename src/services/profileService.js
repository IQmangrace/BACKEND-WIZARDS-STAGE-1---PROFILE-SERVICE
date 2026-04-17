import Profile from '../models/Profile.js';
import { fetchAllApis } from './externalApiService.js';
import { getAgeGroup, getPrimaryCountry } from '../utils/helpers.js';
import { generateUUIDv7 } from '../utils/uuid.js';

const cleanProfile = (profile) => {
  const p = profile.toObject ? profile.toObject() : profile;
  return {
    id: p.id,
    name: p.name,
    gender: p.gender,
    gender_probability: p.gender_probability ? Number(p.gender_probability.toFixed(2)) : null,
    sample_size: p.sample_size,
    age: p.age,
    age_group: p.age_group,
    country_id: p.country_id,
    country_probability: p.country_probability ? Number(p.country_probability.toFixed(2)) : null,
    created_at: p.created_at || p.createdAt
  };
};

const createOrGetProfile = async (name) => {
  const normalizedName = name.toLowerCase().trim();

  if (
    !/^[A-Za-z]{2,}(?: [A-Za-z]{2,})*$/.test(normalizedName) || 
    /[aeiou]{3,}|[^aeiou]{4,}|([a-z])\2{2,}|^[a-z]{6,}$/i.test(normalizedName)
  ) {
    const err = new Error("Invalid name format");
    err.status = 400;
    throw err;
  }

  const existing = await Profile.findOne({ name: normalizedName });
  if (existing) {
    return { exists: true, data: cleanProfile(existing) };
  }

  const { genderData, ageData, nationalizeData } = await fetchAllApis(normalizedName);

  // Updated checks
  if (!genderData.gender || genderData.count < 5) {
    const err = new Error("Insufficient gender data");
    err.status = 400;
    throw err;
  }
  if (ageData.age == null || ageData.count < 5) {
    const err = new Error("Insufficient age data");
    err.status = 400;
    throw err;
  }
  if (!nationalizeData.country || nationalizeData.country.length === 0) {
    const err = new Error("Insufficient country data");
    err.status = 400;
    throw err;
  }

  const primaryCountry = getPrimaryCountry(nationalizeData.country);
  const profileData = {
    id: generateUUIDv7(),
    name: normalizedName,
    gender: genderData.gender,
    gender_probability: genderData.probability,
    sample_size: genderData.count,
    age: ageData.age,
    age_group: getAgeGroup(ageData.age),
    country_id: primaryCountry.country_id,
    country_probability: primaryCountry.country_probability,
    created_at: new Date()
  };

  const newProfile = await Profile.create(profileData);
  return { exists: false, data: cleanProfile(newProfile) };
};
const getProfileById = async (id) => {
  const profile = await Profile.findOne({ id });
  if (!profile) {
    const err = new Error("Profile not found");
    err.status = 404;
    throw err;
  }
  return cleanProfile(profile);
};

const getAllProfiles = async (filters = {}) => {
  const query = {};
  if (filters.gender) { query.gender = new RegExp(`^${filters.gender}$`, "i"); }
  if (filters.country_id) { query.country_id = new RegExp(`^${filters.country_id}$`, "i"); }
  if (filters.age_group) { query.age_group = new RegExp(`^${filters.age_group}$`, "i"); }

  const profiles = await Profile.find(query)
    .select('id name gender age age_group country_id createdAt')
    .lean()
    .sort({ createdAt: -1 });

  const formatted = profiles.map(p => {
    p.created_at = p.createdAt;
    delete p.createdAt;
    delete p._id;
    delete p.updatedAt;
    delete p.__v;
    return p;
  });

  return { count: formatted.length, data: formatted };
};

const deleteProfile = async (identifier) => {
  let query = {};
  if (identifier.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    query = { id: identifier }; // UUID
  } else {
    query = { name: identifier.toLowerCase().trim() };
  }

  const result = await Profile.findOneAndDelete(query);
  if (!result) {
    const err = new Error("Profile not found");
    err.status = 404;
    throw err;
  }
  return true;
};

export default {
  createOrGetProfile,
  getProfileById,
  getAllProfiles,
  deleteProfile
};