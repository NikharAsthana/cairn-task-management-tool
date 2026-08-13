import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().uri().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  // .min(32) isn't arbitrary — a short or guessable JWT signing secret
  // undermines the entire point of signing tokens, since anyone who
  // can guess it can forge a valid-looking login for any user.
  JWT_EXPIRES_IN: Joi.string().default('7d'),

  // Google OAuth credentials — genuinely needed once Phase 4 builds the
  // real login flow, but I'm leaving them .optional() for now rather
  // than .required(), so the app isn't blocked from booting today over
  // Google Cloud console setup we haven't started yet. We'll flip these
  // to .required(), right when Phase 4 wires up the OAuth
  // strategy — flagging that explicitly so it doesn't get forgotten.
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_CALLBACK_URL: Joi.string().uri().optional(),
});
