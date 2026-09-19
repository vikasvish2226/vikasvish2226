import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'owner', 'admin'], default: 'customer' },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
  googleUid: { type: String, default: null },
  photoURL: { type: String, default: '' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
