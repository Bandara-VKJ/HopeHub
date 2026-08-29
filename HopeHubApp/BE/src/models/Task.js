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
        enum: ["pending", "completed", "expired"],
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

taskSchema.statics.expireOverdueTasks = async function () {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await this.updateMany(
        {
            createdAt: { $lt: twentyFourHoursAgo },
            $or: [
                { status: "pending" },                      
                { family_status: "pending_confirmation" }     
            ],
            status: { $ne: "expired" }                       
        },
        {
            $set: { status: "expired" }
        }
    );

    return result;
};

export default mongoose.model("Tasks", taskSchema);