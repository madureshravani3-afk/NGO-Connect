export declare const sendEmail: (to: string, template: {
    subject: string;
    html: string;
}) => Promise<{
    success: boolean;
    message: string;
    messageId?: undefined;
} | {
    success: boolean;
    messageId: string;
    message?: undefined;
}>;
export declare const sendPasswordResetEmail: (email: string, resetLink: string, firstName: string) => Promise<{
    success: boolean;
    message: string;
    messageId?: undefined;
} | {
    success: boolean;
    messageId: string;
    message?: undefined;
}>;
export declare const sendWelcomeEmail: (email: string, firstName: string, role: string) => Promise<{
    success: boolean;
    message: string;
    messageId?: undefined;
} | {
    success: boolean;
    messageId: string;
    message?: undefined;
}>;
export declare const sendEmailVerification: (email: string, verificationLink: string, firstName: string) => Promise<{
    success: boolean;
    message: string;
    messageId?: undefined;
} | {
    success: boolean;
    messageId: string;
    message?: undefined;
}>;
export declare const sendNGORegistrationEmail: (email: string, firstName: string, organizationName: string) => Promise<{
    success: boolean;
    message: string;
    messageId?: undefined;
} | {
    success: boolean;
    messageId: string;
    message?: undefined;
}>;
export declare const sendNGOStatusUpdateEmail: (email: string, firstName: string, organizationName: string, status: string, reason?: string) => Promise<{
    success: boolean;
    message: string;
    messageId?: undefined;
} | {
    success: boolean;
    messageId: string;
    message?: undefined;
}>;
export declare const testEmailConfiguration: () => Promise<{
    success: boolean;
    message: string;
    error?: undefined;
} | {
    success: boolean;
    message: string;
    error: string;
}>;
//# sourceMappingURL=emailService.d.ts.map