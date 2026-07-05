"use client";

import { useCallback, useEffect, useState } from "react";
import type { Permission, Role } from "../types";

export function useRolesDashboard() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<
    Record<string, Permission[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { fetchAPI } = await import("@/services/api");
      const [rolesRes, permsRes] = await Promise.all([
        fetchAPI("/rbac/roles"),
        fetchAPI("/rbac/permissions/grouped"),
      ]);
      if (rolesRes?.data) setRoles(rolesRes.data);
      if (permsRes?.data) setGroupedPermissions(permsRes.data);
    } catch (err) {
      console.error("Failed to load roles and permissions", err);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleOpenCreate = useCallback(() => {
    setEditingRole(null);
    setShowModal(true);
  }, []);

  const handleOpenEdit = useCallback((role: Role) => {
    setEditingRole(role);
    setShowModal(true);
  }, []);

  const handleDelete = useCallback(
    async (roleId: string) => {
      if (
        !confirm(
          "Are you sure you want to delete this custom role? This will orphan any users assigned to it.",
        )
      )
        return;
      try {
        const { fetchAPI } = await import("@/services/api");
        await fetchAPI(`/rbac/roles/${roleId}`, { method: "DELETE" });
        void fetchData();
      } catch (err) {
        console.error("Failed to delete role", err);
      }
    },
    [fetchData],
  );

  return {
    roles,
    groupedPermissions,
    loading,
    showModal,
    setShowModal,
    editingRole,
    setEditingRole,
    fetchData,
    handleOpenCreate,
    handleOpenEdit,
    handleDelete,
  };
}
