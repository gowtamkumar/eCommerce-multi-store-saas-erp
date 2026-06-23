
const STORAGE_ADDONS: AddonItem[] = [
    {
        slug: 'addon_storage_5gb',
        name: 'Lite Storage Boost',
        size: '+5 GB',
        price: 5,
        description: 'Perfect for small stores uploading standard product photos and documents.',
        features: ['5,120 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        icon: HardDrive
    },
    {
        slug: 'addon_storage_10gb',
        name: 'Growth Storage Boost',
        size: '+10 GB',
        price: 9,
        description: 'Ideal for growing businesses with rich catalogs and product collections.',
        features: ['10,240 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        icon: HardDrive
    },
    {
        slug: 'addon_storage_20gb',
        name: 'Pro Storage Boost',
        size: '+20 GB',
        price: 15,
        description: 'Designed for large retailers with thousands of high-res photos and receipts.',
        features: ['20,480 MB Storage Space', 'High-speed MinIO hosting', 'Instant activation', 'Cancel anytime'],
        icon: HardDrive
    }
];

const RESOURCE_ADDONS: AddonItem[] = [
    {
        slug: 'addon_products_1000',
        name: 'Catalog Boost',
        size: '+1,000 SKUs',
        price: 15,
        description: 'Expand your catalog capacity by adding 1,000 more products and variations.',
        features: ['1,000 product capability', 'Immediate synchronization', 'Plan-independent override', 'One-off activation'],
        icon: Package
    },
    {
        slug: 'addon_orders_5000',
        name: 'Transactions Boost',
        size: '+5,000 Orders',
        price: 25,
        description: 'Increase monthly order limits by 5,000/mo to handle sales spikes and campaigns.',
        features: ['5,000 extra monthly orders', 'Dynamic threshold update', 'Prevents checkout locks', 'One-off activation'],
        icon: ShoppingCart
    },
    {
        slug: 'addon_staff_10',
        name: 'Collaborators Boost',
        size: '+10 Staff',
        price: 20,
        description: 'Invite up to 10 additional staff members, managers, or warehouse assistants.',
        features: ['10 team accounts', 'Granular role assignments', 'Global branch scoping', 'One-off activation'],
        icon: Users
    },
    {
        slug: 'addon_locations_3',
        name: 'Logistics Expansion Boost',
        size: '+3 Loc / WH',
        price: 35,
        description: 'Add 3 branches and 3 warehouses to expand physical operations and supply chain.',
        features: ['3 physical branches', '3 warehouse inventories', 'Multi-source stock routing', 'One-off activation'],
        icon: MapPin
    }
];