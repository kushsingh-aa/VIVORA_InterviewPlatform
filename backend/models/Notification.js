const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.Mixed, required: true, index: true },
    userEmail: { type: String, required: true, index: true },
    type: {
        type: String,
        enum: [
            "new_match",        // New job/internship matching skills
            "application_update", // Application status changed
            "shortlisted",      // Recruiter shortlisted you
            "interview",        // Interview scheduled
            "course_recommended", // New course recommendation
            "assessment_done",  // Skill assessment completed
            "workshop_open",    // Workshop registration open
            "system"            // General system notification
        ],
        default: "system"
    },
    title: { type: String, required: true },
    message: { type: String, default: "" },
    link: { type: String, default: "" },       // Frontend view to navigate to
    isRead: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed, default: null } // Extra payload
}, { timestamps: true });

notificationSchema.index({ userEmail: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
