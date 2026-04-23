import Profile from '../models/Profile.js';
import { parseNaturalLanguageQuery, getAgeGroup, getPrimaryCountry } from '../utils/helpers.js';
import { generateUUIDv7 } from '../utils/uuid.js';

class ProfileService {
  /**
   * Create or get existing profile
   */
  async createOrGetProfile(name) {
    const normalizedName = name.toLowerCase().trim();
    let profile = await Profile.findOne({ name: normalizedName });
    if (profile) {
      return { exists: true, data: this._formatProfile(profile) };
    }

    // Create new profile
    profile = new Profile({
id: generateUUIDv7(),
name: normalizedName,
gender: 'male', // or 'female'
gender_probability: 0.5,
age: 25,
age_group: 'adult',
country_id: 'NG',
country_name: 'Nigeria',
country_probability: 0.8,
created_at: new Date()
});
    await profile.save();
    return { exists: false, data: this._formatProfile(profile) };
  }

  // ... (rest of the code remains the same)
  /**
   * Get profile by ID or name
   */
  /**
 * Get all profiles with filters, sorting, and pagination
 */
async getAllProfiles(filters, sort_by = 'created_at', order = -1, page = 1, limit = 10) {
  try {
    // Build query
    const query = {};
    if (filters.gender) query.gender = filters.gender;
    if (filters.age_group) query.age_group = filters.age_group;
    if (filters.country_id) query.country_id = filters.country_id;

    // Age range filters
    if (filters.min_age !== undefined || filters.max_age !== undefined) {
      query.age = {};
      if (filters.min_age !== undefined) query.age.$gte = filters.min_age;
      if (filters.max_age !== undefined) query.age.$lte = filters.max_age;
    }

    // Probability filters
    if (filters.min_gender_probability !== undefined) {
      query.gender_probability = { $gte: filters.min_gender_probability };
    }
    if (filters.min_country_probability !== undefined) {
      query.country_probability = { $gte: filters.min_country_probability };
    }

    // Count total matching documents
    const total = await Profile.countDocuments(query);

    // Build sort object
    const sortObj = {};
    if (sort_by === 'age') {
      sortObj.age = order;
    } else if (sort_by === 'gender_probability') {
      sortObj.gender_probability = order;
    } else {
      sortObj.created_at = order; // Default to created_at
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const profiles = await Profile.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      status: 'success',
      page,
      limit,
      total,
      data: profiles.map(p => this._formatProfile(p))
    };
  } catch (error) {
    console.error('getAllProfiles error:', error);
    throw error;
  }
}
  /**
   * Search profiles using natural language parsing
   */
  async searchProfiles(query, page, limit) {
    // Parse natural language
    const parsed = parseNaturalLanguageQuery(query);

    // If parsing failed
    if (parsed.status === 'error') {
      const error = new Error(parsed.message);
      error.status = 400;
      throw error;
    }

    // Use parsed filters with getAllProfiles logic
    return this.getAllProfiles(parsed, 'created_at', -1, page, limit);
  }

  /**
   * Delete profile by ID or name
   */
  async deleteProfile(id) {
    let result = await Profile.findOneAndDelete({ id });

    if (!result) {
      result = await Profile.findOneAndDelete({ name: id.toLowerCase().trim() });
    }

    if (!result) {
      const error = new Error('Profile not found');
      error.status = 404;
      throw error;
    }

    return true;
  }

  /**
   * Format profile for response
   */
  _formatProfile(profile) {
    return {
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      gender_probability: profile.gender_probability,
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id,
      country_name: profile.country_name,
      country_probability: profile.country_probability,
      created_at: profile.created_at?.toISOString() || new Date().toISOString()
    };
  }
}

export default new ProfileService();
