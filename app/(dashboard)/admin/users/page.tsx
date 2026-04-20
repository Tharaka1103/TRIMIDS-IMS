import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Department from "@/models/Department";
import { UsersClient } from "./UsersClient";

async function getUsers() {
  await connectDB();
  return User.find()
    .select("name email role isActive department position createdAt lastLogin") 
    .sort({ createdAt: -1 })
    .lean();
}

async function getDepartments() {
  await connectDB();
  return Department.find()
    .select("name _id")
    .sort({ name: 1 })
    .lean();
}

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const users = await getUsers();
  const departments = await getDepartments();

  return <UsersClient initialUsers={JSON.parse(JSON.stringify(users))} departments={JSON.parse(JSON.stringify(departments))} />;
}
