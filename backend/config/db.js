const mongoose = require("mongoose");

let isMongoConnected = false;

// Resilient in-memory fallback store for offline/unconfigured environments
const inMemoryStore = {
    users: new Map(),
    interviews: new Map(),
    chats: []
};

/**
 * Connects to MongoDB Atlas / local MongoDB cluster
 */
async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri || mongoUri.includes("<db_username>")) {
        console.log("ℹ️ MONGODB_URI is not fully configured or contains placeholders in .env. Running with resilient in-memory store.");
        isMongoConnected = false;
        return;
    }

    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        });

        isMongoConnected = true;
        console.log("🍃 MongoDB Atlas Connected Successfully!");
    } catch (err) {
        console.warn(`⚠️ MongoDB Connection Error: ${err.message}. Falling back to resilient in-memory store.`);
        isMongoConnected = false;
    }
}

mongoose.connection.on("connected", () => {
    isMongoConnected = true;
});

mongoose.connection.on("error", (err) => {
    console.warn("MongoDB connection runtime error:", err.message);
    isMongoConnected = false;
});

mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected.");
    isMongoConnected = false;
});

module.exports = {
    connectDB,
    getIsConnected: () => isMongoConnected,
    inMemoryStore
};