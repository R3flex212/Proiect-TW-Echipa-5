import fetch from "node-fetch";
import { env } from "../config/env.js";

export async function getNowISO() {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 1500);
    const resp = await fetch(env.timeApiUrl, { signal: controller.signal });
    clearTimeout(t);

    if (!resp.ok) throw new Error("Eroare time API");
    const data = await resp.json();
    return data.datetime || data.dateTime || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function getNowDate() {
  return new Date(await getNowISO());
}
