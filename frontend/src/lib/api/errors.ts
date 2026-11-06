import type { ValidationErrors } from "./types";

/**
 * Error lanzado cuando la API responde con un status no exitoso
 * (o cuando no se puede alcanzar). Lleva el status HTTP para que las
 * Server Actions y los error boundaries decidan que hacer.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: ValidationErrors;

  constructor(
    message: string,
    status: number,
    fieldErrors?: ValidationErrors,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** 401: token ausente, invalido o expirado */
  get isUnauthorized() {
    return this.status === 401;
  }

  /** 422: validacion fallida (o regla de negocio, ej. stock insuficiente) */
  get isValidation() {
    return this.status === 422;
  }

  /** status 0 = la API no respondio (caida / URL incorrecta) */
  get isNetwork() {
    return this.status === 0;
  }
}
