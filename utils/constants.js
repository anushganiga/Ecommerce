import dotenv from 'dotenv'
const envfilepath = process.env.NODE_ENV === "dev" ? ".env.dev" : ".env";
dotenv.config({ path: envfilepath })

const envconfig = {
    PORT: process.env.PORT,

    NODE_ENV: process.env.NODE_ENV,

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    ACCESS_TOKEN_EXP: process.env.ACCESS_TOKEN_EXP,
    REFRESH_TOKEN_EXP: process.env.REFRESH_TOKEN_EXP,

    DATABASE_URL: process.env.DATABASE_URL,
};

export default envconfig;