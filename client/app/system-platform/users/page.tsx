import UserList from "@/features/system-platform/components/UserList";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";

async function getUsers() {
  try {
    const res = await fetchSuperAdminAPI('/super-admin/users');
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
