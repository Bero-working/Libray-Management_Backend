import { HttpStatus, Type, applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  ErrorEnvelopeDto,
  PaginationMetaDto,
  SuccessFlagDto,
} from './swagger.models';

type SwaggerModel = Type<unknown>;
type SwaggerSchema = Record<string, unknown>;

type ApiSuccessResponseOptions = {
  status?: number;
  description: string;
  type?: SwaggerModel;
  isArray?: boolean;
  schema?: SwaggerSchema;
  extraModels?: SwaggerModel[];
};

type ApiErrorResponseOptions = {
  status: number;
  description: string;
  code?: string;
  message?: string;
};

export function ApiProtectedResource(tag: string) {
  return applyDecorators(
    ApiTags(tag),
    ApiBearerAuth('access-token'),
    ApiUnauthorizedErrorResponse(),
    ApiForbiddenErrorResponse(),
  );
}

export function ApiSuccessResponse(options: ApiSuccessResponseOptions) {
  const {
    status = HttpStatus.OK,
    description,
    type,
    isArray = false,
    schema,
    extraModels = [],
  } = options;

  const dataSchema =
    schema ??
    (type
      ? isArray
        ? {
            type: 'array',
            items: {
              $ref: getSchemaPath(type),
            },
          }
        : {
            $ref: getSchemaPath(type),
          }
      : {
          type: 'object',
          additionalProperties: true,
        });

  return applyDecorators(
    ApiExtraModels(SuccessFlagDto, ...extraModels, ...(type ? [type] : [])),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(SuccessFlagDto),
          },
          {
            type: 'object',
            properties: {
              data: dataSchema,
            },
            required: ['data'],
          },
        ],
      },
    }),
  );
}

export function ApiErrorResponse(options: ApiErrorResponseOptions) {
  const { status, description, code, message } = options;

  return applyDecorators(
    ApiExtraModels(ErrorEnvelopeDto),
    ApiResponse({
      status,
      description,
      schema: {
        allOf: [
          {
            $ref: getSchemaPath(ErrorEnvelopeDto),
          },
        ],
        example: {
          success: false,
          error: {
            code: code ?? defaultErrorCode(status),
            message: message ?? defaultErrorMessage(status, description),
          },
        },
      },
    }),
  );
}

export function ApiBadRequestErrorResponse(
  description = 'Request validation failed',
) {
  return ApiErrorResponse({
    status: HttpStatus.BAD_REQUEST,
    description,
    code: 'BAD_REQUEST',
    message: 'Request validation failed',
  });
}

export function ApiUnauthorizedErrorResponse(
  description = 'Missing or invalid bearer token',
) {
  return ApiErrorResponse({
    status: HttpStatus.UNAUTHORIZED,
    description,
    code: 'UNAUTHORIZED',
    message: description,
  });
}

export function ApiForbiddenErrorResponse(
  description = 'You do not have permission to access this resource',
) {
  return ApiErrorResponse({
    status: HttpStatus.FORBIDDEN,
    description,
    code: 'FORBIDDEN',
    message: description,
  });
}

export function ApiNotFoundErrorResponse(description = 'Resource not found') {
  return ApiErrorResponse({
    status: HttpStatus.NOT_FOUND,
    description,
    code: 'NOT_FOUND',
    message: description,
  });
}

export function ApiConflictErrorResponse(
  description = 'Request conflicts with existing data',
) {
  return ApiErrorResponse({
    status: HttpStatus.CONFLICT,
    description,
    code: 'CONFLICT',
    message: description,
  });
}

export function ApiTooManyRequestsErrorResponse(
  description = 'Too many requests',
) {
  return ApiErrorResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description,
    code: 'TOO_MANY_REQUESTS',
    message: description,
  });
}

export function buildPaginatedDataSchema(
  itemModel: SwaggerModel,
  metaModel: SwaggerModel = PaginationMetaDto,
): SwaggerSchema {
  return {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          $ref: getSchemaPath(itemModel),
        },
      },
      meta: {
        $ref: getSchemaPath(metaModel),
      },
    },
    required: ['items', 'meta'],
  };
}

function defaultErrorCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'UNPROCESSABLE_ENTITY';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'TOO_MANY_REQUESTS';
    default:
      return 'HTTP_EXCEPTION';
  }
}

function defaultErrorMessage(status: number, description: string): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'Request validation failed';
    case HttpStatus.UNAUTHORIZED:
      return 'Invalid bearer token';
    case HttpStatus.FORBIDDEN:
      return 'Forbidden resource';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'Too many requests';
    default:
      return description;
  }
}
