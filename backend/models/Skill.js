const mongoose = require("mongoose");

/**
 * Canonical Skill — reference taxonomy entry.
 * Seeded once from skillTaxonomy.js
 */
const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
        type: String,
        enum: ["technical", "cloud", "data", "product", "soft", "domain"],
        required: true
    },
    subcategory: { type: String, default: "" },
    aliases: [{ type: String }],
    // Demand score 0-100 based on current opportunity requirements
    industryDemandScore: { type: Number, default: 50, min: 0, max: 100 }
}, { timestamps: true });

skillSchema.index({ category: 1 });

module.exports = mongoose.model("Skill", skillSchema);
