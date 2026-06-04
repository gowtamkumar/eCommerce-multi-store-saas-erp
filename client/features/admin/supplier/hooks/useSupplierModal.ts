"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/services/api";
import { Supplier } from "../types";
import toast from "react-hot-toast";

interface UseSupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    supplier?: Supplier;
}

export function useSupplierModal({ isOpen, onClose, onSuccess, supplier }: UseSupplierModalProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        contactName: "",
        email: "",
        phone: "",
        address: "",
        category: "",
        rating: 5,
        leadTimeDays: 0,
        isActive: true,
    });

    useEffect(() => {
        if (isOpen) {
            const loadCategories = async () => {
                try {
                    const res = await fetchAPI("/categories");
                    if (res && res.data) {
                        setCategories(res.data);
                    }
                } catch (error) {
                    console.error("Failed to load categories:", error);
                }
            };
            void loadCategories();
        }
    }, [isOpen]);

    useEffect(() => {
        if (supplier) {
            setFormData({
                name: supplier.name || "",
                code: supplier.code || "",
                contactName: supplier.contactName || "",
                email: supplier.email || "",
                phone: supplier.phone || "",
                address: supplier.address || "",
                category: supplier.category?.id || (supplier as any).categoryId || "",
                rating: typeof supplier.rating === "number" ? supplier.rating : Number(supplier.rating || 5),
                leadTimeDays: typeof supplier.leadTimeDays === "number" ? supplier.leadTimeDays : Number(supplier.leadTimeDays || 0),
                isActive: typeof supplier.isActive === "boolean" ? supplier.isActive : (supplier.isActive !== false),
            });
        } else {
            setFormData({
                name: "",
                code: "",
                contactName: "",
                email: "",
                phone: "",
                address: "",
                category: "",
                rating: 5,
                leadTimeDays: 0,
                isActive: true,
            });
        }
    }, [supplier, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = supplier ? `/suppliers/${supplier.id}` : "/suppliers";
            const method = supplier ? "PATCH" : "POST";

            const payload = {
                ...formData,
                rating: Number(formData.rating),
                leadTimeDays: parseInt(String(formData.leadTimeDays), 10) || 0,
                isActive: Boolean(formData.isActive),
            };

            await fetchAPI(url, {
                method,
                body: JSON.stringify(payload),
            });

            toast.success(`Supplier ${supplier ? "updated" : "created"} successfully`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error saving supplier:", error);
            toast.error("Failed to save supplier");
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        categories,
        formData,
        setFormData,
        handleSubmit,
    };
}
