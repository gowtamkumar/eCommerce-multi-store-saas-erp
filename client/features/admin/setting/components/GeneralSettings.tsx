"use client";

import { motion } from "framer-motion";
import { BrandIdentitySection, ContactSection, SEOSection } from "./SettingsSections";

export default function GeneralSettings({ formData, setFormData }: { formData: any, setFormData: any }) {
  return (
    <motion.div
      key="general"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-10"
    >
      <BrandIdentitySection formData={formData} setFormData={setFormData} />

      <ContactSection formData={formData} setFormData={setFormData} />

      <SEOSection formData={formData} setFormData={setFormData} />
    </motion.div>
  )
}