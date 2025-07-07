import commentsModel from '../Models/CommentsModel.js';
import moviesModel from '../Models/MoviesModel.js';
import StatusMessage from '../Utils/StatusMessage.js';
import {
    validateComment,
    validateCommentWithMovieId,
} from '../Schemas/commentSchema.js';

export default class CommentsController {
    static async getAllComments(req, res) {
        try {
            const comments = await commentsModel.getCommentsWithUsernames();
            if (comments === null) {
                return res.status(500).json({
                    msg: StatusMessage.INTERNAL_SERVER_ERROR,
                });
            }

            return res.json({ msg: comments });
        } catch (error) {
            console.error('Error in getAllComments:', error);
            return res.status(500).json({
                msg: StatusMessage.INTERNAL_SERVER_ERROR,
            });
        }
    }

    static async getCommentById(req, res) {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                msg: StatusMessage.BAD_REQUEST,
            });
        }

        try {
            const comment = await commentsModel.getCommentWithUsername(id);
            if (comment === null) {
                return res.status(500).json({
                    msg: StatusMessage.INTERNAL_SERVER_ERROR,
                });
            }

            if (comment.length === 0) {
                return res.status(404).json({
                    msg: StatusMessage.COMMENT_NOT_FOUND,
                });
            }

            return res.json({ msg: comment });
        } catch (error) {
            console.error('Error in getCommentById:', error);
            return res.status(500).json({
                msg: StatusMessage.INTERNAL_SERVER_ERROR,
            });
        }
    }

    static async updateComment(req, res) {
        const { id } = req.params;
        const { comment } = req.body;
        const userId = req.session.user.id;

        if (!id) {
            return res.status(400).json({
                msg: StatusMessage.BAD_REQUEST,
            });
        }

        // Validate comment content
        const validation = await validateComment({ comment });
        if (!validation.success) {
            return res.status(400).json({
                msg: validation.error.errors[0].message,
            });
        }

        try {
            const updatedComment = await commentsModel.updateComment(
                id,
                userId,
                comment
            );

            if (updatedComment === null) {
                return res.status(500).json({
                    msg: StatusMessage.INTERNAL_SERVER_ERROR,
                });
            }

            if (updatedComment.length === 0) {
                return res.status(404).json({
                    msg: StatusMessage.COMMENT_NOT_FOUND_OR_UNAUTHORIZED,
                });
            }

            return res.json({
                msg: StatusMessage.COMMENT_UPDATED_SUCCESSFULLY,
            });
        } catch (error) {
            console.error('Error in updateComment:', error);
            return res.status(500).json({
                msg: StatusMessage.INTERNAL_SERVER_ERROR,
            });
        }
    }

    static async deleteComment(req, res) {
        const { id } = req.params;
        const userId = req.session.user.id;

        if (!id) {
            return res.status(400).json({
                msg: StatusMessage.BAD_REQUEST,
            });
        }

        try {
            const deleted = await commentsModel.deleteComment(id, userId);

            if (deleted === null) {
                return res.status(500).json({
                    msg: StatusMessage.INTERNAL_SERVER_ERROR,
                });
            }

            if (!deleted) {
                return res.status(404).json({
                    msg: StatusMessage.COMMENT_NOT_FOUND_OR_UNAUTHORIZED,
                });
            }

            return res.json({
                msg: StatusMessage.COMMENT_DELETED_SUCCESSFULLY,
            });
        } catch (error) {
            console.error('Error in deleteComment:', error);
            return res.status(500).json({
                msg: StatusMessage.INTERNAL_SERVER_ERROR,
            });
        }
    }

    static async createComment(req, res) {
        const { comment, movie_id } = req.body;
        const userId = req.session.user.id;

        // Validate required fields
        if (!comment || !movie_id) {
            return res.status(400).json({
                msg: StatusMessage.BAD_REQUEST,
            });
        }

        // Validate comment content
        const validation = await validateComment({ comment });
        if (!validation.success) {
            return res.status(400).json({
                msg: validation.error.errors[0].message,
            });
        }

        // Validate movie exists
        try {
            const movie = await moviesModel.getById({ id: movie_id });
            if (!movie || movie.length === 0) {
                return res.status(404).json({
                    msg: StatusMessage.MOVIE_NOT_FOUND,
                });
            }
        } catch (error) {
            console.error('Error checking movie:', error);
            return res.status(500).json({
                msg: StatusMessage.INTERNAL_SERVER_ERROR,
            });
        }

        // Create comment
        try {
            const input = {
                content: comment,
                movie_id: movie_id,
                user_id: userId,
                created_at: new Date(),
                updated_at: new Date(),
            };

            const newComment = await commentsModel.create({ input });

            if (newComment === null) {
                return res.status(500).json({
                    msg: StatusMessage.INTERNAL_SERVER_ERROR,
                });
            }

            if (newComment.length === 0) {
                return res.status(500).json({
                    msg: StatusMessage.INTERNAL_SERVER_ERROR,
                });
            }

            const completeComment = await commentsModel.getCommentWithUsername(
                newComment.id
            );
            if (!completeComment) {
                return res.status(500).json({
                    msg: StatusMessage.INTERNAL_SERVER_ERROR,
                });
            }

            return res.status(201).json({
                msg: StatusMessage.COMMENT_CREATED_SUCCESSFULLY,
                comment: completeComment,
            });
        } catch (error) {
            console.error('Error in createComment:', error);
            return res.status(500).json({
                msg: StatusMessage.INTERNAL_SERVER_ERROR,
            });
        }
    }

    static async createCommentForMovie(req, res) {
        const { movie_id } = req.params;
        const { comment } = req.body;
        const userId = req.session.user.id;

        if (!movie_id) {
            return res.status(400).json({
                msg: StatusMessage.BAD_REQUEST,
            });
        }

        // Add movie_id to body and call createComment
        req.body.movie_id = movie_id;
        return CommentsController.createComment(req, res);
    }

    static async getCommentsByMovieId(req, res) {
        const { movie_id } = req.params;

        if (!movie_id) {
            return res.status(400).json({
                msg: StatusMessage.BAD_REQUEST,
            });
        }

        try {
            const comments = await commentsModel.getCommentsByMovieId(movie_id);
            if (comments === null) {
                return res.status(500).json({
                    msg: StatusMessage.INTERNAL_SERVER_ERROR,
                });
            }

            return res.json({ msg: comments });
        } catch (error) {
            console.error('Error in getCommentsByMovieId:', error);
            return res.status(500).json({
                msg: StatusMessage.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
