import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, default: 'General' },
  image: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  available: { type: Boolean, default: true },
  popular: { type: Boolean, default: false },
}, { timestamps: true });

const Food = mongoose.model('Food', foodSchema);

export default Food;
