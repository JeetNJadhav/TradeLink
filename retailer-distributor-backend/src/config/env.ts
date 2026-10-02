import "dotenv/config";
import Joi from "joi";

// Every environment variable the backend reads. Read and validated once, here.
interface Env {
  DATABASE_URL: string;
  OPENSEARCH_URL: string;

  HOST: string;
  PORT: number;
  CORS_ORIGIN: string;

  JWT_ACCESS_SECRET: string;
  ACCESS_TOKEN_TTL: string;
  REFRESH_TOKEN_TTL_DAYS: number;
  ACCESS_TOKEN_TTL_SECONDS: number;

  ACCESS_COOKIE_NAME: string;
  REFRESH_COOKIE_NAME: string;
  CSRF_COOKIE_NAME: string;
  CSRF_HEADER_NAME: string;
  COOKIE_SAMESITE: "Strict" | "Lax" | "None";
  COOKIE_SECURE: string;
}

// An empty value (`NAME=`) counts as not set, so the default applies.
const optional = (fallback: string) =>
  Joi.string().empty("").default(fallback);

const schema = Joi.object<Env>({
  DATABASE_URL: Joi.string().required(),
  OPENSEARCH_URL: optional("http://localhost:9200"),

  HOST: optional("localhost"),
  PORT: Joi.number().port().empty("").default(3000),
  CORS_ORIGIN: optional("http://localhost:5173"),

  JWT_ACCESS_SECRET: Joi.string().required(),
  ACCESS_TOKEN_TTL: Joi.string().required(),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().positive().required(),
  ACCESS_TOKEN_TTL_SECONDS: Joi.number().positive().empty("").default(900),

  ACCESS_COOKIE_NAME: optional("accessToken"),
  REFRESH_COOKIE_NAME: optional("refreshToken"),
  CSRF_COOKIE_NAME: optional("csrfToken"),
  CSRF_HEADER_NAME: optional("x-csrf-token"),
  COOKIE_SAMESITE: optional("Strict").valid("Strict", "Lax", "None"),
  COOKIE_SECURE: optional("false"),
});

const { value, error } = schema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

if (error) {
  throw new Error(`Invalid environment: ${error.message}`);
}

export const env: Env = value;
