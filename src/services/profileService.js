import Profile from '../models/Profile.js';
import { fetchAllApis } from './externalApiService.js';
import { parseNaturalLanguageQuery } from '../utils/helpers.js';
import { generateUUIDv7 } from '../utils/uuid.js';

const cleanProfile = (profile) => {
  const p = profile.toObject ? profile.toObject() : profile;
  return {
    id: p.id,
    name: p.name,
    gender: p.gender,
    gender_probability: p.gender_probability ? Number(p.gender_probability.toFixed(2)) : null,
    age: p.age,
    age_group: p.age_group,
    country_id: p.country_id,
    country_name: p.country_name,
    country_probability: p.country_probability ? Number(p.country_probability.toFixed(2)) : null,
    created_at: p.created_at || p.createdAt
  };
};

const createOrGetProfile = async (name) => {
  const normalizedName = name.toLowerCase().trim();

  // Simple and safe name validation
if (!name || typeof name !== 'string' || name.trim() === '') {
  const err = new Error("Missing or empty name parameter");
  err.status = 400;
  throw err;
}

if (normalizedName.length < 2) {
  const err = new Error("Name must be at least 2 characters long");
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
    age: ageData.age,
    age_group: getAgeGroup(ageData.age),
    country_id: primaryCountry.country_id,
    country_name: primaryCountry.country_name,
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

const getAllProfiles = async (filters = {}, sort_by = 'created_at', order = -1, page = 1, limit = 10) => {
  const query = {};

  // Build query filters
  if (filters.gender) { query.gender = new RegExp(`^${filters.gender}$`, "i"); }
  if (filters.age_group) { query.age_group = new RegExp(`^${filters.age_group}$`, "i"); }
  if (filters.country_id) { query.country_id = new RegExp(`^${filters.country_id}$`, "i"); }
  if (filters.min_age !== undefined) { query.age = { ...query.age, $gte: filters.min_age }; }
  if (filters.max_age !== undefined) { query.age = { ...query.age, $lte: filters.max_age }; }
  if (filters.min_gender_probability !== undefined) { query.gender_probability = { ...query.gender_probability, $gte: filters.min_gender_probability }; }
  if (filters.min_country_probability !== undefined) { query.country_probability = { ...query.country_probability, $gte: filters.min_country_probability }; }

  const sort = {};
  sort[sort_by] = order;

  const skip = (page - 1) * limit;

  const total = await Profile.countDocuments(query);
  const profiles = await Profile.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const formatted = profiles.map(p => {
    p.created_at = p.createdAt;
    delete p.createdAt;
    delete p._id;
    delete p.updatedAt;
    delete p.__v;
    return p;
  });

  return { total, data: formatted };
};

const searchProfiles = async (query, page = 1, limit = 10) => {
  const filters = parseNaturalLanguageQuery(query);
  return await getAllProfiles(filters, 'created_at', -1, page, limit);
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
  searchProfiles,
  deleteProfile
};

