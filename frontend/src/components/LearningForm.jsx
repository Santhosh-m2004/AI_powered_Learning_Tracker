import { useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../api/axios.js';

const LearningForm = ({ onSuccess, initialData = {} }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    subject: initialData.subject || '',
    topic: initialData.topic || '',
    timeSpent: initialData.timeSpent || '',
    difficulty: initialData.difficulty || 'medium',
    notes: initialData.notes || '',
    tags: initialData.tags ? initialData.tags.join(', ') : ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parsedTime = parseInt(formData.timeSpent, 10);
      if (isNaN(parsedTime) || parsedTime <= 0) {
        toast.error("Time spent must be a positive number.");
        setLoading(false);
        return;
      }

      const dataToSend = {
        subject: formData.subject.trim(),
        topic: formData.topic.trim(),
        difficulty: formData.difficulty,
        notes: formData.notes.trim(),
        timeSpent: parsedTime,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      };

      if (initialData._id) {
        await API.put(`/learning/sessions/${initialData._id}`, dataToSend);
        toast.success('Session updated successfully');
      } else {
        await API.post('/learning/sessions', dataToSend);
        toast.success('Session added successfully');
      }

      // Reset only after success
      setFormData({
        subject: '',
        topic: '',
        timeSpent: '',
        difficulty: 'medium',
        notes: '',
        tags: ''
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject *</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Topic *</label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Time Spent (minutes) *
          </label>
          <input
            type="number"
            name="timeSpent"
            value={formData.timeSpent}
            onChange={handleChange}
            className="input-field"
            required
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="input-field"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="input-field"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="input-field h-32"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-6 py-2"
        >
          {loading
            ? 'Saving...'
            : initialData._id
            ? 'Update Session'
            : 'Add Session'}
        </button>
      </div>

    </form>
  );
};

export default LearningForm;
