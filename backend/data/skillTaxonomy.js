/**
 * VIVORA Skill Taxonomy — ~150 curated skills across domains
 * Used to seed the Skill collection and drive gap analysis / matching.
 */
const skillTaxonomy = [
    // ── TECHNICAL: Languages ───────────────────────────────
    { name: "JavaScript", slug: "javascript", category: "technical", subcategory: "languages", aliases: ["JS", "ES6", "ECMAScript"], industryDemandScore: 95 },
    { name: "TypeScript", slug: "typescript", category: "technical", subcategory: "languages", aliases: ["TS"], industryDemandScore: 88 },
    { name: "Python", slug: "python", category: "technical", subcategory: "languages", aliases: ["py"], industryDemandScore: 92 },
    { name: "Java", slug: "java", category: "technical", subcategory: "languages", aliases: ["JDK", "JVM"], industryDemandScore: 82 },
    { name: "C++", slug: "cpp", category: "technical", subcategory: "languages", aliases: ["C Plus Plus"], industryDemandScore: 70 },
    { name: "Go", slug: "go", category: "technical", subcategory: "languages", aliases: ["Golang"], industryDemandScore: 78 },
    { name: "Rust", slug: "rust", category: "technical", subcategory: "languages", aliases: [], industryDemandScore: 65 },
    { name: "C#", slug: "csharp", category: "technical", subcategory: "languages", aliases: ["CSharp", ".NET"], industryDemandScore: 72 },
    { name: "SQL", slug: "sql", category: "technical", subcategory: "languages", aliases: ["Structured Query Language"], industryDemandScore: 90 },

    // ── TECHNICAL: Frontend ────────────────────────────────
    { name: "React", slug: "react", category: "technical", subcategory: "frontend", aliases: ["React.js", "ReactJS"], industryDemandScore: 93 },
    { name: "Vue.js", slug: "vuejs", category: "technical", subcategory: "frontend", aliases: ["Vue"], industryDemandScore: 72 },
    { name: "Angular", slug: "angular", category: "technical", subcategory: "frontend", aliases: ["AngularJS"], industryDemandScore: 68 },
    { name: "Next.js", slug: "nextjs", category: "technical", subcategory: "frontend", aliases: ["Next"], industryDemandScore: 85 },
    { name: "HTML/CSS", slug: "html-css", category: "technical", subcategory: "frontend", aliases: ["HTML5", "CSS3"], industryDemandScore: 80 },
    { name: "Tailwind CSS", slug: "tailwind", category: "technical", subcategory: "frontend", aliases: ["TailwindCSS"], industryDemandScore: 78 },

    // ── TECHNICAL: Backend & APIs ─────────────────────────
    { name: "Node.js", slug: "nodejs", category: "technical", subcategory: "backend", aliases: ["Node", "Express.js"], industryDemandScore: 88 },
    { name: "REST APIs", slug: "rest-apis", category: "technical", subcategory: "backend", aliases: ["RESTful", "REST"], industryDemandScore: 91 },
    { name: "GraphQL", slug: "graphql", category: "technical", subcategory: "backend", aliases: [], industryDemandScore: 74 },
    { name: "FastAPI", slug: "fastapi", category: "technical", subcategory: "backend", aliases: [], industryDemandScore: 72 },
    { name: "Spring Boot", slug: "spring-boot", category: "technical", subcategory: "backend", aliases: ["Spring", "SpringBoot"], industryDemandScore: 76 },
    { name: "Django", slug: "django", category: "technical", subcategory: "backend", aliases: ["DRF"], industryDemandScore: 70 },

    // ── TECHNICAL: Databases ──────────────────────────────
    { name: "MongoDB", slug: "mongodb", category: "technical", subcategory: "databases", aliases: ["Mongoose"], industryDemandScore: 82 },
    { name: "PostgreSQL", slug: "postgresql", category: "technical", subcategory: "databases", aliases: ["Postgres"], industryDemandScore: 87 },
    { name: "MySQL", slug: "mysql", category: "technical", subcategory: "databases", aliases: [], industryDemandScore: 80 },
    { name: "Redis", slug: "redis", category: "technical", subcategory: "databases", aliases: ["Redis Cache"], industryDemandScore: 84 },
    { name: "Elasticsearch", slug: "elasticsearch", category: "technical", subcategory: "databases", aliases: ["Elastic"], industryDemandScore: 70 },

    // ── TECHNICAL: Distributed Systems ───────────────────
    { name: "Distributed Systems", slug: "distributed-systems", category: "technical", subcategory: "systems", aliases: [], industryDemandScore: 85 },
    { name: "Microservices", slug: "microservices", category: "technical", subcategory: "systems", aliases: ["Microservice Architecture"], industryDemandScore: 88 },
    { name: "Message Queues", slug: "message-queues", category: "technical", subcategory: "systems", aliases: ["Kafka", "RabbitMQ", "SQS"], industryDemandScore: 80 },
    { name: "System Design", slug: "system-design", category: "technical", subcategory: "systems", aliases: ["HLD", "LLD", "Architecture"], industryDemandScore: 90 },
    { name: "Caching Strategies", slug: "caching", category: "technical", subcategory: "systems", aliases: ["CDN", "Cache Invalidation"], industryDemandScore: 82 },
    { name: "gRPC", slug: "grpc", category: "technical", subcategory: "systems", aliases: [], industryDemandScore: 68 },

    // ── TECHNICAL: Data Structures & Algorithms ───────────
    { name: "Data Structures", slug: "data-structures", category: "technical", subcategory: "algorithms", aliases: ["DSA", "DS"], industryDemandScore: 88 },
    { name: "Algorithms", slug: "algorithms", category: "technical", subcategory: "algorithms", aliases: ["Algo"], industryDemandScore: 85 },
    { name: "Dynamic Programming", slug: "dynamic-programming", category: "technical", subcategory: "algorithms", aliases: ["DP"], industryDemandScore: 78 },

    // ── TECHNICAL: DevOps & Infra ─────────────────────────
    { name: "Docker", slug: "docker", category: "technical", subcategory: "devops", aliases: ["Containers", "Containerization"], industryDemandScore: 88 },
    { name: "Kubernetes", slug: "kubernetes", category: "technical", subcategory: "devops", aliases: ["K8s"], industryDemandScore: 82 },
    { name: "CI/CD", slug: "cicd", category: "technical", subcategory: "devops", aliases: ["GitHub Actions", "Jenkins", "CircleCI"], industryDemandScore: 85 },
    { name: "Linux/Unix", slug: "linux", category: "technical", subcategory: "devops", aliases: ["Bash", "Shell Scripting"], industryDemandScore: 78 },
    { name: "Terraform", slug: "terraform", category: "technical", subcategory: "devops", aliases: ["IaC", "Infrastructure as Code"], industryDemandScore: 74 },

    // ── CLOUD ─────────────────────────────────────────────
    { name: "AWS", slug: "aws", category: "cloud", subcategory: "providers", aliases: ["Amazon Web Services", "EC2", "S3", "Lambda"], industryDemandScore: 92 },
    { name: "Google Cloud", slug: "gcp", category: "cloud", subcategory: "providers", aliases: ["GCP", "BigQuery"], industryDemandScore: 78 },
    { name: "Azure", slug: "azure", category: "cloud", subcategory: "providers", aliases: ["Microsoft Azure"], industryDemandScore: 76 },
    { name: "Serverless", slug: "serverless", category: "cloud", subcategory: "patterns", aliases: ["Lambda", "Cloud Functions", "FaaS"], industryDemandScore: 78 },
    { name: "Cloud Architecture", slug: "cloud-architecture", category: "cloud", subcategory: "patterns", aliases: [], industryDemandScore: 84 },

    // ── DATA & ML ─────────────────────────────────────────
    { name: "Machine Learning", slug: "machine-learning", category: "data", subcategory: "ml", aliases: ["ML", "Supervised Learning"], industryDemandScore: 90 },
    { name: "Deep Learning", slug: "deep-learning", category: "data", subcategory: "ml", aliases: ["Neural Networks", "DL"], industryDemandScore: 82 },
    { name: "Natural Language Processing", slug: "nlp", category: "data", subcategory: "ml", aliases: ["NLP", "LLMs", "Text Analysis"], industryDemandScore: 88 },
    { name: "Computer Vision", slug: "computer-vision", category: "data", subcategory: "ml", aliases: ["CV", "Image Recognition"], industryDemandScore: 78 },
    { name: "Data Analysis", slug: "data-analysis", category: "data", subcategory: "analytics", aliases: ["Analytics", "EDA"], industryDemandScore: 86 },
    { name: "Pandas", slug: "pandas", category: "data", subcategory: "tools", aliases: ["NumPy", "Pandas DataFrame"], industryDemandScore: 82 },
    { name: "TensorFlow", slug: "tensorflow", category: "data", subcategory: "frameworks", aliases: ["Keras", "TF"], industryDemandScore: 78 },
    { name: "PyTorch", slug: "pytorch", category: "data", subcategory: "frameworks", aliases: [], industryDemandScore: 82 },
    { name: "Data Engineering", slug: "data-engineering", category: "data", subcategory: "engineering", aliases: ["ETL", "Pipelines", "Airflow"], industryDemandScore: 84 },
    { name: "SQL Analytics", slug: "sql-analytics", category: "data", subcategory: "analytics", aliases: ["BI", "Tableau", "Power BI"], industryDemandScore: 80 },

    // ── PRODUCT MANAGEMENT ────────────────────────────────
    { name: "Product Strategy", slug: "product-strategy", category: "product", subcategory: "strategy", aliases: ["GTM", "Roadmap"], industryDemandScore: 80 },
    { name: "Product Metrics", slug: "product-metrics", category: "product", subcategory: "analytics", aliases: ["KPIs", "OKRs", "North Star Metric"], industryDemandScore: 82 },
    { name: "User Research", slug: "user-research", category: "product", subcategory: "research", aliases: ["UX Research", "Customer Discovery"], industryDemandScore: 76 },
    { name: "RICE / Prioritization", slug: "prioritization", category: "product", subcategory: "frameworks", aliases: ["RICE", "Kano", "MoSCoW"], industryDemandScore: 74 },
    { name: "A/B Testing", slug: "ab-testing", category: "product", subcategory: "experimentation", aliases: ["Experimentation", "Split Testing"], industryDemandScore: 80 },
    { name: "Agile / Scrum", slug: "agile", category: "product", subcategory: "methodology", aliases: ["Scrum", "Kanban", "Sprint"], industryDemandScore: 85 },
    { name: "Figma / Design Tools", slug: "figma", category: "product", subcategory: "design", aliases: ["Figma", "Sketch", "Wireframing"], industryDemandScore: 72 },

    // ── SOFT SKILLS ───────────────────────────────────────
    { name: "Communication", slug: "communication", category: "soft", subcategory: "interpersonal", aliases: ["Verbal Communication", "Written Communication"], industryDemandScore: 95 },
    { name: "Problem Solving", slug: "problem-solving", category: "soft", subcategory: "cognitive", aliases: ["Analytical Thinking", "Critical Thinking"], industryDemandScore: 96 },
    { name: "Leadership", slug: "leadership", category: "soft", subcategory: "management", aliases: ["Team Lead", "People Management"], industryDemandScore: 85 },
    { name: "Teamwork", slug: "teamwork", category: "soft", subcategory: "interpersonal", aliases: ["Collaboration", "Cross-functional"], industryDemandScore: 90 },
    { name: "Composure Under Pressure", slug: "composure", category: "soft", subcategory: "resilience", aliases: ["Stress Management", "Resilience"], industryDemandScore: 88 },
    { name: "Structured Thinking", slug: "structured-thinking", category: "soft", subcategory: "cognitive", aliases: ["MECE", "First Principles"], industryDemandScore: 84 },

    // ── DOMAIN / SPECIALTY ────────────────────────────────
    { name: "Security Engineering", slug: "security", category: "domain", subcategory: "security", aliases: ["Cybersecurity", "AppSec", "OAuth"], industryDemandScore: 86 },
    { name: "Blockchain", slug: "blockchain", category: "domain", subcategory: "emerging", aliases: ["Web3", "Smart Contracts", "Solidity"], industryDemandScore: 55 },
    { name: "Mobile Development", slug: "mobile", category: "domain", subcategory: "mobile", aliases: ["iOS", "Android", "React Native", "Flutter"], industryDemandScore: 80 },
    { name: "Game Development", slug: "game-dev", category: "domain", subcategory: "gaming", aliases: ["Unity", "Unreal", "Game Design"], industryDemandScore: 55 },
    { name: "Embedded Systems", slug: "embedded", category: "domain", subcategory: "hardware", aliases: ["RTOS", "Firmware", "IoT"], industryDemandScore: 65 },
];

module.exports = skillTaxonomy;
