import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/* ---------------------- REGISTER ---------------------- */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      streak: user.streak,
      token
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ------------------------ LOGIN ------------------------ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    /* ---------- STREAK LOGIC ---------- */
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActiveDate = user.streak.lastActive ? new Date(user.streak.lastActive) : null;
    
    if (lastActiveDate) {
      lastActiveDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.streak.current += 1;
      } else if (diffDays > 1) {
        user.streak.current = 1;
      }
      // If diffDays === 0, user already logged in today, keep streak as is
    } else {
      // First time login
      user.streak.current = 1;
    }

    user.streak.lastActive = today;
    user.streak.longest = Math.max(user.streak.longest, user.streak.current);
    await user.save();

    const token = generateToken(user._id);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      streak: user.streak,
      token
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ---------------------- GET PROFILE ---------------------- */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* --------------------- UPDATE PROFILE --------------------- */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = req.body.email;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    // Regenerate token after email/password change
    const token = generateToken(updatedUser._id);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      streak: updatedUser.streak,
      token
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ---------------------- LOGOUT ---------------------- */
export const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};