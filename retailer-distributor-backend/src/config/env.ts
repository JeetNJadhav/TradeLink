import "dotenv/config";
import Joi from "joi";
import ms, { type StringValue } from "ms";

// Every environment variable the backend reads. Read and validated once, here.
interface Env {
  DATABASE_URL: string;
  OPENSEARCH_URL: string;

  HOST: string;
  PORT: number;
  CORS_ORIGIN: string;

  JWT_ACCESS_SECRET: string;
  ACCESS_TOKEN_TTL: StringValue;
  REFRESH_TOKEN_TTL_DAYS: number;
  ACCESS_TOKEN_TTL_SECONDS: number;

  ACCESS_COOKIE_NAME: string;
  REFRESH_COOKIE_NAME: string;
  CSRF_COOKIE_NAME: string;
  CSRF_HEADER_NAME: string;
  COOKIE_SAMESITE: "Strict" | "Lax" | "None";
  COOKIE_SECURE: boolean;
}

// An empty value (`NAME=`) counts as not set, so the default applies.
const optional = (fallback: string) =>
  Joi.string().empty("").default(fallback);

// A duration the `ms` package understands, such as `15m`.
const duration = Joi.string().custom((value: string, helpers) => {
  const milliseconds: unknown = ms(value as StringValue);

  return typeof milliseconds === "number" && milliseconds > 0
    ? value
    : helpers.error("any.invalid");
});

const schema = Joi.object<Env>({
  DATABASE_URL: Joi.string().required(),
  OPENSEARCH_URL: optional("http://localhost:9200"),

  HOST: optional("localhost"),
  PORT: Joi.number().port().empty("").default(3000),
  CORS_ORIGIN: optional("http://localhost:5173"),

  JWT_ACCESS_SECRET: Joi.string().required(),
  ACCESS_TOKEN_TTL: duration.required(),
  REFRESH_TOKEN_TTL_DAYS: Joi.number().positive().required(),
  ACCESS_TOKEN_TTL_SECONDS: Joi.number().positive().empty("").default(900),

  ACCESS_COOKIE_NAME: optional("accessToken"),
  REFRESH_COOKIE_NAME: optional("refreshToken"),
  CSRF_COOKIE_NAME: optional("csrfToken"),
  // Node lowercases incoming header names, so the lookup key must be lowercase too.
  CSRF_HEADER_NAME: optional("x-csrf-token").lowercase(),
  COOKIE_SAMESITE: optional("Strict").valid("Strict", "Lax", "None"),
  COOKIE_SECURE: Joi.boolean().empty("").default(false),
});

const { value, error } = schema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

if (error) {
  throw new Error(`Invalid environment: ${error.message}`);
}

// Browsers drop a SameSite=None cookie that is not Secure.
if (value.COOKIE_SAMESITE === "None" && !value.COOKIE_SECURE) {
  throw new Error(
    "Invalid environment: COOKIE_SAMESITE=None requires COOKIE_SECURE=true",
  );
}

export const env: Env = value;
