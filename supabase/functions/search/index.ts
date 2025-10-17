import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

type SearchRequest = {
  symptom: string;
  region?: string;
};

type DepartmentResult = {
  departments: string[];
  searches: Array<{
    department: string;
    webUrl: string;
    appUrl: string;
  }>;
};

const allowedDepartments = [
  "내과",
  "외과",
  "신경외과",
  "정형외과",
  "성형외과",
  "산부인과",
  "피부과",
  "안과",
  "비뇨의학과",
  "이비인후과",
  "정신건강의학과",
  "소아청소년과",
  "재활의학과",
  "치과",
];

const normalizedAllowed = allowedDepartments.map((name) => normalizeDepartment(name));

function normalizeDepartment(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\s+/g, "")
    .replace(/과+$/u, "과");
}

function mapToAllowedDepartments(candidates: string[]): string[] {
  const results: string[] = [];

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeDepartment(candidate);
    const matchIndex = normalizedAllowed.findIndex((normalized) =>
      normalizedCandidate.includes(normalized) || normalized.includes(normalizedCandidate)
    );

    if (matchIndex !== -1) {
      const department = allowedDepartments[matchIndex];
      if (!results.includes(department)) {
        results.push(department);
      }
    }
  }

  return results;
}

const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*";
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openAiApiKey = Deno.env.get("OPENAI_API_KEY");

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn("[search] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
}

if (!openAiApiKey) {
  console.warn("[search] Missing OPENAI_API_KEY env var; GPT mapping will fail.");
}

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Vary": "Origin",
};

async function fetchDepartments(symptom: string): Promise<string[]> {
  if (!openAiApiKey) {
    throw new Error("OPENAI_API_KEY not configured.");
  }
  const system = [
    "You are a medical triage assistant for Korean patients.",
    "Only choose from the following department names: 내과, 외과, 신경외과, 정형외과, 성형외과, 산부인과, 피부과, 안과, 비뇨의학과, 이비인후과, 정신건강의학과, 소아청소년과, 재활의학과, 치과.",
    "Given the user's symptoms, respond with a JSON array (1-3 unique items) where each item is exactly one of the allowed department names.",
    "Respond with the JSON array only, without extra text.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: Deno.env.get("OPENAI_MODEL") ?? "gpt-5-nano",
      messages: [
        { role: "system", content: system },
        { role: "user", content: `증상: ${symptom}` },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;

  if (!message) {
    throw new Error("OpenAI response missing content.");
  }

  let content = "";
  if (typeof message.content === "string") {
    content = message.content;
  } else if (Array.isArray(message.content)) {
    content = message.content
      .map((part: unknown) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          const text = (part as { text?: string }).text;
          return typeof text === "string" ? text : "";
        }
        return "";
      })
      .join("")
      .trim();
  } else if (message.content && typeof message.content === "object" && "text" in message.content) {
    const text = (message.content as { text?: string }).text;
    content = typeof text === "string" ? text : "";
  }

  if (!content) {
    throw new Error("OpenAI response missing textual content.");
  }

  const cleanedContent = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*$/g, "")
    .trim();

  try {
    const parsed = JSON.parse(cleanedContent);
    const extracted = extractDepartments(parsed);
    const mapped = mapToAllowedDepartments(extracted);
    if (mapped.length > 0) return mapped;

    throw new Error("Unexpected JSON structure from OpenAI.");
  } catch (error) {
    const fallback = extractFromText(cleanedContent);
    const mappedFallback = mapToAllowedDepartments(fallback);
    if (mappedFallback.length > 0) {
      return mappedFallback;
    }
    console.warn("[search] Failed to map GPT output, returning defaults.", cleanedContent);
    return allowedDepartments.slice(0, 3);
  }
}

function extractDepartments(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload.map((item) => String(item));
  }

  if (!payload || typeof payload !== "object") return [];

  const container = payload as Record<string, unknown>;
  const candidateKeys = ["departments", "과", "과명", "result", "results", "data", "items", "keywords"];

  for (const key of candidateKeys) {
    const value = container[key];
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }
    if (typeof value === "string" && value.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map((item) => String(item));
      } catch {
        // ignore
      }
    }
  }

  const firstArrayValue = Object.values(container).find((value) => Array.isArray(value));
  if (Array.isArray(firstArrayValue)) {
    return firstArrayValue.map((item) => String(item));
  }

  for (const value of Object.values(container)) {
    if (typeof value === "string" && value.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map((item) => String(item));
      } catch {
        continue;
      }
    }
  }

  return [];
}

function extractFromText(text: string): string[] {
  const match = text.match(/\[[^\]]+\]/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    } catch {
      // best-effort only
    }
  }

  const tokens = text
    .split(/[\n,]/)
    .map((token) => token.replace(/^[\s*-]+|[\s*-]+$/g, "").replace(/^"+|"+$/g, "").trim())
    .filter(Boolean);

  if (tokens.length > 0) {
    return tokens.slice(0, 3);
  }

  return [];
}

async function logQuery(
  symptom: string,
  departments: string[],
) {
  if (!supabase) return;

  const { error } = await supabase.from("queries").insert({
    symptom,
    departments,
  });

  if (error) {
    console.warn("[search] Failed to log query:", error);
  }
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let payload: SearchRequest;
  try {
    payload = (await req.json()) as SearchRequest;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { symptom, region } = payload;

  if (!symptom || typeof symptom !== "string") {
    return new Response(JSON.stringify({ error: "symptom is required" }), {
      status: 422,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const departments = await fetchDepartments(symptom);
    await logQuery(symptom, departments);

    const searches: DepartmentResult["searches"] = departments.map((department) => {
      const query = region ? `${region} ${department}` : department;
      return {
        department,
        webUrl: `https://map.naver.com/v5/search/${encodeURIComponent(query)}`,
        appUrl: `nmap://search?query=${encodeURIComponent(query)}`,
      };
    });

    const body: DepartmentResult = { departments, searches };

    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[search] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
