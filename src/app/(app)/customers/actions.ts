"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CustomerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().optional().default(""),
  type: z.enum(["individual", "company"]).default("individual"),
  address: z.string().trim().optional().default(""),
});

export async function createCustomer(formData: FormData) {
  const parsed = CustomerSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    type: formData.get("type"),
    address: formData.get("address"),
  });

  if (!parsed.success) {
    // In a fuller build we'd surface this via useActionState; keep simple here.
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert({
    name: parsed.data.name,
    phone: parsed.data.phone || null,
    type: parsed.data.type,
    address: parsed.data.address || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/customers");
  redirect("/customers");
}
