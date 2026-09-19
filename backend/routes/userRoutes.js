import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch users' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const safeUser = user.toObject();
    delete safeUser.password;
    safeUser.id = safeUser._id.toString();
    delete safeUser._id;

    res.json(safeUser);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to login user' });
  }
});

router.post('/', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const role = req.body?.role || 'owner';

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const createdUser = await User.create({
      name,
      email,
      password,
      role,
      restaurantId: req.body?.restaurantId || null,
      googleUid: req.body?.googleUid || null,
      photoURL: req.body?.photoURL || '',
    });

    const safeUser = createdUser.toObject();
    delete safeUser.password;
    safeUser.id = safeUser._id.toString();
    delete safeUser._id;

    res.status(201).json(safeUser);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to create user' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch user' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to update user' });
  }
});

export default router;
