import { z } from "zod";
import { InfraiClient } from "./infrai-client.ts";

export const imageTaskSchema = z.object({
  tenantId: z.string().min(1),
  accountId: z.string().min(1),
  assetId: z.string().min(1),
  sourceImage: z.string().min(1),
  filename: z.string().min(1),
});
export type ImageTask = z.infer<typeof imageTaskSchema>;

export function chooseImageAction(task: ImageTask) {
  return task.filename.toLowerCase().endsWith(".png")
    ? { width: 1600, height: 900, format: "webp" }
    : { width: 1200, height: 800, format: "webp" };
}

export async function enqueueBacklog(tasks: ImageTask[], client: InfraiClient, queue = "course-image-backlog") {
  const accepted: string[] = [];
  for (const raw of tasks) {
    const task = imageTaskSchema.parse(raw);
    const result = await client.publish({ queue, payload: { ...task, jobId: `${task.tenantId}:${task.assetId}` } });
    accepted.push(result.message_id);
  }
  return { queue, accepted };
}

export async function processTask(task: ImageTask, client: InfraiClient) {
  const choice = chooseImageAction(task);
  return client.resize({ image: task.sourceImage, ...choice, fit: "contain", enlarge: false, store: true });
}

async function main() {
  const client = new InfraiClient();
  const uploaded = await client.upload({
    file: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    filename: "lesson-07-cover.png",
  });
  const task = imageTaskSchema.parse({
    tenantId: "acme-learning",
    accountId: "teacher-42",
    assetId: "lesson-07-cover",
    sourceImage: uploaded.id,
    filename: "lesson-07-cover.png",
  });
  console.log(await enqueueBacklog([task], client));
  console.log(await processTask(task, client));
}

if (import.meta.url === `file://${process.argv[1]}`) void main();
