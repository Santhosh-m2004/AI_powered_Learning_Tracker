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

    // Check if user already exists with this email
    const userExists = await User.findOne({ email });
    if (userExists) {
      // If user exists but uses Google OAuth
      if (userExists.provider === 'google') {
        return res.status(400).json({ 
          message: 'This email is already registered with Google. Please login with Google instead.' 
        });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ 
      name, 
      email, 
      password,
      provider: 'local' 
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      provider: user.provider,
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

    // Check if user uses Google OAuth
    if (user.provider === 'google') {
      return res.status(400).json({ 
        message: 'This account uses Google login. Please login with Google instead.' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    // Update streak logic
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
      avatar: user.avatar,
      provider: user.provider,
      streak: user.streak,
      token
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ---------------------- GOOGLE OAUTH ---------------------- */
export const googleAuth = async (req, res) => {
  try {
    const { id, email, name, picture } = req.body;

    if (!id || !email || !name) {
      return res.status(400).json({ message: 'Invalid Google auth data' });
    }

    // Check if user exists with this email
    let user = await User.findOne({ email });

    if (user) {
      // If user exists with local auth, merge accounts
      if (user.provider === 'local') {
        // Update user to also have Google OAuth
        user.googleId = id;
        if (picture && !user.avatar) {
          user.avatar = picture;
        }
        user.provider = 'google'; // Switch to Google OAuth
      } else if (user.provider === 'google') {
        // Already a Google user, update info if needed
        if (!user.googleId) user.googleId = id;
        if (picture && !user.avatar) user.avatar = picture;
      }
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId: id,
        avatar: picture,
        provider: 'google'
      });
    }

    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActiveDate = user.streak.lastActive ? new Date(user.streak.lastActive) : null;
    
    if (!lastActiveDate) {
      user.streak.current = 1;
    } else {
      lastActiveDate.setHours(0, 0, 0, 0);
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
      avatar: user.avatar,
      provider: user.provider,
      streak: user.streak,
      token
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

/* ---------------------- GET PROFILE ---------------------- */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -googleId');
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

    if (req.body.password && user.provider === 'local') {
      user.password = req.body.password;
    }

    if (req.body.avatar) {
      user.avatar = req.body.avatar;
    }

    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
    }

    const updatedUser = await user.save();

    // Regenerate token after email/password change
    const token = generateToken(updatedUser._id);

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      provider: updatedUser.provider,
      streak: updatedUser.streak,
      bio: updatedUser.bio,
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