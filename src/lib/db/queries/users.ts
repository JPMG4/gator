import { eq } from "drizzle-orm";
import { users } from "../schema";
import { db } from "..";

export async function createUser(name: string) {
  const [result] = await db
    .insert(users)
    .values({ name })
    .returning();
  return result;
}

export async function getUserByName(name: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.name, name));

  if (!result) {
    throw new Error("User not found");
  }

  return result;
}

export async function deleteUsers() {
  await db
    .delete(users)
}


export async function getUsers() {
  const result = await db
    .select()
    .from(users);

  return result;
}

export async function getUserById(id: string) {
  const [result] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));

  if (!result) {
    throw new Error("User not found");
  }
  
  return result;
}