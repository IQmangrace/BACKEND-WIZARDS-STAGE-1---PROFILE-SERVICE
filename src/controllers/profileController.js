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
      country_id: req.query.country_id,
      age_group: req.query.age_group
    };
    const result = await profileService.getAllProfiles(filters);
    res.json({ status: "success", count: result.count, data: result.data });
  } catch (error) {
    console.error("Get All Profiles Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    await profileService.deleteProfile(id);
    res.status(204).send();
  } catch (error) {
    console.error("Delete Profile Error:", error);
    return res.status(error.status || 500).json({
      status: "error",
      message: error.message || "Internal server error"
    });
  }
};

export default { createProfile, getProfileById, getAllProfiles, deleteProfile };