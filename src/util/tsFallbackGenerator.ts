type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

/**
 * Converts a JSON string to TypeScript interface + optional Zod schema
 */
export const jsonToInterface = (
  jsonString: string,
  rootName: string = "RootObject",
  includeZod: boolean = true,
): string => {
  const parsed = JSON.parse(jsonString);
  const interfaces: string[] = [];
  const zodSchemas: string[] = [];

  const toPascalCase = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getType = (value: JsonValue, key: string, depth: number): string => {
    if (value === null) return "null";
    if (Array.isArray(value)) {
      if (value.length === 0) return "unknown[]";
      const itemType = getType(value[0] as JsonValue, key, depth);
      return `${itemType}[]`;
    }
    if (typeof value === "object") {
      const nestedName = toPascalCase(key);
      generateInterface(value as JsonObject, nestedName, depth + 1);
      return nestedName;
    }
    return typeof value; // string, number, boolean
  };

  const getZodType = (value: JsonValue, key: string): string => {
    if (value === null) return "z.null()";
    if (Array.isArray(value)) {
      if (value.length === 0) return "z.array(z.unknown())";
      const itemType = getZodType(value[0] as JsonValue, key);
      return `z.array(${itemType})`;
    }
    if (typeof value === "object") {
      return `${toPascalCase(key)}Schema`;
    }
    switch (typeof value) {
      case "string":
        return "z.string()";
      case "number":
        return "z.number()";
      case "boolean":
        return "z.boolean()";
      default:
        return "z.unknown()";
    }
  };

  const generateInterface = (
    obj: JsonObject,
    name: string,
    depth: number,
  ): void => {
    const properties: string[] = [];
    const zodProperties: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const tsType = getType(value, key, depth);
      const isOptional = value === null;
      properties.push(`  ${key}${isOptional ? "?" : ""}: ${tsType};`);

      if (includeZod) {
        let zodType = getZodType(value, key);
        if (isOptional) zodType = `${zodType}.optional()`;
        zodProperties.push(`  ${key}: ${zodType},`);
      }
    }

    interfaces.unshift(`interface ${name} {\n${properties.join("\n")}\n}`);

    if (includeZod) {
      zodSchemas.unshift(
        `const ${name}Schema = z.object({\n${zodProperties.join("\n")}\n});`,
      );
    }
  };

  if (Array.isArray(parsed)) {
    if (parsed.length > 0 && typeof parsed[0] === "object") {
      generateInterface(parsed[0] as JsonObject, rootName, 0);
      interfaces.push(`type ${rootName}Array = ${rootName}[];`);
      if (includeZod) {
        zodSchemas.push(
          `const ${rootName}ArraySchema = z.array(${rootName}Schema);`,
        );
      }
    }
  } else if (typeof parsed === "object") {
    generateInterface(parsed as JsonObject, rootName, 0);
  }

  const output: string[] = [];

  if (includeZod) {
    output.push('import { z } from "zod";\n');
  }

  output.push(interfaces.join("\n\n"));

  if (includeZod) {
    output.push("\n\n" + zodSchemas.join("\n\n"));
  }

  return output.join("");
};
