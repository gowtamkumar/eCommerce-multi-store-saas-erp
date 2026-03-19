export interface FAQ {
    id: string;
    question: string;
    category?: string;
    answer: string;
    order: number;
    status: 'active' | 'inactive';
    pageId?: string;
    productId?: string;
}


export interface FAQFormProps {
    faqId?: string;
    initialData?: {
        question: string;
        answer: string;
        category: string;
        order: number;
        status: 'active' | 'inactive';
    };
}



export interface FAQProps {
    title?: string;
    description?: string;
    faqs?: FAQ[];
    isBuilderSection?: boolean;
}