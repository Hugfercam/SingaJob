import { getPrisma } from "@/lib/db";
import { tenantScope } from "@/lib/domain/tenant";
import { readFieldDefinitions, type FieldDefinition } from "@/lib/work-orders/fields";

export type TemplateListItem = {
  id: string;
  name: string;
  description: string | null;
  fieldCount: number;
  updatedAt: Date;
};

export async function listTemplates(
  companyId: string,
): Promise<TemplateListItem[]> {
  const templates = await getPrisma().template.findMany({
    where: { ...tenantScope(companyId), archived: false },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      fields: true,
      updatedAt: true,
    },
  });

  return templates.map(({ fields, ...template }) => ({
    ...template,
    fieldCount: readFieldDefinitions(fields).length,
  }));
}

export type TemplateDetail = {
  id: string;
  name: string;
  description: string | null;
  fields: FieldDefinition[];
};

export async function getTemplate(
  companyId: string,
  templateId: string,
): Promise<TemplateDetail | null> {
  const template = await getPrisma().template.findFirst({
    where: { id: templateId, ...tenantScope(companyId) },
    select: { id: true, name: true, description: true, fields: true },
  });

  if (!template) {
    return null;
  }

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    fields: readFieldDefinitions(template.fields),
  };
}

export async function countTemplates(companyId: string): Promise<number> {
  return getPrisma().template.count({
    where: { ...tenantScope(companyId), archived: false },
  });
}
