import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/* ---------------------- REGISTER ---------------------- */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    /* ---------- FIXED STREAK LOGIC ---------- */
    const today = new Date();
    const lastActiveDate = user.streak.lastActive ? new Date(user.streak.lastActive) : null;

    if (!lastActiveDate) {
      user.streak.current = 1;
    } else {
      const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        user.streak.current += 1;
      } else if (diffDays > 1) {
        user.streak.current = 1;
      }
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
    user.email = req.body.email || user.email;

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
