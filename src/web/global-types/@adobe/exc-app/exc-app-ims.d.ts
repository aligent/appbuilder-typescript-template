declare module '@adobe/exc-app/ims/ImsProfile' {
    export interface ProductContext {
        createDts: number;
        fulfillable_data?: string;
        geo?: string;
        global_company_id?: string;
        groupid: string;
        ident: string;
        label: string;
        login_company?: string;
        migration_status?: string;
        modDts: number;
        offer_id?: string;
        owningEntity: string;
        serviceCode: string;
        serviceLevel: string;
        statusCode: string;
        tenant_id?: string;
        [key: string]: unknown;
    }
    export interface ActiveProductContext {
        [serviceCode: string]: ProductContext;
    }
    export interface ProjectedProductContext {
        prodCtx: ProductContext;
    }
    export interface Role {
        organization: string;
        named_role: string;
    }
    export interface ImsProfile {
        account_type: string;
        authId: string;
        avatar?: string;
        avatarSrc?: string;
        countryCode: string;
        displayName: string;
        email: string;
        emailVerified: boolean;
        first_name: string;
        isImpersonated?: boolean;
        job_function: string;
        last_name: string;
        name: string;
        preferred_languages: string[];
        projectedProductContext: ProjectedProductContext[];
        roles?: Role[];
        session: string;
        userId: string;
        [key: string]: unknown;
    }
}
