import { askAI } from "../ai";
import { jsonToInterface } from "../util/tsFallbackGenerator";

const SYSTEM_INSTRUCTION_TS_ONLY = `
You are a TypeScript code generator.

Your job is to convert JSON data into TypeScript interfaces.

Rules:
- Generate clean, valid TypeScript code only
- Create interfaces with proper typing
- Infer optional fields (null values → optional)
- Use PascalCase for interface names
- Use camelCase for property names
- Handle nested objects and arrays
- Do not include explanations, only code
- Do not wrap in markdown code blocks
- Do NOT generate Zod schemas

Output format:
- TypeScript interface(s) only
`;

const SYSTEM_INSTRUCTION_WITH_ZOD = `
You are a TypeScript code generator.

Your job is to convert JSON data into TypeScript interfaces and Zod schemas.

Rules:
- Generate clean, valid TypeScript code only
- Create interfaces with proper typing
- Create matching Zod schemas using 'z' from 'zod'
- Infer optional fields (null values → optional)
- Use PascalCase for interface names
- Use camelCase for property names
- Handle nested objects and arrays
- Do not include explanations, only code
- Do not wrap in markdown code blocks

Output format:
1. Import statement for zod
2. TypeScript interface(s)
3. Matching Zod schema(s)
`;

export const json2ts = async (
  json: string,
  rootName: string = "RootObject",
  includeZod: boolean = false,
): Promise<string> => {
  // Validate JSON first
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON input");
  }

  const systemInstruction = includeZod
    ? SYSTEM_INSTRUCTION_WITH_ZOD
    : SYSTEM_INSTRUCTION_TS_ONLY;

  // 1️⃣ Try AI generation
  try {
    const prompt = `
Convert this JSON to TypeScript interface${includeZod ? " and Zod schema" : ""}:

Root type name: ${rootName}

JSON:
${JSON.stringify(parsed, null, 2)}
`;

    const tsOutput = await askAI(prompt, {
      config: {
        systemInstruction,
      },
    });

    // Sanity check
    if (!tsOutput.includes("interface")) {
      throw new Error("AI output missing interface");
    }

    if (includeZod && !tsOutput.includes("z.object")) {
      throw new Error("AI output missing Zod schema");
    }

    return tsOutput.trim();
  } catch (err) {
    console.warn("⚠️ AI generation failed, using fallback generator");

    // 2️⃣ Fallback to deterministic generator
    return jsonToInterface(json, rootName, includeZod);
  }
};
