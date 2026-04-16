import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { UsersClient } from "./UsersClient";

async function getUsers() {
  await connectDB();
  return User.find()
    .select("name email role isActive department position createdAt lastLogin") 
    .sort({ createdAt: -1 })
    .lean();
}

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const users = await getUsers();

  return <UsersClient initialUsers={JSON.parse(JSON.stringify(users))} />;
}
