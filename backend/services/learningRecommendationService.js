/**
 * Learning Recommendation Service
 * Curated internal resource database — no external API needed.
 * Maps skill slugs → learning resources with estimated improvement.
 */

const LEARNING_RESOURCES = {
    "spring-boot": {
        resources: [
            { title: "Spring Boot Fundamentals", type: "course", duration: "8 hours", level: "beginner", url: "#" },
            { title: "Building REST APIs with Spring Boot", type: "project", duration: "6 hours", level: "intermediate", url: "#" },
            { title: "Spring Boot + Microservices Architecture", type: "video", duration: "4 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 30,
        prerequisites: ["java"]
    },
    "java": {
        resources: [
            { title: "Core Java Programming", type: "course", duration: "12 hours", level: "beginner", url: "#" },
            { title: "Java OOP Deep Dive", type: "course", duration: "6 hours", level: "intermediate", url: "#" },
            { title: "Java Concurrency & Multithreading", type: "course", duration: "5 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 25,
        prerequisites: []
    },
    "python": {
        resources: [
            { title: "Python for Beginners", type: "course", duration: "10 hours", level: "beginner", url: "#" },
            { title: "Python OOP and Design Patterns", type: "course", duration: "6 hours", level: "intermediate", url: "#" },
            { title: "Python Performance & Advanced Features", type: "course", duration: "4 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 28,
        prerequisites: []
    },
    "react": {
        resources: [
            { title: "React Fundamentals", type: "course", duration: "8 hours", level: "beginner", url: "#" },
            { title: "React Hooks & State Management", type: "course", duration: "5 hours", level: "intermediate", url: "#" },
            { title: "Build a Full-Stack React App", type: "project", duration: "10 hours", level: "intermediate", url: "#" }
        ],
        estimatedImprovement: 25,
        prerequisites: ["javascript"]
    },
    "javascript": {
        resources: [
            { title: "JavaScript: The Complete Guide", type: "course", duration: "15 hours", level: "beginner", url: "#" },
            { title: "Async JavaScript & Promises", type: "course", duration: "4 hours", level: "intermediate", url: "#" },
            { title: "JavaScript Design Patterns", type: "course", duration: "5 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 30,
        prerequisites: []
    },
    "nodejs": {
        resources: [
            { title: "Node.js Crash Course", type: "video", duration: "3 hours", level: "beginner", url: "#" },
            { title: "Building REST APIs with Node.js & Express", type: "course", duration: "8 hours", level: "intermediate", url: "#" },
            { title: "Node.js Performance & Scalability", type: "course", duration: "5 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 28,
        prerequisites: ["javascript"]
    },
    "sql": {
        resources: [
            { title: "SQL Basics to Advanced", type: "course", duration: "6 hours", level: "beginner", url: "#" },
            { title: "SQL Query Optimization", type: "course", duration: "4 hours", level: "intermediate", url: "#" },
            { title: "Database Design & Normalization", type: "course", duration: "3 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 30,
        prerequisites: []
    },
    "system-design": {
        resources: [
            { title: "System Design Fundamentals", type: "course", duration: "8 hours", level: "beginner", url: "#" },
            { title: "Designing Data-Intensive Applications", type: "article", duration: "20 hours", level: "advanced", url: "#" },
            { title: "Practice: Design Twitter Clone", type: "project", duration: "4 hours", level: "intermediate", url: "#" }
        ],
        estimatedImprovement: 25,
        prerequisites: ["data-structures", "rest-apis"]
    },
    "data-structures": {
        resources: [
            { title: "Data Structures & Algorithms in Java", type: "course", duration: "12 hours", level: "beginner", url: "#" },
            { title: "LeetCode Top 100 Problems", type: "project", duration: "20 hours", level: "intermediate", url: "#" },
            { title: "Advanced DSA: Graphs & DP", type: "course", duration: "8 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 25,
        prerequisites: []
    },
    "aws": {
        resources: [
            { title: "AWS Cloud Practitioner", type: "course", duration: "12 hours", level: "beginner", url: "#" },
            { title: "AWS Solutions Architect Associate", type: "course", duration: "20 hours", level: "intermediate", url: "#" },
            { title: "AWS Lambda & Serverless", type: "course", duration: "5 hours", level: "intermediate", url: "#" }
        ],
        estimatedImprovement: 25,
        prerequisites: []
    },
    "docker": {
        resources: [
            { title: "Docker for Beginners", type: "video", duration: "3 hours", level: "beginner", url: "#" },
            { title: "Docker Compose & Multi-Container Apps", type: "course", duration: "4 hours", level: "intermediate", url: "#" },
            { title: "Docker in Production", type: "course", duration: "3 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 30,
        prerequisites: []
    },
    "kubernetes": {
        resources: [
            { title: "Kubernetes for Beginners", type: "course", duration: "6 hours", level: "beginner", url: "#" },
            { title: "K8s Deployments & Services", type: "course", duration: "5 hours", level: "intermediate", url: "#" },
            { title: "CKA Exam Prep", type: "course", duration: "15 hours", level: "advanced", url: "#" }
        ],
        estimatedImprovement: 25,
        prerequisites: ["docker"]
    },
    "machine-learning": {
        resources: [
            { title: "Machine Learning Fundamentals", type: "course", duration: "15 hours", level: "beginner", url: "#" },
            { title: "Scikit-learn in Practice", type: "course", duration: "8 hours", level: "intermediate", url: "#" },
            { title: "Build an ML Project End-to-End", type: "project", duration: "10 hours", level: "intermediate", url: "#" }
        ],
        estimatedImprovement: 25,
        prerequisites: ["python", "sql"]
    },
    "communication": {
        resources: [
            { title: "Technical Communication for Engineers", type: "course", duration: "4 hours", level: "beginner", url: "#" },
            { title: "Public Speaking & Presentations", type: "course", duration: "3 hours", level: "intermediate", url: "#" },
            { title: "Writing Technical Documentation", type: "course", duration: "2 hours", level: "beginner", url: "#" }
        ],
        estimatedImprovement: 20,
        prerequisites: []
    },
    "rest-apis": {
        resources: [
            { title: "RESTful API Design Best Practices", type: "course", duration: "4 hours", level: "beginner", url: "#" },
            { title: "API Security & Authentication", type: "course", duration: "3 hours", level: "intermediate", url: "#" },
            { title: "Build a Production REST API", type: "project", duration: "6 hours", level: "intermediate", url: "#" }
        ],
        estimatedImprovement: 30,
        prerequisites: ["javascript"]
    },
    "problem-solving": {
        resources: [
            { title: "Problem Solving with Data Structures", type: "course", duration: "8 hours", level: "beginner", url: "#" },
            { title: "Algorithm Design Manual", type: "article", duration: "15 hours", level: "advanced", url: "#" },
            { title: "Competitive Programming for Interviews", type: "course", duration: "12 hours", level: "intermediate", url: "#" }
        ],
        estimatedImprovement: 20,
        prerequisites: []
    }
};

// Default resources for unknown skills
const DEFAULT_RESOURCES = {
    resources: [
        { title: "Foundations Course", type: "course", duration: "6 hours", level: "beginner", url: "#" },
        { title: "Intermediate Practice", type: "course", duration: "4 hours", level: "intermediate", url: "#" },
        { title: "Build a Project", type: "project", duration: "8 hours", level: "intermediate", url: "#" }
    ],
    estimatedImprovement: 20,
    prerequisites: []
};

/**
 * Get learning recommendations for a list of skill gaps.
 * @param {Array} gaps - Array of { slug, skillName, current, required, gap }
 * @returns {Array} Enriched gaps with resources and improvement estimates
 */
function getRecommendationsForGaps(gaps) {
    return gaps.map(gap => {
        const entry = LEARNING_RESOURCES[gap.slug] || DEFAULT_RESOURCES;
        const estimatedNewLevel = Math.min(100, gap.current + entry.estimatedImprovement);

        return {
            ...gap,
            resources: entry.resources,
            estimatedNewLevel,
            estimatedMatchImprovement: Math.min(gap.required, estimatedNewLevel) - Math.min(gap.required, gap.current),
            prerequisites: entry.prerequisites || []
        };
    });
}

/**
 * Get top learning recommendations for a student.
 * Filters to skills with highest impact (largest gap × highest industry weight).
 */
function getTopRecommendations(gapAnalysis, limit = 5) {
    const prioritized = gapAnalysis
        .filter(g => g.status !== "met")
        .sort((a, b) => (b.gap * (b.weight || 1)) - (a.gap * (a.weight || 1)))
        .slice(0, limit);

    return getRecommendationsForGaps(prioritized);
}

/**
 * Get a general career learning path based on a target role.
 */
function getLearningPath(roleSlug) {
    const ROLE_PATHS = {
        "backend-developer": ["java", "spring-boot", "sql", "rest-apis", "docker"],
        "frontend-developer": ["javascript", "react", "html-css", "rest-apis"],
        "fullstack-developer": ["javascript", "react", "nodejs", "sql", "docker"],
        "data-scientist": ["python", "machine-learning", "sql", "problem-solving"],
        "devops-engineer": ["docker", "kubernetes", "aws", "cicd"],
        "ml-engineer": ["python", "machine-learning", "docker", "aws"]
    };

    const path = ROLE_PATHS[roleSlug] || ROLE_PATHS["fullstack-developer"];
    return path.map(slug => ({
        slug,
        skillName: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        resources: (LEARNING_RESOURCES[slug] || DEFAULT_RESOURCES).resources
    }));
}

module.exports = { getRecommendationsForGaps, getTopRecommendations, getLearningPath, LEARNING_RESOURCES };
