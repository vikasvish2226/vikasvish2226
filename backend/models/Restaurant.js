import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  description: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  openingHours: { type: String, default: '10:00 - 22:00' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
}, { timestamps: true });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
