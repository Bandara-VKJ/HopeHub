import mongoose, { Types } from 'mongoose'

const taskSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    counselorId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    date: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    family_status: {
        type: String,
        enum: ["pending_confirmation", "confirmed", "rejected"],
        default: "pending_confirmation"
    },
    completedAt: Date,
    confirmedAt: Date,
    confirmBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FamilyMember"
    },
    rejectionReason: String,

},
    { timestamps: true }
)

taskSchema.index({ userId: 1, date: 1 });

export default mongoose.model("Tasks", taskSchema);