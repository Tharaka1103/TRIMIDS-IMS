import mongoose from 'mongoose';
const schema = new mongoose.Schema({});
export default mongoose.models.Settings || mongoose.model('Settings', schema);
