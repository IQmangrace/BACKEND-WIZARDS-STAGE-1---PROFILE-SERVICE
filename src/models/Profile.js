import mongoose from 'mongoose';


const profileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  gender: String,
  gender_probability: Number,
  sample_size: Number,
  age: Number,
  age_group: {
    type: String,
    enum: ['child', 'teenager', 'adult', 'senior']
  },
  country_id: String,
  country_probability: Number
}, {
  timestamps: true  // ✅ Adds createdAt & updatedAt automatically
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;