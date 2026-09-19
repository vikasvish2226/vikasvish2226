import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableNumber: { type: Number, required: true },
  qrCode: { type: String, default: '' },
  status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
}, { timestamps: true });

const Table = mongoose.model('Table', tableSchema);

export default Table;
