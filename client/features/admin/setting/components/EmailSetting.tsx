"use client";

import { motion } from "framer-motion";
import { SMTPCredentialsSection, SMTPServerSection, SenderIdentitySection } from "./EmailSections";

export const EmailSetting = ({ formData, setFormData }: any) => {
    return (
        <motion.div
            key="email"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-10"
        >
            <SMTPServerSection
                smtp={formData.smtp}
                setFormData={setFormData}
                formData={formData}
            />

            <SMTPCredentialsSection
                smtp={formData.smtp}
                setFormData={setFormData}
                formData={formData}
            />

            <SenderIdentitySection
                smtp={formData.smtp}
                setFormData={setFormData}
                formData={formData}
            />
        </motion.div>
    );
};