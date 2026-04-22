import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  gender_probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  age: {
    type: Number,
    required: true,
    min: 0
  },
  age_group: {
    type: String,
    enum: ['child', 'teenager', 'adult', 'senior'],
    required: true
  },
  country_id: {
    type: String,
    required: true,
    uppercase: true,
    minlength: 2,
    maxlength: 2,
    index: true
  },
  country_name: {
    type: String,
    required: true
  },
  country_probability: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false   // We control created_at manually
});

// Performance indexes (very important for filtering + sorting)
profileSchema.index({ gender: 1, age_group: 1, country_id: 1 });
profileSchema.index({ age: 1 });
profileSchema.index({ created_at: -1 });
profileSchema.index({ gender_probability: 1 });

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;