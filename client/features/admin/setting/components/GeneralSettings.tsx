import { motion } from "framer-motion";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
export default function GeneralSettings({ formData, setFormData }: { formData: any, setFormData: any }) {
  return (
    <motion.div
      key="general"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-5 h-5 text-brand-600" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          General Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Logo URL
          </label>
          <div className="flex gap-4 items-center">
            {formData.logo && (
              <img
                src={formData.logo}
                alt="Logo"
                className="w-16 h-16 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-white"
              />
            )}
            <input
              type="text"
              value={formData.logo}
              onChange={(e) =>
                setFormData({ ...formData, logo: e.target.value })
              }
              className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Brand Name
          </label>
          <input
            type="text"
            value={formData.brandName}
            onChange={(e) =>
              setFormData({
                ...formData,
                brandName: e.target.value,
              })
            }
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
            placeholder="e.g., LuxeAudio"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Site Description
          </label>
          <textarea
            rows={3}
            value={formData.siteDescription}
            onChange={(e) =>
              setFormData({
                ...formData,
                siteDescription: e.target.value,
              })
            }
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 resize-none"
            placeholder="Tell us about your store..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" /> Contact
            Email
          </label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactEmail: e.target.value,
              })
            }
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
            placeholder="support@example.com"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" /> Contact
            Phone
          </label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) =>
              setFormData({
                ...formData,
                contactPhone: e.target.value,
              })
            }
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" /> WhatsApp
            Phone
          </label>
          <input
            type="tel"
            value={formData.whatsappPhone}
            onChange={(e) =>
              setFormData({
                ...formData,
                whatsappPhone: e.target.value,
              })
            }
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" /> Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: e.target.value,
              })
            }
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200"
            placeholder="123 Store St, Sound City"
          />
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400" /> Robots.txt
          </label>
          <textarea
            rows={5}
            value={formData.robotsTxt}
            onChange={(e) =>
              setFormData({
                ...formData,
                robotsTxt: e.target.value,
              })
            }
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 hover:border-brand-500/50 outline-none transition-all duration-200 resize-none font-mono text-sm"
            placeholder="User-agent: *
Disallow: /admin"
          />
        </div>
      </div>
    </motion.div>
  )
}