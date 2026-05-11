export interface VariantConfig {
    [key: string]: string | number | boolean;
}

export interface Variant {
    name: string;
    config: VariantConfig;
}

export interface Experiment {
    name: string;
    description: string;
    enabled: boolean;
    splitPercent: number;
    variants: Variant[];
}

export interface AssignmentResult {
    user_id: string;
    experiment: string;
    variant: string;
    config: VariantConfig;
}

export interface ErrorResponse {
    status: 'error';
    message: string;
    code: string;
}

export interface SuccessResponse {
    status: 'success';
    data: AssignmentResult;
}