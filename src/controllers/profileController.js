import profileService from '../services/profileService.js';

const createProfile = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ status: "error", message: "Missing or empty name parameter" });
    }
    const result = await profileService.createOrGetProfile(name.trim());
    return res.status(result.exists ? 200 : 201).json({
      status: "success",
      message: result.exists ? "Profile already exists" : "Profile created",
      data: result.data
    });
  } catch (error) {
    console.error("Create Profile Error:", error);
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message || "Internal server error"
    });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await profileService.getProfileById(id);
    if (!profile) {
      return res.status(404).json({ status: "error", message: "Profile not found" });
    }
    res.json({ status: "success", data: profile });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message || "Internal server error"
    });
  }
};

const getAllProfiles = async (req, res) => {
  try {
    const filters = {
      gender: req.query.gender,
      age_group: req.query.age_group,
      country_id: req.query.country_id,
      min_age: req.query.min_age ? parseInt(req.query.min_age) : undefined,
      max_age: req.query.max_age ? parseInt(req.query.max_age) : undefined,
      min_gender_probability: req.query.min_gender_probability ? parseFloat(req.query.min_gender_probability) : undefined,
      min_country_probability: req.query.min_country_probability ? parseFloat(req.query.min_country_probability) : undefined
    };

    const sort_by = req.query.sort_by || 'created_at';
    const order = ['asc', 'desc'].includes(req.query.order) ? req.query.order : undefined;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    // Validate parameters
    const validSortFields = ['age', 'created_at', 'gender_probability'];
    if (!validSortFields.includes(sort_by)) {
      return res.status(400).json({ status: "error", message: "Invalid sort_by parameter" });
    }
    if (!order) {
      return res.status(400).json({ status: "error", message: "Invalid order parameter. Use asc or desc." });
    }
    if (page < 1) {
      return res.status(400).json({ status: "error", message: "Invalid pagination parameters" });
    }
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({ status: "error", message: "Limit must be 1-50" });
    }
    if (req.query.min_age && isNaN(parseInt(req.query.min_age))) {
      return res.status(400).json({ status: "error", message: "min_age must be a number" });
    }
    if (req.query.max_age && isNaN(parseInt(req.query.max_age))) {
      return res.status(400).json({ status: "error", message: "max_age must be a number" });
    }
    if (req.query.min_gender_probability && isNaN(parseFloat(req.query.min_gender_probability))) {
      return res.status(400).json({ status: "error", message: "min_gender_probability must be a number" });
    }
    if (req.query.min_country_probability && isNaN(parseFloat(req.query.min_country_probability))) {
      return res.status(400).json({ status: "error", message: "min_country_probability must be a number" });
    }
    if (filters.min_gender_probability && (filters.min_gender_probability < 0 || filters.min_gender_probability > 1)) {
      return res.status(400).json({ status: "error", message: "min_gender_probability must be between 0 and 1" });
    }
    if (filters.min_country_probability && (filters.min_country_probability < 0 || filters.min_country_probability > 1)) {
      return res.status(400).json({ status: "error", message: "min_country_probability must be between 0 and 1" });
    }

    limit = Math.min(limit, 50);
    const result = await profileService.getAllProfiles(filters, sort_by, order, page, limit);

    res.json({
      status: "success",
      page,
      limit,
      total: result.total,
      data: result.data
    });
  } catch (error) {
    console.error("Get All Profiles Error:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await profileService.deleteProfile(id);
    if (!result) {
      return res.status(404).json({ status: "error", message: "Profile not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Delete Profile Error:", error);
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message || "Internal server error"
    });
  }
};

const searchProfiles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(400).json({ status: "error", message: "Missing or empty query parameter" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    if (page < 1 || limit < 1) {
      return res.status(400).json({ status: "error", message: "Invalid pagination parameters" });
    }

    const result = await profileService.searchProfiles(q.trim(), page, limit);
    res.json({
      status: "success",
      page,
      limit,
      total: result.total,
      data: result.data
    });
  } catch (error) {
    if (error.message === 'Unable to interpret query') {
      return res.status(400).json({ status: "error", message: "Unable to interpret query" });
    }
    console.error("Search Profiles Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

export default { createProfile, getProfileById, getAllProfiles, deleteProfile, searchProfiles };