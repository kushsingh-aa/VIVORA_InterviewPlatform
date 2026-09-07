/**
 * VIVORA SIH26044 — Database Seed Script
 * Run: node backend/scripts/seed.js
 * Seeds: Skill taxonomy + 15 demo opportunities
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const Skill = require("../models/Skill");
const Opportunity = require("../models/Opportunity");
const skillTaxonomy = require("../data/skillTaxonomy");

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/vivora";

const demoOpportunities = [
    {
        title: "Backend Engineering Intern",
        company: "Zepto",
        type: "internship",
        domain: "software",
        location: "Bangalore (Hybrid)",
        stipend: "₹25,000/month",
        duration: "3 months",
        description: "Work on high-throughput backend services for India's fastest grocery delivery platform. You'll design APIs, optimize queries, and contribute to real-time order management systems.",
        requiredSkills: [
            { skillSlug: "nodejs", skillName: "Node.js", minProficiency: 65, weight: 1.3 },
            { skillSlug: "rest-apis", skillName: "REST APIs", minProficiency: 70, weight: 1.2 },
            { skillSlug: "mongodb", skillName: "MongoDB", minProficiency: 55, weight: 1.0 },
            { skillSlug: "redis", skillName: "Redis", minProficiency: 45, weight: 0.9 },
            { skillSlug: "system-design", skillName: "System Design", minProficiency: 50, weight: 1.1 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 70, weight: 1.2 }
        ],
        eligibility: "B.Tech/B.E. 2nd or 3rd year students",
        isActive: true
    },
    {
        title: "Data Science Intern",
        company: "Razorpay",
        type: "internship",
        domain: "data",
        location: "Bangalore (Remote)",
        stipend: "₹30,000/month",
        duration: "6 months",
        description: "Join Razorpay's data science team to build ML models for fraud detection, payment success prediction, and merchant analytics at scale.",
        requiredSkills: [
            { skillSlug: "python", skillName: "Python", minProficiency: 70, weight: 1.4 },
            { skillSlug: "machine-learning", skillName: "Machine Learning", minProficiency: 65, weight: 1.4 },
            { skillSlug: "pandas", skillName: "Pandas", minProficiency: 65, weight: 1.2 },
            { skillSlug: "sql-analytics", skillName: "SQL Analytics", minProficiency: 60, weight: 1.1 },
            { skillSlug: "data-analysis", skillName: "Data Analysis", minProficiency: 65, weight: 1.2 },
            { skillSlug: "communication", skillName: "Communication", minProficiency: 60, weight: 1.0 }
        ],
        eligibility: "B.Tech/M.Tech CS, DS, or EE students",
        isActive: true
    },
    {
        title: "Full Stack Developer Intern",
        company: "Meesho",
        type: "internship",
        domain: "software",
        location: "Bangalore",
        stipend: "₹20,000/month",
        duration: "3 months",
        description: "Build and ship features on Meesho's reseller platform. Work across React frontend and Node.js microservices serving 150M+ users.",
        requiredSkills: [
            { skillSlug: "react", skillName: "React", minProficiency: 65, weight: 1.3 },
            { skillSlug: "javascript", skillName: "JavaScript", minProficiency: 70, weight: 1.3 },
            { skillSlug: "nodejs", skillName: "Node.js", minProficiency: 60, weight: 1.1 },
            { skillSlug: "rest-apis", skillName: "REST APIs", minProficiency: 65, weight: 1.2 },
            { skillSlug: "sql", skillName: "SQL", minProficiency: 55, weight: 1.0 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 65, weight: 1.2 }
        ],
        eligibility: "B.Tech CS or related, 2nd–4th year",
        isActive: true
    },
    {
        title: "Cloud & DevOps Intern",
        company: "CRED",
        type: "internship",
        domain: "software",
        location: "Bangalore (Hybrid)",
        stipend: "₹22,000/month",
        duration: "4 months",
        description: "Manage and scale CRED's cloud infrastructure on AWS. Work with Kubernetes, Terraform, and CI/CD pipelines for a FinTech platform.",
        requiredSkills: [
            { skillSlug: "aws", skillName: "AWS", minProficiency: 55, weight: 1.3 },
            { skillSlug: "docker", skillName: "Docker", minProficiency: 60, weight: 1.2 },
            { skillSlug: "kubernetes", skillName: "Kubernetes", minProficiency: 50, weight: 1.2 },
            { skillSlug: "cicd", skillName: "CI/CD", minProficiency: 55, weight: 1.1 },
            { skillSlug: "linux", skillName: "Linux", minProficiency: 60, weight: 1.1 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 65, weight: 1.0 }
        ],
        eligibility: "B.Tech CS/IT, 2nd–4th year",
        isActive: true
    },
    {
        title: "ML Engineer Intern",
        company: "Google India",
        type: "internship",
        domain: "data",
        location: "Hyderabad",
        stipend: "₹80,000/month",
        duration: "3 months",
        description: "Work on large-scale ML systems within Google's AI/ML division. Projects range from NLP model fine-tuning to production deployment pipelines.",
        requiredSkills: [
            { skillSlug: "python", skillName: "Python", minProficiency: 80, weight: 1.5 },
            { skillSlug: "machine-learning", skillName: "Machine Learning", minProficiency: 75, weight: 1.5 },
            { skillSlug: "deep-learning", skillName: "Deep Learning", minProficiency: 65, weight: 1.3 },
            { skillSlug: "tensorflow", skillName: "TensorFlow", minProficiency: 60, weight: 1.1 },
            { skillSlug: "data-structures", skillName: "Data Structures", minProficiency: 75, weight: 1.3 },
            { skillSlug: "algorithms", skillName: "Algorithms", minProficiency: 75, weight: 1.3 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 80, weight: 1.4 }
        ],
        eligibility: "Top-tier B.Tech/M.Tech students, CGPA ≥ 8.0",
        isActive: true
    },
    {
        title: "Product Management Intern",
        company: "Swiggy",
        type: "internship",
        domain: "product",
        location: "Bangalore",
        stipend: "₹35,000/month",
        duration: "3 months",
        description: "Drive product strategy for Swiggy's restaurant discovery and loyalty features. You'll run experiments, analyze metrics, and ship features to millions of users.",
        requiredSkills: [
            { skillSlug: "product-strategy", skillName: "Product Strategy", minProficiency: 65, weight: 1.4 },
            { skillSlug: "product-metrics", skillName: "Product Metrics", minProficiency: 60, weight: 1.3 },
            { skillSlug: "user-research", skillName: "User Research", minProficiency: 55, weight: 1.2 },
            { skillSlug: "agile", skillName: "Agile/Scrum", minProficiency: 55, weight: 1.0 },
            { skillSlug: "communication", skillName: "Communication", minProficiency: 75, weight: 1.4 },
            { skillSlug: "structured-thinking", skillName: "Structured Thinking", minProficiency: 65, weight: 1.3 }
        ],
        eligibility: "MBA / B.Tech with PM interest, 2nd year+",
        isActive: true
    },
    {
        title: "Software Engineering Intern",
        company: "Microsoft India",
        type: "internship",
        domain: "software",
        location: "Hyderabad",
        stipend: "₹60,000/month",
        duration: "2 months",
        description: "Contribute to Azure, Office 365, or GitHub teams on real production features. Solve distributed systems challenges at Microsoft scale.",
        requiredSkills: [
            { skillSlug: "data-structures", skillName: "Data Structures", minProficiency: 75, weight: 1.3 },
            { skillSlug: "algorithms", skillName: "Algorithms", minProficiency: 75, weight: 1.3 },
            { skillSlug: "system-design", skillName: "System Design", minProficiency: 60, weight: 1.2 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 80, weight: 1.4 },
            { skillSlug: "communication", skillName: "Communication", minProficiency: 65, weight: 1.1 }
        ],
        eligibility: "B.Tech CS/IT, CGPA ≥ 7.5",
        isActive: true
    },
    {
        title: "Frontend Developer Intern",
        company: "Urban Company",
        type: "internship",
        domain: "software",
        location: "Gurugram (Hybrid)",
        stipend: "₹18,000/month",
        duration: "3 months",
        description: "Build beautiful, performant UI for Urban Company's consumer and professional apps using React and TypeScript.",
        requiredSkills: [
            { skillSlug: "react", skillName: "React", minProficiency: 65, weight: 1.3 },
            { skillSlug: "javascript", skillName: "JavaScript", minProficiency: 70, weight: 1.3 },
            { skillSlug: "typescript", skillName: "TypeScript", minProficiency: 55, weight: 1.1 },
            { skillSlug: "html-css", skillName: "HTML/CSS", minProficiency: 70, weight: 1.2 },
            { skillSlug: "communication", skillName: "Communication", minProficiency: 60, weight: 1.0 }
        ],
        eligibility: "B.Tech CS or equivalent, 2nd–4th year",
        isActive: true
    },
    {
        title: "Backend SDE (Full-Time)",
        company: "Juspay",
        type: "full_time",
        domain: "software",
        location: "Bangalore",
        stipend: "₹18–24 LPA",
        duration: "",
        description: "Build the payment orchestration infrastructure that powers transactions for Amazon, Ola, Zomato. Work with Haskell, Go, and Postgres at scale.",
        requiredSkills: [
            { skillSlug: "distributed-systems", skillName: "Distributed Systems", minProficiency: 70, weight: 1.4 },
            { skillSlug: "system-design", skillName: "System Design", minProficiency: 75, weight: 1.4 },
            { skillSlug: "postgresql", skillName: "PostgreSQL", minProficiency: 65, weight: 1.2 },
            { skillSlug: "algorithms", skillName: "Algorithms", minProficiency: 75, weight: 1.3 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 80, weight: 1.4 },
            { skillSlug: "communication", skillName: "Communication", minProficiency: 65, weight: 1.0 }
        ],
        eligibility: "B.Tech CS, 0-2 YOE",
        isActive: true
    },
    {
        title: "Data Engineering Intern",
        company: "Flipkart",
        type: "internship",
        domain: "data",
        location: "Bangalore",
        stipend: "₹40,000/month",
        duration: "6 months",
        description: "Build data pipelines, ETL workflows, and real-time streaming systems that process Flipkart's commerce data at petabyte scale.",
        requiredSkills: [
            { skillSlug: "python", skillName: "Python", minProficiency: 70, weight: 1.3 },
            { skillSlug: "data-engineering", skillName: "Data Engineering", minProficiency: 60, weight: 1.4 },
            { skillSlug: "sql", skillName: "SQL", minProficiency: 70, weight: 1.2 },
            { skillSlug: "aws", skillName: "AWS", minProficiency: 50, weight: 1.0 },
            { skillSlug: "message-queues", skillName: "Kafka/Message Queues", minProficiency: 50, weight: 1.1 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 65, weight: 1.1 }
        ],
        eligibility: "B.Tech CS/DS, 2nd–4th year",
        isActive: true
    },
    {
        title: "SDE-1 (Full-Time)",
        company: "PhonePe",
        type: "full_time",
        domain: "software",
        location: "Bangalore",
        stipend: "₹15–20 LPA",
        duration: "",
        description: "Join India's #1 UPI payment platform. Build reliable, fault-tolerant financial systems used by 500M+ users.",
        requiredSkills: [
            { skillSlug: "java", skillName: "Java", minProficiency: 70, weight: 1.3 },
            { skillSlug: "spring-boot", skillName: "Spring Boot", minProficiency: 60, weight: 1.2 },
            { skillSlug: "system-design", skillName: "System Design", minProficiency: 65, weight: 1.3 },
            { skillSlug: "microservices", skillName: "Microservices", minProficiency: 60, weight: 1.2 },
            { skillSlug: "data-structures", skillName: "Data Structures", minProficiency: 75, weight: 1.3 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 75, weight: 1.3 }
        ],
        eligibility: "B.Tech CS, fresh graduate to 1 YOE",
        isActive: true
    },
    {
        title: "NLP Research Intern",
        company: "Sarvam AI",
        type: "internship",
        domain: "data",
        location: "Bangalore / Remote",
        stipend: "₹50,000/month",
        duration: "4 months",
        description: "Work on Indic language AI models — training, fine-tuning, and evaluation of LLMs for Hindi, Tamil, Bengali, and 10 other Indian languages.",
        requiredSkills: [
            { skillSlug: "python", skillName: "Python", minProficiency: 75, weight: 1.4 },
            { skillSlug: "nlp", skillName: "NLP", minProficiency: 70, weight: 1.5 },
            { skillSlug: "deep-learning", skillName: "Deep Learning", minProficiency: 65, weight: 1.3 },
            { skillSlug: "pytorch", skillName: "PyTorch", minProficiency: 60, weight: 1.2 },
            { skillSlug: "machine-learning", skillName: "Machine Learning", minProficiency: 65, weight: 1.2 },
            { skillSlug: "communication", skillName: "Communication", minProficiency: 65, weight: 1.0 }
        ],
        eligibility: "B.Tech/M.Tech CS, specialization in AI/ML preferred",
        isActive: true
    },
    {
        title: "Security Engineering Intern",
        company: "Zerodha",
        type: "internship",
        domain: "software",
        location: "Bangalore",
        stipend: "₹25,000/month",
        duration: "3 months",
        description: "Harden Zerodha's trading platform against threats. Work on AppSec, pen testing, threat modelling, and security engineering for a SEBI-regulated platform.",
        requiredSkills: [
            { skillSlug: "security", skillName: "Security Engineering", minProficiency: 55, weight: 1.4 },
            { skillSlug: "linux", skillName: "Linux", minProficiency: 65, weight: 1.2 },
            { skillSlug: "python", skillName: "Python", minProficiency: 60, weight: 1.1 },
            { skillSlug: "rest-apis", skillName: "REST APIs", minProficiency: 60, weight: 1.0 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 65, weight: 1.1 }
        ],
        eligibility: "B.Tech CS/IT with security interest",
        isActive: true
    },
    {
        title: "Product Analytics Intern",
        company: "Groww",
        type: "internship",
        domain: "data",
        location: "Bangalore",
        stipend: "₹28,000/month",
        duration: "3 months",
        description: "Drive data-led decisions at India's leading investment platform. Build dashboards, run A/B tests, and identify growth levers through user behaviour analysis.",
        requiredSkills: [
            { skillSlug: "sql-analytics", skillName: "SQL Analytics", minProficiency: 70, weight: 1.3 },
            { skillSlug: "data-analysis", skillName: "Data Analysis", minProficiency: 65, weight: 1.3 },
            { skillSlug: "product-metrics", skillName: "Product Metrics", minProficiency: 60, weight: 1.2 },
            { skillSlug: "ab-testing", skillName: "A/B Testing", minProficiency: 55, weight: 1.1 },
            { skillSlug: "communication", skillName: "Communication", minProficiency: 65, weight: 1.1 },
            { skillSlug: "structured-thinking", skillName: "Structured Thinking", minProficiency: 60, weight: 1.2 }
        ],
        eligibility: "B.Tech or MBA, 2nd year+",
        isActive: true
    },
    {
        title: "Mobile (Flutter) Developer Intern",
        company: "Navi",
        type: "internship",
        domain: "software",
        location: "Bangalore",
        stipend: "₹20,000/month",
        duration: "3 months",
        description: "Build Navi's consumer fintech app in Flutter. Work on new lending, insurance, and investment features used by millions of Indian users.",
        requiredSkills: [
            { skillSlug: "mobile", skillName: "Mobile Development", minProficiency: 55, weight: 1.3 },
            { skillSlug: "dart", skillName: "Dart / Flutter", minProficiency: 50, weight: 1.3 },
            { skillSlug: "rest-apis", skillName: "REST APIs", minProficiency: 60, weight: 1.1 },
            { skillSlug: "problem-solving", skillName: "Problem Solving", minProficiency: 60, weight: 1.1 },
            { skillSlug: "communication", skillName: "Communication", minProficiency: 55, weight: 1.0 }
        ],
        eligibility: "B.Tech CS/IT, 2nd–4th year",
        isActive: true
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Connected to MongoDB:", MONGO_URI);

        // Seed Skills
        console.log("🌱 Seeding skill taxonomy...");
        let skillCount = 0;
        for (const s of skillTaxonomy) {
            await Skill.findOneAndUpdate(
                { slug: s.slug },
                { $set: s },
                { upsert: true, new: true }
            );
            skillCount++;
        }
        console.log(`✅ Seeded ${skillCount} skills`);

        // Seed Opportunities
        console.log("🌱 Seeding demo opportunities...");
        let oppCount = 0;
        for (const opp of demoOpportunities) {
            const existing = await Opportunity.findOne({ title: opp.title, company: opp.company });
            if (!existing) {
                await Opportunity.create(opp);
                oppCount++;
            }
        }
        console.log(`✅ Seeded ${oppCount} new opportunities (${demoOpportunities.length - oppCount} already existed)`);

        console.log("\n🎉 Seed complete! VIVORA SIH26044 is ready.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed failed:", err.message);
        process.exit(1);
    }
}

seed();
