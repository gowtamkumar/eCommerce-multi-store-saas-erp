import UserList from "@/features/system/components/UserList";
import { fetchSuperAdminAPI } from "@/services/supperAdminApi";

async function getUsersData() {
  try {
    const res = await fetchSuperAdminAPI('/super-admin/users?page=1&limit=10');
    return {
      users: res.data?.users || [],
      pagination: res.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  } catch (error) {
    console.error("Error fetching global users:", error);
    return { users: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
  }
}

export default async function GlobalUsersPage() {
  const { users, pagination } = await getUsersData();

  return (
    <UserList initialUsers={users} initialPagination={pagination} />
  );
}
