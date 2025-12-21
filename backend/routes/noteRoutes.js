import express from 'express';
import { 
  uploadNote, 
  createNote, 
  getNotes, 
  getNoteById, 
  updateNote, 
  deleteNote, 
  searchNotes 
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../controllers/noteController.js';

const router = express.Router();

router.post('/upload', protect, upload.single('file'), uploadNote);
router.route('/')
  .post(protect, createNote)
  .get(protect, getNotes);

router.get('/search', protect, searchNotes);
router.route('/:id')
  .get(protect, getNoteById)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

export default router;