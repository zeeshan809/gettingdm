"use server";

import { revalidatePath } from "next/cache";
import { getCurrentCreator } from "@/lib/auth";
import { disconnectInstagram } from "@/lib/instagram";

export async function disconnect() {
  const creator = await getCurrentCreator();
  await disconnectInstagram(creator.id);
  revalidatePath("/", "layout");
}
