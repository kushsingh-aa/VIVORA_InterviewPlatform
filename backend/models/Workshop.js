const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema({
    title: { type: String, required: true },
    industry: { type: String, default: "" },    // e.g. "AWS", "Google"
    topic: { type: String, default: "" },
    description: { type: String, default: "" },
    conductedBy: { type: String, default: "" }, // Speaker / Trainer name
    date: { type: Date, default: null },
    duration: { type: String, default: "" },    // e.g. "2 hours"
    seats: { type: Number, default: 50 },
    mode: { type: String, enum: ["online", "offline", "hybrid"], default: "online" },
    registrationLink: { type: String, default: "" },
    registrations: [{ type: String }],         // array of userEmails
    tags: [{ type: String }],                  // skill slugs this covers
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: true }, // faculty email
    institution: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Workshop", workshopSchema);
