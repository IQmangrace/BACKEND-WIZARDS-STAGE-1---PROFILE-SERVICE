import express from 'express';
import profileController from '../controllers/profileController.js';

const router = express.Router();

router.post('/profiles', profileController.createProfile);
router.get('/profiles/search', profileController.searchProfiles);
router.get('/profiles/:id', profileController.getProfileById);
router.get('/profiles', profileController.getAllProfiles);
router.delete('/profiles/:id', profileController.deleteProfile);

export default router;