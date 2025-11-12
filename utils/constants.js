import dotenv from 'dotenv'
// Load env file based on NODE_ENV
const envFile = process.env.NODE_ENV === "prod" ? "./.env" : "./.env.dev";
dotenv.config({ path: envFile });

const envfile = {
    PORT: process.env.PORT || 3004,
    NODE_ENV: process.env.NODE_ENV || 'dev',
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXP: process.env.ACCESS_TOKEN_EXP,
    REFRESH_TOKEN_EXP: process.env.REFRESH_TOKEN_EXP,
    DATABASE_URL: process.env.DATABASE_URL,
}

export default envfile;