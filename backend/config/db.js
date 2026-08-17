const { Pool } = require("pg");

let pool = null;
let isConnected = false;

// Mock in-memory tables fallback
const mockDb = {
    users: [],
    interviews: [],
    reports: []
};

try {
    if (process.env.DB_HOST && process.env.DB_NAME) {
        pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });

        pool.connect()
            .then(() => {
                isConnected = true;
                console.log("✅ PostgreSQL Connected");
            })
            .catch(err => {
                console.log("ℹ️ Database connection failed, falling back to resilient in-memory mode.");
                isConnected = false;
            });
    } else {
        console.log("ℹ️ No DB configuration provided in .env, running with resilient in-memory store.");
    }
} catch (err) {
    console.log("ℹ️ DB init error, using in-memory store.");
}

const safePool = {
    query: async (text, params = []) => {
        if (isConnected && pool) {
            try {
                return await pool.query(text, params);
            } catch (err) {
                console.warn("DB Query failed, using in-memory store fallback:", err.message);
            }
        }

        const sql = text.trim().toLowerCase();

        // Basic mock router for fallback operations
        if (sql.startsWith("insert into users")) {
            const id = mockDb.users.length + 1;
            const newUser = { id, name: params[0], email: params[1], password: params[2], created_at: new Date() };
            mockDb.users.push(newUser);
            return { rows: [{ ...newUser }] };
        }

        if (sql.startsWith("select * from users where email =")) {
            const user = mockDb.users.find(u => u.email === params[0]);
            return { rows: user ? [{ ...user }] : [] };
        }

        if (sql.startsWith("select id, name, email")) {
            const user = mockDb.users.find(u => u.id === params[0]);
            return { rows: user ? [{ id: user.id, name: user.name, email: user.email, created_at: user.created_at }] : [] };
        }

        if (sql.startsWith("insert into interviews")) {
            const id = 'intv_' + Date.now();
            const newInterview = {
                id,
                user_id: params[0],
                role: params[1],
                experience: params[2],
                difficulty: params[3],
                created_at: new Date()
            };
            mockDb.interviews.push(newInterview);
            return { rows: [{ ...newInterview }] };
        }

        if (sql.startsWith("select") && sql.includes("from interviews")) {
            return { rows: mockDb.interviews.filter(i => i.user_id === params[0]) };
        }

        return { rows: [] };
    }
};

module.exports = safePool;