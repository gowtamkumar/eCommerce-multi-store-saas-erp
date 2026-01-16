
export interface SectionSettings {
    backgroundColor?: string;
    textColor?: string;
    paddingTop?: string;
    paddingBottom?: string;
    containerWidth?: 'standard' | 'full';
    customClass?: string;
}

export interface Section {
    id: string;
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
    settings?: SectionSettings;
    order?: number;
}
