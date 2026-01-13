import UserList from "@/components/super-admin/UserList";
import { fetchAPI } from "@/lib/api";

async function getUsers() {
  try {
    const res = await fetchAPI('/super-admin/users');
    return res.users || res.data?.users || [];
  } catch (error) {
    console.error("Error fetching global users:", error);
    return [];
  }
}

export default async function GlobalUsersPage() {
  const users = await getUsers();

  return (
    <UserList initialUsers={users} />
  );
}
