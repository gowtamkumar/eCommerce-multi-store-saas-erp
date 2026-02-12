'use client';

import { TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

type Language = 'en' | 'bn';

export default function Documentation() {
    const [activeSection, setActiveSection] = useState('intro');
    const [lang, setLang] = useState<Language>('en');

    // Scroll spy effect to highlight active sidebar link
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('section');
            let current = '';
            sections.forEach((section) => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id') || '';
                }
            });
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        // Trigger once on mount
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
        }
    };

    const NavButton = ({ id, label }: { id: string, label: string }) => (
        <button
            onClick={() => scrollToSection(id)}
            className={`w-full text-left px-3 py-1.5 text-sm transition-colors rounded-lg mb-1 ${activeSection === id
                ? 'font-bold text-brand-600 bg-brand-50 dark:text-brand-400 dark:bg-brand-900/20'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
        >
            {label}
        </button>
    );

    const content = {
        en: {
            title: 'LuxeAudio Manual',
            version: 'Version 1.0.0',
            nav: {
                admin: 'Admin Modules',
                dashboard: 'Dashboard',
                leads: 'Leads & Inquiries',
                payments: 'Payment History',
                products: 'Product Management',
                orders: 'Order System',
                customers: 'Customer Management',
                media: 'Media Library',
                cms: 'CMS & Content',
                settings: 'Site Settings',
                store: 'Storefront',
                auth: 'Registration & Login',
                buying: 'Shopping Flow',
                account: 'User Accounts',
                support: 'Contact Support',
                troubleshoot: 'Troubleshooting',
                marketing: 'SEO & Marketing',
                localization: 'Localization',
                testimonials: 'Testimonials',
                faqs: 'FAQs'
            },
            dashboard: {
                title: 'Admin Dashboard',
                desc: 'Access your high-level command center at /admin.',
                statsTitle: 'Advanced Metrics',
                statsDesc: 'Track Total Sales, Active Orders, and Inventory count in real-time.',
                growthTitle: 'Sales Growth Tracking',
                growthDesc: 'Automatic calculation of monthly revenue growth percentage to monitor business performance.',
                chartTitle: 'Visual Analytics',
                chartDesc: 'Interactive 7-day sales overview chart for quick trend analysis.',
                actionsTitle: 'Actionable Inisghts',
                actionsDesc: 'Identify pending orders that require immediate attention directly from the overview.'
            },
            marketing: {
                title: 'SEO & Marketing',
                desc: 'Optimize your store for search engines and track user behavior.',
                list: [
                    { label: 'Google Analytics', desc: 'Integrated support for GA4 (G-XXXXXXXXXX) to track detailed visitor behavior and conversion rates.' },
                    { label: 'Facebook Pixel', desc: 'Ready-to-use Meta Pixel integration for tracking events and optimizing ad campaigns.' },
                    { label: 'Robots & Sitemaps', desc: 'Automated generation of sitemap.xml and robots.txt for maximum search visibility.' },
                    { label: 'Dynamic Meta Tags', desc: 'Update Brand Name and Site Description in settings to instantly refresh SEO tags across all pages.' }
                ]
            },
            leads: {
                title: 'Leads & Inquiries',
                desc: 'Manage potential customers who reach out via the contact form.',
                list: [
                    { label: 'Status Tracking', desc: 'Mark inquiries as New, Read, or Replied to maintain organized communication.' },
                    { label: 'Data Export', desc: 'One-click CSV export of all lead data for offline CRM integration.' },
                    { label: 'Search & Filter', desc: 'Quickly locate specific messages using powerful search and status filters.' }
                ]
            },
            payments: {
                title: 'Payment History',
                desc: 'A comprehensive log of all financial transactions.',
                list: [
                    { label: 'Transaction IDs', desc: 'Secure tracking of SSLCOMMERZ transaction references for verification.' },
                    { label: 'Method Breakdown', desc: 'Clear distinction between Cash on Delivery and Online Payment records.' },
                    { label: 'Status Monitoring', desc: 'Real-time updates on payment success or pending status.' }
                ]
            },
            products: {
                title: 'Product Management',
                stepsTitle: 'Creating a Product',
                steps: [
                    { title: 'New Product', desc: 'Click the "New Product" button in the top right.' },
                    { title: 'General Info', desc: 'Fill in the Name, Description, and Base Price of the item.' },
                    { title: 'Discounts & Sales', desc: 'Use the Discount Amount field to set a reduction (e.g., $20). This automatically triggers a "Sale" badge on the storefront.' },
                    { title: 'Media', desc: 'Drag and drop multiple high-quality images. The first image becomes the thumbnail.' }
                ],
                actionsTitle: 'Advanced Management',
                actions: [
                    { title: 'Review Moderation', desc: 'Click the "View Details" (Eye) icon to manage customer feedback, ratings, and approval status for a specific product.' },
                    { title: 'Status Toggle', desc: 'Quickly switch products between Active and Inactive states directly from the list.' }
                ]
            },
            orders: {
                title: 'Order System',
                statusTitle: 'Status Workflow',
                statuses: [
                    { label: 'Pending', desc: 'New order, payment unconfirmed.' },
                    { label: 'Processing', desc: 'Payment confirmed, packing.' },
                    { label: 'Shipped', desc: 'Handed over to courier.' },
                    { label: 'Delivered', desc: 'Order completed.' }
                ],
                actionsTitle: 'Actions',
                actions: [
                    { title: 'View Details', desc: 'Click the eye icon to see full address, item breakdown, and pricing snapshots.' },
                    { title: 'Print Invoice', desc: 'Use the browser print function on the detail page for a printer-friendly invoice.' }
                ]
            },
            customers: {
                title: 'Customer Management',
                desc: 'View and manage your registered user base.',
                list: [
                    { label: 'Search', desc: 'Quickly find users by name, email, or order ID.' },
                    { label: 'History', desc: 'View lifetime spend and total order count per customer.' },
                    { label: 'Access', desc: 'Ban or block problematic users if necessary.' },
                    { label: 'Feedback Curation', desc: 'Review messages from support channels or product reviews to build social proof.' }
                ]
            },
            media: {
                title: 'Media Library',
                desc: 'A centralized hub for all visual assets.',
                list: [
                    { label: 'Upload', desc: 'Drag & drop support for bulk uploads.' },
                    { label: 'Search', desc: 'Filter images by filename.' },
                    { label: 'Cleanup', desc: 'Delete unused assets to save storage space.' }
                ]
            },
            cms: {
                title: 'CMS & Content',
                sections: [
                    { title: 'Pages', desc: 'Create custom pages like "About Us" or "Privacy Policy" using the built-in rich text editor.' },
                    { title: 'Testimonials', desc: 'Curate customer reviews for the home page. You can manually add reviews or approve user-submitted ones.' },
                    { title: 'FAQs', desc: 'Build a knowledge base by creating and categorizing Frequently Asked Questions.' }
                ]
            },
            settings: {
                title: 'Site Settings',
                desc: 'Configure global variables directly from the UI.',
                items: [
                    { label: 'Identity', val: 'Brand Name, Logo' },
                    { label: 'SEO', val: 'Default Title, Meta Description' },
                    { label: 'Social', val: 'Facebook, Twitter, Instagram Links' },
                    { label: 'Contact', val: 'Footer Address, Phone, Email' },
                    { label: 'Marketing', val: 'GA4 ID, Meta Pixel ID' }
                ]
            },
            localization: {
                title: 'Localization & Currencies',
                desc: 'Configure multiple currencies and set exchange rates.',
                list: [
                    { label: 'Base Currency', desc: 'Set the primary currency for your store (e.g., USD or BDT).' },
                    { label: 'Multi-Currency', desc: 'Add multiple currencies and define their symbols and rates relative to the base currency.' },
                    { label: 'Auto-Symbol', desc: 'The system automatically updates price displays across the storefront based on the selected currency.' }
                ]
            },
            testimonials: {
                title: 'Testimonials & Reviews',
                desc: 'Build trust by showcasing authentic customer experiences.',
                list: [
                    { label: 'Manual Entry', desc: 'Create and edit testimonials manually via the admin panel.' },
                    { label: 'User Reviews', desc: 'Manage reviews submitted by registered customers on product pages.' },
                    { label: 'Moderation', desc: 'Approve or reject reviews before they appear on the storefront to maintain quality.' }
                ]
            },
            faqs: {
                title: 'Frequently Asked Questions',
                desc: 'Build a comprehensive knowledge base for your customers.',
                list: [
                    { label: 'Categories', desc: 'Organize FAQs into logical categories (e.g., Shipping, Returns, Payments).' },
                    { label: 'Rich Text', desc: 'Use the built-in editor to provide detailed, formatted answers.' },
                    { label: 'Storefront Display', desc: 'FAQs are automatically categorized and presented in a clean, interactive accordion layout.' }
                ]
            },
            store: {
                title: 'Conversion-Focused Experience',
                steps: [
                    { label: 'Cinematic Showcase', desc: 'The landing page uses high-impact visuals and animations to showcase a single premium product.' },
                    { label: 'Direct Purchase', desc: 'A secure, glassmorphic checkout modal allows users to buy instantly without leaving the page.' },
                    { label: 'Order Confirmation', desc: 'Immediate confirmation with digital invoice generation for every successful purchase.' },
                    { label: 'Payment Gateway', desc: 'Supports Cash on Delivery and secure online payments via SSLCOMMERZ.' }
                ]
            },
            account: {
                title: 'User Accounts',
                desc: 'Registered users get a personal dashboard to manage their experience.',
                list: [
                    { label: 'Order History', desc: 'Track all your purchases, check status, and download digital invoices.' },
                    { label: 'Profile Management', desc: 'Update your name, email, and shipping address for faster future checkouts.' },
                    { label: 'Security', desc: 'Manage your password and secure your account with built-in authentication.' },
                    { label: 'Sharing Feedback', desc: 'To share your experience, use the Contact Support form. Selected reviews are featured on product pages as Verified Purchases.' }
                ]
            },
            auth: {
                title: 'Registration & Login',
                desc: 'Access exclusive features by creating a secure account.',
                steps: [
                    { title: 'Create Account', desc: 'Visit the /register page and provide your basic details. Ensure you use a strong password.' },
                    { title: 'Secure Login', desc: 'Use your registered email and password to access your personal dashboard.' },
                    { title: 'Forgot Password?', desc: 'Use the recovery link on the login page to reset your password via email instructions.' }
                ]
            },
            support: {
                title: 'Contact Support',
                desc: 'Need help? Our team is available to assist you.',
                list: [
                    { label: 'Direct Message', desc: 'Use the Contact page form for direct inquiries. Our team monitors this 24/7.' },
                    { label: 'Order Assistance', desc: 'For issues with a specific order, please include your Order ID for faster service.' },
                    { label: 'Response Time', desc: 'We typically respond to all inquiries within 1-2 business days.' }
                ]
            },
            troubleshoot: {
                title: 'Troubleshooting & FAQ',
                desc: 'Quick answers to common questions and technical issues.',
                items: [
                    { q: 'Login Issues', a: 'Ensure Caps Lock is off and your email is entered correctly. Clear browser cache if persistent.' },
                    { q: 'Order Tracking', a: 'Once an order is placed, you can track its progress in your Account Dashboard under "Recent Orders".' },
                    { q: 'Payment Errors', a: "If an online payment fails, check your balance or contact your bank. You can always opt for Cash on Delivery." },
                    { q: 'Return Policy', a: 'If you receive a faulty product, contact support within 7 days for a return or replacement.' }
                ]
            }
        },
        bn: {
            title: 'LuxeAudio ম্যানুয়াল',
            version: 'ভার্সন ১.০.০',
            nav: {
                admin: 'অ্যাডমিন মডিউল',
                dashboard: 'ড্যাশবোর্ড',
                leads: 'লিডস ও ইনকোয়ারি',
                payments: 'পেমেন্ট হিস্ট্রি',
                products: 'প্রোডাক্ট ম্যানেজমেন্ট',
                orders: 'অর্ডার সিস্টেম',
                customers: 'কাস্টমার ম্যানেজমেন্ট',
                media: 'মিডিয়া লাইব্রেরি',
                cms: 'CMS ও কন্টেন্ট',
                settings: 'সাইট সেটিংস',
                store: 'স্টোরফ্রন্ট',
                auth: 'রেজিস্ট্রেশন ও লগইন',
                buying: 'কেনাকাটার ধাপ',
                account: 'ইউজার অ্যাকাউন্ট',
                support: 'যোগাযোগ ও সাপোর্ট',
                troubleshoot: 'সমস্যা সমাধান',
                marketing: 'এসইও ও মার্কেটিং',
                localization: 'লোকালাইজেশন',
                testimonials: 'টেস্টিমোনিয়াল',
                faqs: 'FAQs'
            },
            dashboard: {
                title: 'অ্যাডমিন ড্যাশবোর্ড',
                desc: '/admin রুটে আপনার হাই-লেভেল কমান্ড সেন্টারে প্রবেশ করুন।',
                statsTitle: 'অ্যাডভান্সড মেট্রিক্স',
                statsDesc: 'রিয়েল-টাইমে মোট বিক্রয়, সক্রিয় অর্ডার এবং ইনভেন্টরি সংখ্যা ট্র্যাক করুন।',
                growthTitle: 'সেলস গ্রোথ ট্র্যাকিং',
                growthDesc: 'ব্যবসায়িক পারফরম্যান্স মনিটর করার জন্য মাসিক আয়ের বৃদ্ধির হার স্বয়ংক্রিয়ভাবে গণনা করা হয়।',
                chartTitle: 'ভিজ্যুয়াল অ্যানালিটিক্স',
                chartDesc: 'দ্রুট ট্রেন্ড বিশ্লেষণের জন্য ইন্টারেক্টিভ ৭-দিনের সেলস ওভারভিউ চার্ট।',
                actionsTitle: 'অ্যাকশনেবল ইনসাইটস',
                actionsDesc: 'ওভারভিউ থেকে সরাসরি সেইসব পেন্ডিং অর্ডারগুলি চিহ্নিত করুন যেগুলোতে অবিলম্বে মনোযোগ দেওয়া প্রয়োজন।'
            },
            marketing: {
                title: 'এসইও ও মার্কেটিং',
                desc: 'সার্চ ইঞ্জিনের জন্য আপনার স্টোর অপ্টিমাইজ করুন এবং ভিজিটরদের আচরণ ট্র্যাক করুন।',
                list: [
                    { label: 'গুগল অ্যানালিটিক্স', desc: 'বিস্তারিত ভিজিটর বিহেভিয়ার এবং কনভার্সন রেট ট্র্যাক করতে GA4 (G-XXXXXXXXXX) সাপোর্ট।' },
                    { label: 'ফেসবুক পিক্সেল', desc: 'ইভেন্ট ট্র্যাকিং এবং অ্যাড ক্যাম্পেইন অপ্টিমাইজ করার জন্য রেডি-টু-ইউজ মেটা পিক্সেল ইন্টিগ্রেশন।' },
                    { label: 'রোবটস ও সাইটম্যাপ', desc: 'সর্বোচ্চ সার্চ ভিজিবিলিটির জন্য sitemap.xml এবং robots.txt স্বয়ংক্রিয়ভাবে জেনারেট করা হয়।' },
                    { label: 'ডায়নামিক মেটা ট্যাগ', desc: 'সেটিংস থেকে ব্র্যান্ডের নাম এবং সাইটের বিবরণ আপডেট করলে সমস্ত পেজের এসইও ট্যাগ সাথে সাথে আপডেট হয়ে যায়।' }
                ]
            },
            leads: {
                title: 'লিডস ও ইনকোয়ারি',
                desc: 'কন্টাক্ট ফর্মের মাধ্যমে যারা যোগাযোগ করেন তাদের ম্যানেজ করুন।',
                list: [
                    { label: 'স্ট্যাটাস ট্র্যাকিং', desc: 'যোগাযোগ ব্যবস্থা সুশৃঙ্খল রাখতে ইনকোয়ারিগুলোকে New, Read, বা Replied হিসেবে চিহ্নিত করুন।' },
                    { label: 'ডেটা এক্সপোর্ট', desc: 'অফলাইন সিআরএম ইন্টিগ্রেশনের জন্য সমস্ত লিড ডেটা ওয়ান-ক্লিক সিএসভি এক্সপোর্ট।' },
                    { label: 'সার্চ ও ফিল্টার', desc: 'পাওয়ারফুল সার্চ এবং স্ট্যাটাস ফিল্টার ব্যবহার করে দ্রুত নির্দিষ্ট মেসেজ খুঁজুন।' }
                ]
            },
            payments: {
                title: 'পেমেন্ট হিস্ট্রি',
                desc: 'সমস্ত আর্থিক লেনদেনের একটি বিস্তারিত লগ।',
                list: [
                    { label: 'ট্রানজেকশন আইডি', desc: 'ভেরিফিকেশনের জন্য SSLCOMMERZ ট্রানজেকশন রেফারেন্সের সিকিউর ট্র্যাকিং।' },
                    { label: 'মেথড ব্রেকডাউন', desc: 'ক্যাশ অন ডেলিভারি এবং অনলাইন পেমেন্ট রেকর্ডের মধ্যে স্পষ্ট পার্থক্য।' },
                    { label: 'স্ট্যাটাস মনিটরিং', desc: 'পেমেন্ট সফল বা পেন্ডিং স্ট্যাটাসের রিয়েল-টাইম আপডেট।' }
                ]
            },
            products: {
                title: 'প্রোডাক্ট ম্যানেজমেন্ট',
                stepsTitle: 'নতুন প্রোডাক্ট তৈরি',
                steps: [
                    { title: 'নতুন প্রোডাক্ট', desc: 'উপরে ডানদিকে "New Product" বাটনে ক্লিক করুন।' },
                    { title: 'সাধারণ তথ্য', desc: 'প্রোডাক্টের নাম, বিবরণ এবং মূল দাম পূরণ করুন।' },
                    { title: 'ডিসকাউন্ট ও অফার', desc: 'Discount Amount ফিল্ড ব্যবহার করে ছাড় নির্ধারণ করুন (যেমন, $20)। এটি স্বয়ংক্রিয়ভাবে স্টোরফ্রন্টে "Sale" ব্যাজ দেখাবে।' },
                    { title: 'মিডিয়া', desc: 'একাধিক হাই-কোয়ালিটি ছবি ড্র্যাগ এবং ড্রপ করুন। প্রথম ছবিটি থাম্বনেইল হিসেবে ব্যবহৃত হবে।' }
                ],
                actionsTitle: 'অ্যাডভান্সড ম্যানেজমেন্ট',
                actions: [
                    { title: 'রিভিউ মডারেশন', desc: 'নির্দিষ্ট প্রোডাক্টের কাস্টমার ফিডব্যাক, রেটিং এবং অ্যাপ্রুভাল স্ট্যাটাস ম্যানেজ করতে "View Details" (Eye) আইকনে ক্লিক করুন।' },
                    { title: 'স্ট্যাটাস টগল', desc: 'লিস্ট থেকে সরাসরি প্রোডাক্টগুলোকে Active এবং Inactive এর মধ্যে পরিবর্তন করুন।' }
                ]
            },
            orders: {
                title: 'অর্ডার সিস্টেম',
                statusTitle: 'স্ট্যাটাস ওয়ার্কফ্লো',
                statuses: [
                    { label: 'Pending', desc: 'নতুন অর্ডার, পেমেন্ট নিশ্চিত করা হয়নি।' },
                    { label: 'Processing', desc: 'পেমেন্ট নিশ্চিত, প্যাকিং চলছে।' },
                    { label: 'Shipped', desc: 'কুরিয়ারে হস্তান্তর করা হয়েছে।' },
                    { label: 'Delivered', desc: 'অর্ডার সম্পন্ন হয়েছে।' }
                ],
                actionsTitle: 'অ্যাকশন',
                actions: [
                    { title: 'বিস্তারিত দেখুন', desc: 'আই আইকনে ক্লিক করে সম্পূর্ণ ঠিকানা, আইটেম তালিকা এবং মূল্যের বিবরণ দেখুন।' },
                    { title: 'ইনভয়েস প্রিন্ট', desc: 'ডিটেইলস পেজে ব্রাউজারের প্রিন্ট ফাংশন ব্যবহার করে ইনভয়েস প্রিন্ট করুন।' }
                ]
            },
            customers: {
                title: 'কাস্টমার ম্যানেজমেন্ট',
                desc: 'আপনার নিবন্ধিত ব্যবহারকারীদের তালিকা দেখুন এবং পরিচালনা করুন।',
                list: [
                    { label: 'অনুসন্ধান', desc: 'নাম, ইমেইল বা অর্ডার আইডি দিয়ে ব্যবহারকারী খুঁজুন।' },
                    { label: 'ইতিহাস', desc: 'প্রতি গ্রাহকের মোট ব্যয় এবং অর্ডারের সংখ্যা দেখুন।' },
                    { label: 'অ্যাক্সেস', desc: 'প্রয়োজনে কোন ব্যবহারকারীকে ব্যান বা ব্লক করুন।' },
                    { label: 'মতামত সংগ্রহ', desc: 'সাপোর্ট চ্যানেল বা প্রোডাক্ট রিভিউ থেকে সোশ্যাল প্রুফ তৈরির জন্য মেসেজগুলো দেখুন।' }
                ]
            },
            media: {
                title: 'মিডিয়া লাইব্রেরি',
                desc: 'আপনার সমস্ত ভিজ্যুয়াল অ্যাসেটের জন্য একটি কেন্দ্রীয় হাব।',
                list: [
                    { label: 'আপলোড', desc: 'ড্র্যাগ এবং ড্রপ করে একসাথে একাধিক ছবি আপলোড করুন।' },
                    { label: 'অনুসন্ধান', desc: 'ফাইলের নাম দিয়ে ছবি খুঁজুন।' },
                    { label: 'ক্লিনআপ', desc: 'স্টোরেজ স্পেস বাঁচাতে অপ্রয়োজনীয় ছবি ডিলিট করুন।' }
                ]
            },
            cms: {
                title: 'CMS ও কন্টেন্ট',
                sections: [
                    { title: 'পেজ', desc: '"About Us" বা "Privacy Policy" এর মতো কাস্টম পেজ তৈরি করুন।' },
                    { title: 'টেস্টিমোনিয়াল', desc: 'হোম পেজের জন্য গ্রাহকের রিভিউ নির্বাচন করুন। আপনি ম্যানুয়ালি রিভিউ যোগ করতে পারেন বা ব্যবহারকারীর জমা দেওয়া রিভিউ অনুমোদন করতে পারেন।' },
                    { title: 'FAQs', desc: 'সাপোর্ট পেজের জন্য প্রশ্ন ও উত্তর তৈরি এবং ক্যাটাগরাইজ করুন।' }
                ]
            },
            settings: {
                title: 'সাইট সেটিংস',
                desc: 'কোন কোড পরিবর্তন ছাড়াই গ্লোবাল ভেরিয়েবল কনফিগার করুন।',
                items: [
                    { label: 'পরিচয়', val: 'ব্র্যান্ডের নাম, লোগো' },
                    { label: 'SEO', val: 'ডিফল্ট টাইটেল, মেটা ডেসক্রিপশন' },
                    { label: 'সোশ্যাল', val: 'ফেসবুক, টুইটার, ইনস্টাগ্রাম লিঙ্ক' },
                    { label: 'যোগাযোগ', val: 'ফুটার ঠিকানা, ফোন, ইমেইল' },
                    { label: 'মার্কেটিং', val: 'GA4 ID, Meta Pixel ID' }
                ]
            },
            localization: {
                title: 'লোকালাইজেশন ও কারেন্সি',
                desc: 'একাধিক কারেন্সি কনফিগার করুন এবং এক্সচেঞ্জ রেট সেট করুন।',
                list: [
                    { label: 'বেস কারেন্সি', desc: 'আপনার স্টোরের প্রাথমিক কারেন্সি সেট করুন (যেমন, USD বা BDT)।' },
                    { label: 'মাল্টি-কারেন্সি', desc: 'একাধিক কারেন্সি যোগ করুন এবং বেস কারেন্সির বিপরীতে তাদের সিম্বল এবং রেট নির্ধারণ করুন।' },
                    { label: 'অটো-সিম্বল', desc: 'নির্বাচিত কারেন্সির উপর ভিত্তি করে সিস্টেম স্বয়ংক্রিয়ভাবে স্টোরফ্রন্টের দাম আপডেট করে।' }
                ]
            },
            testimonials: {
                title: 'টেস্টিমোনিয়াল ও রিভিউ',
                desc: 'নির্ভরযোগ্য কাস্টমার এক্সপেরিয়েন্স শেয়ার করে বিশ্বাসযোগ্যতা তৈরি করুন।',
                list: [
                    { label: 'ম্যানুয়াল এন্ট্রি', desc: 'অ্যাডমিন প্যানেলের মাধ্যমে ম্যানুয়ালি টেস্টিমোনিয়াল তৈরি এবং এডিট করুন।' },
                    { label: 'ইউজার রিভিউ', desc: 'প্রোডাক্ট পেজে رجسٹرিত গ্রাহকদের জমা দেওয়া রিভিউ ম্যানেজ করুন।' },
                    { label: 'মডারেশন', desc: 'কোয়ালিটি বজায় রাখতে রিভিউ পাবলিশ করার আগে অ্যাডমিন প্যানেল থেকে অনুমোদন করুন।' }
                ]
            },
            faqs: {
                title: 'সাধারণ জিজ্ঞাসা (FAQ)',
                desc: 'আপনার গ্রাহকদের জন্য একটি বিস্তারিত নলেজ বেস তৈরি করুন।',
                list: [
                    { label: 'ক্যাটাগরি', desc: 'FAQ গুলোকে শিপিং, রিটার্ন বা পেমেন্টের মতো লজিক্যাল ক্যাটাগরিতে সাজান।' },
                    { label: 'রিচ টেক্সট', desc: 'ডিটেইলস উত্তরের জন্য বিল্ট-ইন এডিটর ব্যবহার করুন।' },
                    { label: 'স্টোরফ্রন্ট ডিসপ্লে', desc: 'FAQ গুলো স্টোরফ্রন্টে একটি ইন্টারেক্টিভ অ্যাকর্ডিয়ন লেআউটে প্রদর্শিত হয়।' }
                ]
            },
            store: {
                title: 'কনভার্সন-ফোকাসড এক্সপেরিয়েন্স',
                steps: [
                    { label: 'সিনেমাটিক শোকেস', desc: 'ল্যান্ডিং পেজটি হাই-ইমপ্যাক্ট ভিজ্যুয়াল এবং অ্যানিমেশনের মাধ্যমে একটি প্রিমিয়াম প্রোডাক্ট উপস্থাপন করে।' },
                    { label: 'সরাসরি কেনাকাটা', desc: 'একটি সুরক্ষিত গ্লাসমরফিক চেকআউট মোডাল ব্যবহার করে পেজ না ছেড়েই সরাসরি কেনাকাটা করুন।' },
                    { label: 'অর্ডার কনফার্মেশন', desc: 'প্রতিটি সফল কেনাকাটার সাথে সাথে ডিজিটাল ইনভয়েস জেনারেশন এবং কনফার্মেশন।' },
                    { label: 'পেমেন্ট গেটওয়ে', desc: 'ক্যাশ অন ডেলিভারি এবং SSLCOMMERZ-এর মাধ্যমে সুরক্ষিত অনলাইন পেমেন্ট সাপোর্ট করে।' }
                ]
            },
            account: {
                title: 'ইউজার অ্যাকাউন্ট',
                desc: 'নিবন্ধিত ব্যবহারকারীরা তাদের অভিজ্ঞতা পরিচালনার জন্য একটি ব্যক্তিগত ড্যাশবোর্ড পাবেন।',
                list: [
                    { label: 'অর্ডারের ইতিহাস', desc: 'আপনার সমস্ত কেনাকাটা ট্র্যাক করুন, স্ট্যাটাস চেক করুন এবং ডিজিটাল ইনভয়েস ডাউনলোড করুন।' },
                    { label: 'প্রোফাইল ম্যানেজমেন্ট', desc: 'আপনার নাম, ইমেল এবং শিপিং এড্রেস আপডেট করুন যা ভবিষ্যতে দ্রুত চেকআউটে সাহায্য করবে।' },
                    { label: 'সিকিউরিটি', desc: 'আপনার পাসওয়ার্ড এবং অ্যাকাউন্ট নিরাপত্তা পরিচালনা করুন।' },
                    { label: 'মতামত শেয়ার', desc: 'আপনার অভিজ্ঞতা শেয়ার করতে কন্টাক্ট সাপোর্ট ফর্মটি ব্যবহার করুন। নির্বাচিত রিভিউগুলো "Verified Purchase" হিসেবে প্রোডাক্ট পেজে দেখানো হয়।' }
                ]
            },
            auth: {
                title: 'রেজিস্ট্রেশন ও লগইন',
                desc: ' একটি সুরক্ষিত অ্যাকাউন্ট তৈরি করে এক্সক্লুসিভ ফিচারগুলি অ্যাক্সেস করুন।',
                steps: [
                    { title: 'অ্যাকাউন্ট তৈরি', desc: '/register পেজে যান এবং আপনার প্রাথমিক তথ্য দিন। একটি শক্তিশালী পাসওয়ার্ড ব্যবহার নিশ্চিত করুন।' },
                    { title: 'সুরক্ষিত লগইন', desc: 'আপনার নিবন্ধিত ইমেল এবং পাসওয়ার্ড ব্যবহার করে ব্যক্তিগত ড্যাশবোর্ডে প্রবেশ করুন।' },
                    { title: 'পাসওয়ার্ড ভুলে গেছেন?', desc: 'ইমেল নির্দেশনার মাধ্যমে পাসওয়ার্ড রিসেট করতে লগইন পেজের রিকভারি লিঙ্কটি ব্যবহার করুন।' }
                ]
            },
            support: {
                title: 'যোগাযোগ ও সাপোর্ট',
                desc: 'সাহায্য প্রয়োজন? আমাদের টিম আপনাকে সহায়তা করার জন্য প্রস্তুত।',
                list: [
                    { label: 'সরাসরি মেসেজ', desc: 'সরাসরি অনুসন্ধানের জন্য কন্টাক্ট পেজ ফর্মটি ব্যবহার করুন। আমাদের টিম এটি ২৪/৭ মনিটর করে।' },
                    { label: 'অর্ডার সহায়তা', desc: 'নির্দিষ্ট অর্ডারের সমস্যার জন্য, দ্রুত পরিষেবার জন্য অনুগ্রহ করে আপনার অর্ডার আইডি উল্লেখ করুন।' },
                    { label: 'রেসপন্স টাইম', desc: 'আমরা সাধারণত ১-২ কার্যদিবসের মধ্যে সমস্ত অনুসন্ধানের উত্তর দিই।' }
                ]
            },
            troubleshoot: {
                title: 'সমস্যা সমাধান',
                desc: 'সাধারণ প্রশ্ন এবং প্রযুক্তিগত সমস্যার দ্রুত সমাধান।',
                items: [
                    { q: 'লগইন সমস্যা', a: 'ক্যাপস লক বন্ধ আছে কিনা এবং আপনার ইমেল সঠিক কিনা তা নিশ্চিত করুন। সমস্যাটি দীর্ঘস্থায়ী হলে ব্রাউজার ক্যাশে পরিষ্কার করুন।' },
                    { q: 'অর্ডার ট্র্যাকিং', a: 'অর্ডার করার পর, আপনি আপনার অ্যাকাউন্ট ড্যাশবোর্ডের "Recent Orders" সেকশনে এর অগ্রগতি ট্র্যাক করতে পারেন।' },
                    { q: 'পেমেন্ট ত্রুটি', a: 'অনলাইন পেমেন্ট ব্যর্থ হলে, ব্যালেন্স চেক করুন বা আপনার ব্যাংকের সাথে যোগাযোগ করুন। আপনি সর্বদা ক্যাশ অন ডেলিভারি বেছে নিতে পারেন।' },
                    { q: 'রিটার্ন পলিসি', a: 'ক্রুটিপূর্ণ প্রোডাক্ট পেলে, রিটার্ন বা রিপ্লেসমেন্টের জন্য ৭ দিনের মধ্যে সাপোর্টের সাথে যোগাযোগ করুন।' }
                ]
            }
        }
    };

    const c = content[lang];

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Sidebar Navigation */}
            <nav className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-screen overflow-y-auto p-6 hidden lg:block scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <h1 className="text-xl font-extrabold text-brand-600 dark:text-brand-500 tracking-tight">{c.title}</h1>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wide font-semibold">{c.version}</p>

                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => setLang('en')}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${lang === 'en' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => setLang('bn')}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${lang === 'bn' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}
                        >
                            বাংলা
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-3">{c.nav.admin}</h5>
                        <NavButton id="dashboard" label={c.nav.dashboard} />
                        <NavButton id="leads" label={c.nav.leads} />
                        <NavButton id="payments" label={c.nav.payments} />
                        <NavButton id="products" label={c.nav.products} />
                        <NavButton id="orders" label={c.nav.orders} />
                        <NavButton id="customers" label={c.nav.customers} />
                        <NavButton id="media" label={c.nav.media} />
                        <NavButton id="content" label={c.nav.cms} />
                        <NavButton id="settings" label={c.nav.settings} />
                    </div>

                    <div>
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 pl-3">{c.nav.store}</h5>
                        <NavButton id="auth" label={c.nav.auth} />
                        <NavButton id="buying" label={c.nav.buying} />
                        <NavButton id="account" label={c.nav.account} />
                        <NavButton id="support" label={c.nav.support} />
                        <NavButton id="troubleshoot" label={c.nav.troubleshoot} />
                        <NavButton id="marketing" label={c.nav.marketing} />
                        <NavButton id="localization" label={c.nav.localization} />
                        <NavButton id="testimonials" label={c.nav.testimonials} />
                        <NavButton id="faqs" label={c.nav.faqs} />
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 p-6 lg:p-16 max-w-5xl mx-auto">
                <div className="lg:hidden mb-8 flex justify-end">
                    <button
                        onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-bold text-brand-600 dark:text-brand-400"
                    >
                        {lang === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
                    </button>
                </div>


                {/* Dashboard */}
                <section id="dashboard" className="scroll-mt-24 mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.dashboard.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">{c.dashboard.desc}</p>

                    <div className="grid sm:grid-cols-2 gap-6 mb-8">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{c.dashboard.statsTitle}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{c.dashboard.statsDesc}</p>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{c.dashboard.growthTitle}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{c.dashboard.growthDesc}</p>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{c.dashboard.chartTitle}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{c.dashboard.chartDesc}</p>
                        </div>
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{c.dashboard.actionsTitle}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{c.dashboard.actionsDesc}</p>
                        </div>
                    </div>
                </section>

                {/* Leads */}
                <section id="leads" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.leads.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">{c.leads.desc}</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {c.leads.list.map((item: any, i: number) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="block text-slate-900 dark:text-white mb-1">{item.label}</strong>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Payments */}
                <section id="payments" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.payments.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">{c.payments.desc}</p>
                    <div className="space-y-4">
                        {c.payments.list.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="w-2 h-2 rounded-full bg-brand-500" />
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.label}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Products */}
                <section id="products" className="scroll-mt-24 mb-20">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.products.title}</h2>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{c.products.stepsTitle}</h3>
                        <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                            {c.products.steps.map((step, i) => (
                                <li key={i} className="pl-8 relative">
                                    <span className="absolute -left-3 top-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">{i + 1}</span>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{step.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{step.desc}</p>
                                </li>
                            ))}
                        </ol>

                        {c.products.actions && (
                            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">{c.products.actionsTitle}</h3>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {c.products.actions.map((action: any, i: number) => (
                                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{action.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{action.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Orders */}
                <section id="orders" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.orders.title}</h2>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{c.orders.statusTitle}</h3>
                            <ul className="space-y-3">
                                {c.orders.statuses.map((status, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-300">{status.label}</span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{status.desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{c.orders.actionsTitle}</h3>
                            <ul className="space-y-4">
                                {c.orders.actions.map((action, i) => (
                                    <li key={i}>
                                        <strong className="text-slate-800 dark:text-slate-200 block text-sm">{action.title}</strong>
                                        <span className="text-xs text-slate-500">{action.desc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Customers */}
                <section id="customers" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.customers.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">{c.customers.desc}</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                        {c.customers.list.map((item, i) => (
                            <li key={i}><strong>{item.label}:</strong> {item.desc}</li>
                        ))}
                    </ul>
                </section>

                {/* Media */}
                <section id="media" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.media.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">{c.media.desc}</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
                        {c.media.list.map((item, i) => (
                            <li key={i}><strong>{item.label}:</strong> {item.desc}</li>
                        ))}
                    </ul>
                </section>

                {/* Content */}
                <section id="content" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.cms.title}</h2>

                    <div className="space-y-8">
                        {c.cms.sections.map((sec, i) => (
                            <div key={i}>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{sec.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm">{sec.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Settings */}
                <section id="settings" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.settings.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">{c.settings.desc}</p>
                    <ul className="grid sm:grid-cols-2 gap-4">
                        {c.settings.items.map((item, i) => (
                            <li key={i} className="bg-slate-50 dark:bg-slate-800 p-4 rounded border border-slate-100 dark:border-slate-700">
                                <strong className="block text-slate-900 dark:text-white mb-1">{item.label}</strong>
                                <span className="text-sm text-slate-500">{item.val}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Storefront & Support */}
                <section id="auth" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.auth.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">{c.auth.desc}</p>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                            {c.auth.steps.map((step: { title: string; desc: string }, i: number) => (
                                <li key={i} className="pl-8 relative">
                                    <span className="absolute -left-3 top-0 w-6 h-6 bg-brand-100 dark:bg-brand-900 border-2 border-white dark:border-slate-800 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">{i + 1}</span>
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{step.title}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{step.desc}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section id="buying" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.store.title}</h2>
                    <ol className="list-decimal pl-5 space-y-4 text-slate-600 dark:text-slate-400">
                        {c.store.steps.map((step: { label: string; desc: string }, i: number) => (
                            <li key={i} className="pl-2">
                                <strong className="text-slate-900 dark:text-white">{step.label}:</strong> {step.desc}
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="account" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.account.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">{c.account.desc}</p>
                    <ul className="grid sm:grid-cols-2 gap-4">
                        {c.account.list.map((item: { label: string; desc: string }, i: number) => (
                            <li key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <strong className="block text-slate-900 dark:text-white mb-1">{item.label}</strong>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section id="support" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.support.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">{c.support.desc}</p>
                    <ul className="space-y-4">
                        {c.support.list.map((item: { label: string; desc: string }, i: number) => (
                            <li key={i} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                <div className="p-2 bg-brand-100 dark:bg-brand-900/40 rounded-lg text-brand-600 dark:text-brand-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <strong className="block text-slate-900 dark:text-white text-sm">{item.label}</strong>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                <section id="troubleshoot" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{c.troubleshoot.title}</h2>
                    <div className="space-y-6">
                        {c.troubleshoot.items.map((item: { q: string; a: string }, i: number) => (
                            <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-500">Q</span>
                                    {item.q}
                                </h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed pl-8">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="marketing" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.marketing.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">{c.marketing.desc}</p>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {c.marketing.list.map((item: { label: string; desc: string }, i: number) => (
                            <div key={i} className="flex gap-4 items-start bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-[1.02]">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0 text-indigo-600 dark:text-indigo-400">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.label}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="localization" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.localization.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">{c.localization.desc}</p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {c.localization.list.map((item: any, i: number) => (
                            <div key={i} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="block text-slate-900 dark:text-white mb-1">{item.label}</strong>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="testimonials" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.testimonials.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">{c.testimonials.desc}</p>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {c.testimonials.list.map((item: any, i: number) => (
                            <div key={i} className="flex gap-4 items-start bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:scale-[1.02]">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.label}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="faqs" className="scroll-mt-24 mb-20 border-t border-slate-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{c.faqs.title}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-8">{c.faqs.desc}</p>
                    <div className="space-y-6">
                        {c.faqs.list.map((item: any, i: number) => (
                            <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.label}</h4>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <footer className="text-center text-slate-400 text-sm mt-32 pt-8 border-t border-slate-200 dark:border-slate-800">
                    &copy; 2025 LuxeAudio. All rights reserved.
                </footer>
            </main>
        </div>
    );
}
