import z from 'zod';

const commentSchema = z.object({
    comment: z
        .string({
            invalid_type_error: 'Invalid comment.',
            required_error: 'Comment is required.',
        })
        .min(1, 'Comment cannot be empty.')
        .max(1000, 'Comment must be 1000 characters or fewer.')
        .trim(),
    movie_id: z
        .string({
            invalid_type_error: 'Invalid movie ID.',
            required_error: 'Movie ID is required.',
        })
        .uuid('Movie ID must be a valid UUID.')
        .optional(),
});

export async function validateComment(input) {
    return commentSchema.partial().safeParseAsync(input);
}

export async function validateCommentWithMovieId(input) {
    return commentSchema.safeParseAsync(input);
}
