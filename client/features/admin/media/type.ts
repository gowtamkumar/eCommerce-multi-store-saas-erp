export interface MediaItem {
    _id: string;
    filename: string;
    url: string;
    mimetype: string;
    size: number;
    createdAt: string;
}

// Raw shape returned by GET /admin/media (file entity)
export interface RawMediaFile {
    id: string;
    filename?: string;
    originalname?: string;
    path?: string;
    mimetype?: string;
    size?: number;
    createdAt?: string;
}

