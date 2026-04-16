import mongoose from 'mongoose';
const schema = new mongoose.Schema({});
export default mongoose.models.Intern || mongoose.model('Intern', schema);
