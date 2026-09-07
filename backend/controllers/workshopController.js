const Workshop = require("../models/Workshop");
const Notification = require("../models/Notification");
const { getIsConnected } = require("../config/db");

// ── GET /workshop ─────────────────────────────────────────────────────────
const listWorkshops = async (req, res) => {
    try {
        const { institution } = req.query;
        const { email: userEmail } = req.user;

        if (!getIsConnected()) {
            return res.json({ success: true, workshops: getDemoWorkshops() });
        }

        const filter = { isActive: true };
        if (institution) filter.institution = new RegExp(institution, "i");

        const workshops = await Workshop.find(filter).sort({ date: 1 });

        // Tag which ones user has registered for
        const enriched = workshops.map(w => ({
            ...w.toObject(),
            isRegistered: w.registrations.includes(userEmail),
            seatsLeft: w.seats - w.registrations.length
        }));

        res.json({ success: true, workshops: enriched });
    } catch (err) {
        console.error("listWorkshops error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── POST /workshop (faculty only) ─────────────────────────────────────────
const createWorkshop = async (req, res) => {
    try {
        const { email: createdBy, institution } = req.user;
        const { title, industry, topic, description, conductedBy, date, duration, seats, mode, registrationLink, tags } = req.body;

        if (!title) return res.status(400).json({ message: "Title is required" });

        if (!getIsConnected()) {
            return res.json({ success: true, workshop: { title, industry, topic, date, seats }, message: "Created (demo mode)" });
        }

        const workshop = new Workshop({
            title,
            industry: industry || "",
            topic: topic || "",
            description: description || "",
            conductedBy: conductedBy || "",
            date: date ? new Date(date) : null,
            duration: duration || "",
            seats: seats || 50,
            mode: mode || "online",
            registrationLink: registrationLink || "",
            tags: tags || [],
            createdBy,
            institution: institution || req.user?.institution || ""
        });

        await workshop.save();
        res.status(201).json({ success: true, workshop });
    } catch (err) {
        console.error("createWorkshop error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── POST /workshop/:id/register ───────────────────────────────────────────
const registerForWorkshop = async (req, res) => {
    try {
        const { id } = req.params;
        const { email: userEmail } = req.user;

        if (!getIsConnected()) {
            return res.json({ success: true, message: "Registered (demo mode)" });
        }

        const workshop = await Workshop.findById(id);
        if (!workshop) return res.status(404).json({ message: "Workshop not found" });

        if (workshop.registrations.includes(userEmail)) {
            return res.status(400).json({ message: "Already registered" });
        }

        if (workshop.registrations.length >= workshop.seats) {
            return res.status(400).json({ message: "Workshop is full" });
        }

        workshop.registrations.push(userEmail);
        await workshop.save();

        res.json({ success: true, message: "Registered successfully" });
    } catch (err) {
        console.error("registerForWorkshop error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── GET /notification ─────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
    try {
        const { email: userEmail } = req.user;

        if (!getIsConnected()) {
            return res.json({ success: true, notifications: getDemoNotifications() });
        }

        const notifications = await Notification.find({ userEmail })
            .sort({ createdAt: -1 })
            .limit(30);

        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.json({ success: true, notifications, unreadCount });
    } catch (err) {
        console.error("getNotifications error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── PUT /notification/read-all ────────────────────────────────────────────
const markAllRead = async (req, res) => {
    try {
        const { email: userEmail } = req.user;

        if (!getIsConnected()) {
            return res.json({ success: true });
        }

        await Notification.updateMany({ userEmail, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        console.error("markAllRead error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ── Helpers ───────────────────────────────────────────────────────────────
function getDemoWorkshops() {
    return [
        {
            _id: "w1", title: "AWS Cloud Fundamentals", industry: "AWS", topic: "Cloud Computing",
            description: "Learn the basics of AWS services including EC2, S3, Lambda, and RDS.", conductedBy: "AWS Solutions Architect",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), duration: "3 hours", seats: 100,
            mode: "online", tags: ["aws", "cloud-architecture"], isRegistered: false, seatsLeft: 67,
            institution: "Demo University"
        },
        {
            _id: "w2", title: "System Design Bootcamp", industry: "Google", topic: "System Design",
            description: "Deep dive into distributed systems, database design, and scalability patterns.", conductedBy: "Staff Engineer, Google",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), duration: "4 hours", seats: 50,
            mode: "online", tags: ["system-design", "distributed-systems"], isRegistered: false, seatsLeft: 23,
            institution: "Demo University"
        },
        {
            _id: "w3", title: "Spring Boot + Microservices", industry: "TCS", topic: "Backend Development",
            description: "Build production-ready REST APIs with Spring Boot and deploy as microservices.", conductedBy: "Sr. Developer, TCS",
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), duration: "5 hours", seats: 80,
            mode: "offline", tags: ["spring-boot", "microservices", "rest-apis"], isRegistered: false, seatsLeft: 40,
            institution: "Demo University"
        }
    ];
}

function getDemoNotifications() {
    return [
        {
            _id: "n1", type: "new_match", title: "New Job Match!", isRead: false,
            message: "Backend Developer at Google matches 89% of your skills.", link: "marketplace",
            createdAt: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
            _id: "n2", type: "application_update", title: "Application Update", isRead: false,
            message: "Your application to XYZ Corp has moved to Interview stage. 🎉", link: "applications",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
        },
        {
            _id: "n3", type: "assessment_done", title: "Skill Assessment Complete", isRead: true,
            message: "Your Software Engineering interview has been assessed. Java: 87%, DSA: 82%.", link: "skill",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
        },
        {
            _id: "n4", type: "workshop_open", title: "Workshop Open", isRead: true,
            message: "AWS Cloud Fundamentals workshop registration is now open! 67 seats left.", link: "academia",
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
        }
    ];
}

module.exports = { listWorkshops, createWorkshop, registerForWorkshop, getNotifications, markAllRead };
