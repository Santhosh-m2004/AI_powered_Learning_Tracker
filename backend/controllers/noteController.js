import Note from '../models/Note.js';
import GrokAIService from '../services/grokAIService.js';
import cloudinary from '../config/cloudinary.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'learning-tracker/notes',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'txt', 'doc', 'docx'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

export const upload = multer({ storage });

export const uploadNote = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { title, content, tags, subject } = req.body;

    let aiSummary = '';
    if (content && content.length > 50) {
      aiSummary = await GrokAIService.summarizeNotes(content);
    }

    const note = new Note({
      user: req.user._id,
      title,
      content,
      fileUrl: req.file.path,
      filePublicId: req.file.filename,
      fileType:
        req.file.mimetype.split('/')[0] === 'image'
          ? 'image'
          : req.file.mimetype === 'application/pdf'
          ? 'pdf'
          : 'other',
      aiSummary,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      subject,
      size: req.file.size
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, tags, subject } = req.body;

    let aiSummary = '';
    if (content && content.length > 50) {
      aiSummary = await GrokAIService.summarizeNotes(content);
    }

    const note = new Note({
      user: req.user._id,
      title,
      content,
      aiSummary,
      tags: tags || [],
      subject,
      fileType: 'text'
    });

    const savedNote = await note.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const { search, subject, tag, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (search) query.$text = { $search: search };
    if (subject) query.subject = new RegExp(subject, 'i');
    if (tag) query.tags = tag;

    const notes = await Note.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    res.json({
      notes,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    if (req.body.content && req.body.content !== note.content) {
      req.body.aiSummary = await GrokAIService.summarizeNotes(req.body.content);
    }

    Object.assign(note, req.body);
    const updatedNote = await note.save();

    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    if (note.filePublicId) {
      try {
        await cloudinary.uploader.destroy(note.filePublicId);
      } catch {}
    }

    await note.deleteOne();
    res.json({ message: 'Note removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const searchNotes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.status(400).json({ message: 'Search query required' });

    const notes = await Note.find(
      { user: req.user._id, $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    res.json(notes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
