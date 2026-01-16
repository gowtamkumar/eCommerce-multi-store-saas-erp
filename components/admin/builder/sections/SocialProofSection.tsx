
'use client';

interface SocialProofSectionProps {
    content: any;
    onChange: (content: any) => void;
}

export default function SocialProofSection({ content, onChange }: SocialProofSectionProps) {
    const styles = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all";

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Noun</label>
                    <input
                        value={content.noun || ''}
                        onChange={(e) => onChange({ ...content, noun: e.target.value })}
                        className={styles}
                        placeholder="e.g. customers"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Count</label>
                    <input
                        type="number"
                        value={content.count || 2000}
                        onChange={(e) => onChange({ ...content, count: Number(e.target.value) })}
                        className={styles}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Review Rating</label>
                <input
                    type="number"
                    step="0.1"
                    max="5"
                    value={content.rating || 5}
                    onChange={(e) => onChange({ ...content, rating: Number(e.target.value) })}
                    className={styles}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Avatar URLs (Comma Separated)</label>
                <textarea
                    value={content.avatars || ''}
                    onChange={(e) => onChange({ ...content, avatars: e.target.value })}
                    className={styles}
                    rows={3}
                    placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
                />
            </div>
        </div>
    );
}
