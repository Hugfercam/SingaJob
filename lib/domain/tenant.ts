/**
 * Aislamiento entre empresas (multi-tenant).
 *
 * SignaJob es multi-tenant: cada consulta de negocio debe filtrar por
 * companyId. Estas funciones concentran esa regla para que no dependa de que
 * cada consulta la recuerde.
 */

export type TenantScope = { companyId: string };

/**
 * Devuelve el filtro por empresa, validando que el identificador no venga vacío.
 * Un companyId vacío devolvería datos de todas las empresas, así que se falla
 * de forma explícita en lugar de consultar sin filtro.
 */
export function tenantScope(companyId: string): TenantScope {
  const id = typeof companyId === "string" ? companyId.trim() : "";

  if (!id) {
    throw new Error("tenantScope: companyId vacío, se rechaza la consulta");
  }

  return { companyId: id };
}

/**
 * Comprueba que un recurso pertenece a la empresa de la sesión antes de
 * modificarlo o mostrarlo.
 */
export function assertSameTenant(
  resourceCompanyId: string,
  sessionCompanyId: string,
): void {
  if (resourceCompanyId !== sessionCompanyId) {
    throw new Error("assertSameTenant: el recurso no pertenece a la empresa");
  }
}
