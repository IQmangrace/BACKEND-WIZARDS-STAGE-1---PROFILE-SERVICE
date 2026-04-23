import profileService from '../services/profileService.js';

const createProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or empty name parameter'
      });
    }

    if (typeof name !== 'string') {
      return res.status(422).json({
        status: 'error',
        message: 'Name must be a string'
      });
    }

    if (name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or empty name parameter'
      });
    }

    const result = await profileService.createOrGetProfile(name.trim());

    return res.status(result.exists ? 200 : 201).json({
      status: 'success',
      message: result.exists ? 'Profile already exists' : 'Profile created',
      data: result.data
    });
  } catch (error) {
    console.error('Create Profile Error:', error.message);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error'
    });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile ID is required'
      });
    }

    const profile = await profileService.getProfileById(id);
    return res.json({
      status: 'success',
      data: profile
    });
  } catch (error) {
    console.error('Get Profile Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    // Extract and parse filters
    const filters = {
      gender: req.query.gender,
      age_group: req.query.age_group,
      country_id: req.query.country_id ? req.query.country_id.toUpperCase() : undefined,
      min_age: req.query.min_age ? parseInt(req.query.min_age, 10) : undefined,
      max_age: req.query.max_age ? parseInt(req.query.max_age, 10) : undefined,
      min_gender_probability: req.query.min_gender_probability ? parseFloat(req.query.min_gender_probability) : undefined,
      min_country_probability: req.query.min_country_probability ? parseFloat(req.query.min_country_probability) : undefined
    };

    // Pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 50);

    // Sorting
    const sort_by = req.query.sort_by || 'created_at';

    // Validate order
    if (!['asc', 'desc'].includes(req.query.order)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid order parameter. Use asc or desc.'
      });
    }
    const order = req.query.order === 'asc' ? 1 : -1;

    // Validate sort_by
    const validSortFields = ['age', 'created_at', 'gender_probability'];
    if (!validSortFields.includes(sort_by)) {
      return res.status(400).json({ status: 'error', message: 'Invalid sort_by parameter' });
    }

    // Validate numeric filters
    if (req.query.min_age && isNaN(parseInt(req.query.min_age, 10))) {
      return res.status(400).json({ status: 'error', message: 'min_age must be a number' });
    }
    if (req.query.max_age && isNaN(parseInt(req.query.max_age, 10))) {
      return res.status(400).json({ status: 'error', message: 'max_age must be a number' });
    }
    if (req.query.min_gender_probability && isNaN(parseFloat(req.query.min_gender_probability))) {
      return res.status(400).json({ status: 'error', message: 'min_gender_probability must be a number' });
    }
    if (req.query.min_country_probability && isNaN(parseFloat(req.query.min_country_probability))) {
      return res.status(400).json({ status: 'error', message: 'min_country_probability must be a number' });
    }

    // Validate probability ranges
    if (filters.min_gender_probability !== undefined && (filters.min_gender_probability < 0 || filters.min_gender_probability > 1)) {
      return res.status(400).json({ status: 'error', message: 'min_gender_probability must be between 0 and 1' });
    }
    if (filters.min_country_probability !== undefined && (filters.min_country_probability < 0 || filters.min_country_probability > 1)) {
      return res.status(400).json({ status: 'error', message: 'min_country_probability must be between 0 and 1' });
    }

    const result = await profileService.getAllProfiles(filters, sort_by, order, page, limit);
    return res.json(result);
  } catch (error) {
    console.error('Get All Profiles Error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

const searchProfiles = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Query parameter "q" is required'
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 10), 50);

    const result = await profileService.searchProfiles(q.trim(), page, limit);
    return res.json(result);
  } catch (error) {
    console.error('Search Profiles Error:', error.message);

    // Handle parsing errors
    if (error.message === 'Unable to interpret query') {
      return res.status(400).json({
        status: 'error',
        message: 'Unable to interpret query'
      });
    }

    const status = error.status || 500;
    return res.status(status).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Profile identifier is required'
      });
    }

    await profileService.deleteProfile(id);
    return res.json({
      status: 'success',
      message: 'Profile deleted successfully'
    });
  } catch (error) {
    console.error('Delete Profile Error:', error.message);
    const status = error.status || 500;
    return res.status(status).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

export default {
  createProfile,
  getProfileById,
  getAllProfiles,
  searchProfiles,
  deleteProfile
};
