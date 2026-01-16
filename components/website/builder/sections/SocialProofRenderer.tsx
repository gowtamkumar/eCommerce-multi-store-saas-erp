'use client';
import { Star } from 'lucide-react';
import Image from 'next/image';

const SocialProofRenderer = ({ section }: { section: any }) => {
    const { noun, count, rating, avatars } = section.content;

    // Parse avatars if it's a string (legacy) or ensure it's array
    const avatarList = Array.isArray(avatars) ? avatars : (typeof avatars === 'string' ? avatars.split(',') : []);

    return (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="flex -space-x-4">
                {(avatarList.length > 0 ? avatarList : [1, 2, 3, 4]).map((avatar: string | number, i: number) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-sm">
                        <Image
                            src={typeof avatar === 'string' ? avatar : `https://i.pravatar.cc/150?img=${Number(avatar) + 10}`}
                            alt="User"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-5 h-5 ${i < (rating || 5) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                    ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                    Trusted by <span className="text-slate-900 dark:text-white font-bold">{count?.toLocaleString() || '2,000'}+</span> {noun || 'happy customers'}
                </p>
            </div>
        </div>
    );
};

export default SocialProofRenderer;
