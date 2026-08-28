import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  CreateFabricBody,
  CreateProjectBody,
  DeleteFabricParams,
  DeleteProjectParams,
  GetDashboardSummaryResponse,
  GetProjectParams,
  InterpretDesignBody,
  ListFabricsResponse,
  ListProjectsResponse,
  UpdateFabricBody,
  UpdateFabricParams,
  UpdateProjectBody,
  UpdateProjectParams,
} from "@workspace/api-zod";
import { db, fabricsTable, projectsTable } from "@workspace/db";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

type DbFabric = typeof fabricsTable.$inferSelect;
type DbProject = typeof projectsTable.$inferSelect;

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

function serializeFabric(fabric: DbFabric) {
  return {
    ...fabric,
    widthOfFabric: toNumber(fabric.widthOfFabric),
    amountOnHand: toNumber(fabric.amountOnHand),
    patternTags: fabric.patternTags ?? [],
    imageUrl: fabric.imageUrl ?? null,
    notes: fabric.notes ?? null,
    createdAt: fabric.createdAt.toISOString(),
    updatedAt: fabric.updatedAt.toISOString(),
  };
}

function serializeProject(project: DbProject) {
  return {
    ...project,
    finishedWidth: toNumber(project.finishedWidth),
    finishedHeight: toNumber(project.finishedHeight),
    seamAllowance: toNumber(project.seamAllowance),
    description: project.description ?? null,
    aiPrompt: project.aiPrompt ?? null,
    sourcePhotoUrl: project.sourcePhotoUrl ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

const demoFabrics = [
  {
    id: "demo-indigo",
    name: "Indigo Moon",
    color: "#23395B",
    imageUrl: null,
    widthOfFabric: "44",
    amountOnHand: "3.5",
    amountUnit: "yards",
    directional: false,
    scaleKnown: false,
    patternTags: ["blender", "blue"],
    notes: "A deep navy blender for anchor pieces.",
  },
  {
    id: "demo-coral",
    name: "Coral Sketch",
    color: "#D97B67",
    imageUrl: null,
    widthOfFabric: "44",
    amountOnHand: "2.25",
    amountUnit: "yards",
    directional: true,
    scaleKnown: false,
    patternTags: ["geometric", "focus"],
    notes: "Warm contrast print.",
  },
  {
    id: "demo-cream",
    name: "Oat Milk",
    color: "#F2E8D5",
    imageUrl: null,
    widthOfFabric: "44",
    amountOnHand: "4",
    amountUnit: "yards",
    directional: false,
    scaleKnown: false,
    patternTags: ["solid", "neutral"],
    notes: "Light background fabric.",
  },
];

const demoProject = {
  id: "demo-sunroom",
  name: "Sunroom Study",
  description: "A calm 9-patch study in warm neutrals and blue.",
  finishedWidth: "60",
  finishedHeight: "60",
  seamAllowance: "0.25",
  unit: "inches",
  quiltType: "grid",
  layoutJson: {
    columns: 6,
    rows: 6,
    cellFinishedSize: 10,
    assignments: [
      "demo-cream", "demo-indigo", "demo-coral", "demo-cream", "demo-indigo", "demo-coral",
      "demo-indigo", "demo-coral", "demo-cream", "demo-indigo", "demo-coral", "demo-cream",
      "demo-coral", "demo-cream", "demo-indigo", "demo-coral", "demo-cream", "demo-indigo",
      "demo-cream", "demo-indigo", "demo-coral", "demo-cream", "demo-indigo", "demo-coral",
      "demo-indigo", "demo-coral", "demo-cream", "demo-indigo", "demo-coral", "demo-cream",
      "demo-coral", "demo-cream", "demo-indigo", "demo-coral", "demo-cream", "demo-indigo",
    ],
    borders: { enabled: true, width: 3 },
  },
  aiPrompt: null,
  sourcePhotoUrl: null,
  reverseEngineered: false,
  status: "planning",
};

async function ensureDemoData() {
  const fabricCount = await db.select({ id: fabricsTable.id }).from(fabricsTable).limit(1);
  if (fabricCount.length === 0) {
    await db.insert(fabricsTable).values(demoFabrics);
  }
  const projectCount = await db.select({ id: projectsTable.id }).from(projectsTable).limit(1);
  if (projectCount.length === 0) {
    await db.insert(projectsTable).values(demoProject);
  }
}

router.get("/dashboard/summary", async (_req, res, next) => {
  try {
    await ensureDemoData();
    const [fabrics, projects] = await Promise.all([
      db.select({ id: fabricsTable.id }).from(fabricsTable),
      db.select().from(projectsTable).orderBy(desc(projectsTable.updatedAt)),
    ]);
    const data = GetDashboardSummaryResponse.parse({
      fabricCount: fabrics.length,
      projectCount: projects.length,
      activeProject: projects[0] ? serializeProject(projects[0]) : null,
      recentProjects: projects.slice(0, 3).map(serializeProject),
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/fabrics", async (_req, res, next) => {
  try {
    await ensureDemoData();
    const rows = await db.select().from(fabricsTable).orderBy(desc(fabricsTable.createdAt));
    res.json(ListFabricsResponse.parse(rows.map(serializeFabric)));
  } catch (error) {
    next(error);
  }
});

router.post("/fabrics", async (req, res, next) => {
  try {
    const body = CreateFabricBody.parse(req.body);
    const now = new Date();
    const row = await db.insert(fabricsTable).values({
      id: randomUUID(),
      ...body,
      widthOfFabric: String(body.widthOfFabric),
      amountOnHand: String(body.amountOnHand),
      imageUrl: body.imageUrl ?? null,
      notes: body.notes ?? null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    res.status(201).json(serializeFabric(row[0]));
  } catch (error) {
    next(error);
  }
});

router.patch("/fabrics/:id", async (req, res, next) => {
  try {
    const { id } = UpdateFabricParams.parse(req.params);
    const body = UpdateFabricBody.parse(req.body);
    const updates = {
      ...body,
      ...(body.widthOfFabric === undefined ? {} : { widthOfFabric: String(body.widthOfFabric) }),
      ...(body.amountOnHand === undefined ? {} : { amountOnHand: String(body.amountOnHand) }),
      ...(body.imageUrl === undefined ? {} : { imageUrl: body.imageUrl ?? null }),
      ...(body.notes === undefined ? {} : { notes: body.notes ?? null }),
      updatedAt: new Date(),
    };
    const row = await db.update(fabricsTable).set(updates).where(eq(fabricsTable.id, id)).returning();
    if (!row[0]) return res.status(404).json({ error: "Fabric not found" });
    res.json(serializeFabric(row[0]));
  } catch (error) {
    next(error);
  }
});

router.delete("/fabrics/:id", async (req, res, next) => {
  try {
    const { id } = DeleteFabricParams.parse(req.params);
    const deleted = await db.delete(fabricsTable).where(eq(fabricsTable.id, id)).returning({ id: fabricsTable.id });
    if (!deleted[0]) return res.status(404).json({ error: "Fabric not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/projects", async (_req, res, next) => {
  try {
    await ensureDemoData();
    const rows = await db.select().from(projectsTable).orderBy(desc(projectsTable.updatedAt));
    res.json(ListProjectsResponse.parse(rows.map(serializeProject)));
  } catch (error) {
    next(error);
  }
});

router.post("/projects", async (req, res, next) => {
  try {
    const body = CreateProjectBody.parse(req.body);
    const now = new Date();
    const row = await db.insert(projectsTable).values({
      id: randomUUID(),
      ...body,
      description: body.description ?? null,
      aiPrompt: body.aiPrompt ?? null,
      sourcePhotoUrl: body.sourcePhotoUrl ?? null,
      createdAt: now,
      updatedAt: now,
    }).returning();
    res.status(201).json(serializeProject(row[0]));
  } catch (error) {
    next(error);
  }
});

router.get("/projects/:id", async (req, res, next) => {
  try {
    const { id } = GetProjectParams.parse(req.params);
    const row = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!row[0]) return res.status(404).json({ error: "Project not found" });
    res.json(serializeProject(row[0]));
  } catch (error) {
    next(error);
  }
});

router.patch("/projects/:id", async (req, res, next) => {
  try {
    const { id } = UpdateProjectParams.parse(req.params);
    const body = UpdateProjectBody.parse(req.body);
    const updates = {
      ...body,
      ...(body.description === undefined ? {} : { description: body.description ?? null }),
      ...(body.aiPrompt === undefined ? {} : { aiPrompt: body.aiPrompt ?? null }),
      ...(body.sourcePhotoUrl === undefined ? {} : { sourcePhotoUrl: body.sourcePhotoUrl ?? null }),
      ...(body.finishedWidth === undefined ? {} : { finishedWidth: String(body.finishedWidth) }),
      ...(body.finishedHeight === undefined ? {} : { finishedHeight: String(body.finishedHeight) }),
      ...(body.seamAllowance === undefined ? {} : { seamAllowance: String(body.seamAllowance) }),
      updatedAt: new Date(),
    };
    const row = await db.update(projectsTable).set(updates).where(eq(projectsTable.id, id)).returning();
    if (!row[0]) return res.status(404).json({ error: "Project not found" });
    res.json(serializeProject(row[0]));
  } catch (error) {
    next(error);
  }
});

router.delete("/projects/:id", async (req, res, next) => {
  try {
    const { id } = DeleteProjectParams.parse(req.params);
    const deleted = await db.delete(projectsTable).where(eq(projectsTable.id, id)).returning({ id: projectsTable.id });
    if (!deleted[0]) return res.status(404).json({ error: "Project not found" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/design/interpret", async (req, res, next) => {
  try {
    const body = InterpretDesignBody.parse(req.body);
    const lower = body.prompt.toLowerCase();
    const isMedallion = lower.includes("centre") || lower.includes("center") || lower.includes("medallion");
    const isStrip = lower.includes("strip") || lower.includes("stripe");
    const quiltType = isMedallion ? "medallion" : isStrip ? "strips" : "grid";
    const columns = isMedallion ? 8 : isStrip ? 5 : 6;
    const rows = isMedallion ? 8 : isStrip ? 8 : 6;
    const assignments = Array.from({ length: columns * rows }, (_, index) => body.fabricIds[index % Math.max(body.fabricIds.length, 1)] ?? null);
    const layoutJson = {
      columns,
      rows,
      cellFinishedSize: Math.min(body.finishedWidth / columns, body.finishedHeight / rows),
      assignments,
      borders: { enabled: isMedallion, width: isMedallion ? 4 : 0 },
      source: "structured-interpreter",
    };
    res.json({
      summary: isMedallion
        ? "I read this as a centre-focused medallion with a steady colour progression around the focal square."
        : isStrip
          ? "I read this as a strip-led composition with repeated vertical rhythm and an easy-to-cut structure."
          : "I translated this into a balanced patchwork grid with repeatable pieces and a clear fabric rotation.",
      variants: [
        {
          id: "balanced",
          name: "Balanced interpretation",
          description: "A dependable first draft that follows the geometry in your brief.",
          quiltType,
          layoutJson,
        },
        {
          id: "softer",
          name: "Softer colourway",
          description: "The same structure with a quieter, more evenly distributed fabric rhythm.",
          quiltType,
          layoutJson: { ...layoutJson, assignments: [...assignments].reverse() },
        },
        {
          id: "bold",
          name: "Bolder contrast",
          description: "A stronger value pattern that makes the main shapes easier to read from across the room.",
          quiltType,
          layoutJson: { ...layoutJson, assignments: assignments.map((id, index) => index % 2 === 0 ? id : body.fabricIds[0] ?? id) },
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

export default router;