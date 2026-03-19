import * as Joi from 'joi';

type EnvValidationInput = {
  DATABASE_URL: string;
  DIRECT_URL?: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_TTL: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_TTL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  SKIP_DB_CONNECTION: boolean;
};

export const envValidationSchema = Joi.object<EnvValidationInput>({
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  DIRECT_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .allow('')
    .optional(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_TTL: Joi.string().default('7d'),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  SKIP_DB_CONNECTION: Joi.boolean()
    .truthy('true')
    .falsy('false')
    .default(false),
})
  .custom((value: EnvValidationInput, helpers) => {
    if (
      value.NODE_ENV === 'production' &&
      !value.DATABASE_URL.includes('sslmode=require')
    ) {
      return helpers.error('any.invalid', {
        message:
          'DATABASE_URL must include sslmode=require when NODE_ENV=production',
      });
    }

    if (
      value.NODE_ENV === 'production' &&
      value.DIRECT_URL &&
      !value.DIRECT_URL.includes('sslmode=require')
    ) {
      return helpers.error('any.invalid', {
        message:
          'DIRECT_URL must include sslmode=require when NODE_ENV=production',
      });
    }

    return value;
  })
  .messages({
    'any.invalid': '{{#message}}',
  });
