import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    mimetype: {
        type: String,
    },
    size: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
});

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
