// Third-Party Imports:
import z from 'zod';

// Local Imports:
import StatusMessage from '../Utils/StatusMessage.js';
import { checkPasswordVulnerabilities } from '../Validations/authValidations.js';

const changePasswordSchema = z.object({
    old_password: z.string({
        required_error: 'Old password is required.',
    }),
    new_password: z
        .string({
            required_error: 'New password is required.',
        })
        .min(8, 'New password must be at lest 8 characters long.')
        .max(16, 'New password must be 16 characters or fewer.')
        .regex(
            /^(?=.*[A-Z])(?=.*[a-z])(?=.*[+.\-_*$@!?%&])(?=.*\d)[A-Za-z\d+.\-_*$@!?%&]+$/,
            { message: StatusMessage.INVALID_PASSWORD }
        )
        .superRefine(
            async (password, ctx) => {
                const result = await checkPasswordVulnerabilities(password);
                if (!result.success)
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: result.message,
                    });
            },
            {
                message: 'Password fails security requirements.',
            }
        ),
});

export async function validatePasswords(input) {
    return changePasswordSchema.safeParseAsync(input);
}

export async function validatePartialPasswords(input) {
    return changePasswordSchema.partial().safeParseAsync(input);
}
