import express from 'express';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

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
    if (!user || !(await verifyPassword(password, user.password))) {
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
  let createdUser;
  let createdRestaurant;
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const confirmPassword = String(req.body?.confirmPassword || '');
    const restaurantName = String(req.body?.restaurantName || '').trim();
    const phone = String(req.body?.phone || '').trim();
    const address = String(req.body?.address || '').trim();
    const googleUid = String(req.body?.googleUid || '').trim();
    const role = req.body?.role || 'owner';

    if (!name || !email || !restaurantName || !phone || !address || (!password && !googleUid)) {
      return res.status(400).json({ message: 'Name, email, restaurant name, phone, address and password are required.' });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    createdUser = await User.create({
      name,
      email,
      password: password ? await hashPassword(password) : '',
      role,
      restaurantId: null,
      googleUid: googleUid || null,
      photoURL: req.body?.photoURL || '',
    });

    createdRestaurant = await Restaurant.create({
      name: restaurantName,
      phone,
      address,
      ownerId: createdUser._id,
    });

    createdUser.restaurantId = createdRestaurant._id;
    await createdUser.save();

    const safeUser = createdUser.toObject();
    delete safeUser.password;
    safeUser.id = safeUser._id.toString();
    delete safeUser._id;

    res.status(201).json({
      ...safeUser,
      restaurantId: createdRestaurant._id.toString(),
      restaurant: {
        id: createdRestaurant._id.toString(),
        name: createdRestaurant.name,
        phone: createdRestaurant.phone,
        address: createdRestaurant.address,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }
    if (createdRestaurant?._id) {
      await Restaurant.deleteOne({ _id: createdRestaurant._id }).catch((cleanupError) => {
        console.error('[POST /api/users] Restaurant cleanup failed after registration error:', cleanupError);
      });
    }
    if (createdUser?._id) {
      await User.deleteOne({ _id: createdUser._id }).catch((cleanupError) => {
        console.error('[POST /api/users] Cleanup failed after registration error:', cleanupError);
      });
    }
    console.error('[POST /api/users] Registration failed:', error);
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
