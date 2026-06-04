"use client";

import { useEffect, useState } from "react";
import { UserRole } from "@/lib/enums/user-role.enum";
import { UserStatus } from "@/lib/enums/user-status.enum";
import { fetchAPI } from "@/services/api";
import type { User } from "../type";

interface UseCustomerFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: User | null;
}

export function useCustomerForm({ isOpen, onClose, onSubmit, initialData }: UseCustomerFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<"basic" | "b2b">("basic");
    const [priceBooks, setPriceBooks] = useState<any[]>([]);
    const [priceBooksLoading, setPriceBooksLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
        phone: "",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        // B2B fields
        companyName: "",
        customerCode: "",
        taxId: "",
        creditLimit: 0,
        creditHold: false,
        priceBookCode: "",
    });

    const loadPriceBooks = async () => {
        try {
            setPriceBooksLoading(true);
            const res = await fetchAPI("/pricing/price-books");
            if (res.success) {
                setPriceBooks(res.data || []);
            }
        } catch (err) {
            console.error("Failed to load price books in CustomerForm", err);
        } finally {
            setPriceBooksLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            void loadPriceBooks();
        }
    }, [isOpen]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                email: initialData.email || "",
                username: initialData.username || "",
                password: "",
                phone: initialData.phone || "",
                role: (initialData.role as UserRole) || UserRole.USER,
                status: (initialData.status as UserStatus) || UserStatus.ACTIVE,
                companyName: initialData.companyName || "",
                customerCode: initialData.customerCode || "",
                taxId: initialData.taxId || "",
                creditLimit: Number(initialData.creditLimit || 0),
                creditHold: initialData.creditHold || false,
                priceBookCode: (initialData as any).priceBookCode || "",
            });
        } else {
            setFormData({
                name: "",
                email: "",
                username: "",
                password: "",
                phone: "",
                role: UserRole.USER,
                status: UserStatus.ACTIVE,
                companyName: "",
                customerCode: "",
                taxId: "",
                creditLimit: 0,
                creditHold: false,
                priceBookCode: "",
            });
        }
        setActiveTab("basic");
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Submit handling failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    return {
        submitting,
        showPassword,
        setShowPassword,
        activeTab,
        setActiveTab,
        priceBooks,
        priceBooksLoading,
        formData,
        setFormData,
        handleSubmit,
    };
}
