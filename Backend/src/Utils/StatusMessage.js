export default class StatusMessage {
    static QUERY_ERROR = 'An error occurred while executing the query.';
    static NOT_FOUND_BY_ID = 'No record found with the specified ID.';
    static INTERNAL_SERVER_ERROR =
        'The server encountered an error while processing the request.';
    static BAD_REQUEST =
        'The server could not understand the request due to invalid input. Please verify your request and try again.';
    static WRONG_PASSWORD =
        'The password you entered is incorrect. Please try again.';
    static WRONG_USERNAME =
        'The username you entered does not exist. Please try again.';
    static ALREADY_LOGGED_IN = 'Already logged in.';
    static ACCESS_NOT_AUTHORIZED = 'Access not authorized.';
    static DUPLICATE_USERNAME_OR_EMAIL = 'Username or email already in use.';
    static DUPLICATE_USERNAME = 'Username already in use.';
    static DUPLICATE_EMAIL = 'Email already in use.';
    static LOGOUT_SUCCESS = 'Logout successful!';
    static ACC_CONFIRMATION_REQUIRED =
        'Please confirm your account before sign in. A confirmation link was sent to your email.';
    static CONFIRM_ACC_TOKEN_EXPIRED =
        'The token to confirm the account expired. A new one has been sent to your email.';
    static ACC_SUCCESSFULLY_CONFIRMED =
        'Your account has been successfully confirmed!';
    static REFRESH_TOKEN_EXPIRED =
        'Refresh token is invalid or has expired. Please log in again.';
    static REFRESH_TOKEN_REVOKED =
        'Refresh token was revoked. Please log in again.';
    static ACC_ALREADY_CONFIRMED = 'Account has already being confirmed.';
    static INVALID_EMAIL = 'No account found with this email address.';
    static RESET_PASS_EMAIL_SENT = 'Reset password email sent.';
    static CONFIRM_ACC_FIRST =
        'Please confirm your account before trying to reset your password.';
    static RESET_PASS_TOKEN_EXPIRED = 'The reset password link has expired.';
    static RESET_PASS_TOKEN_USED =
        'This password reset link has already been used. Please request a new password reset if needed.';
    static INVALID_PASSWORD =
        'Password must include at least one uppercase letter, one lowercase letter, one digit, and one special character (+.-_*$@!?%&).';
    static USER_NOT_FOUND = 'User not found.';
    static PASSWORD_UPDATED = 'Password updated successfully!';
    static NOT_LOGGED_IN = 'You are not logged in.';
    static SAME_PASSWORD =
        'Your new password must be different from the current one.';
    static INVALID_JSON = 'Invalid JSON payload.';
    static CANNOT_CHANGE_PASS =
        'Your account is linked to 42 School. Please manage your password on their site.';
    static CANNOT_CHANGE_EMAIL =
        'Your account is linked to 42 School. Please manage your email on their site.';
    static CANNOT_LOGIN_WITH_PASS =
        'Your account is linked to 42 School. Please login with your 42 School account.';
    static CANNOT_EDIT_OTHER_PROFILE =
        "You do not have permission to modify another user's profile.";
    static NO_PROFILE_INFO_TO_EDIT = 'There was no profile info to edit.';
    static INVALID_USER_TAG = 'Invalid user tag.';
    static ERROR_UPLOADING_IMAGE = 'Error uploading image.';
    static ONLY_IMAGES_ALLOWED =
        'Invalid file type. Only JPEG, JPG and PNG files are allowed.';
    static UNEXPECTED_ERROR = 'An unexpected error occured.';
    static NO_IMAGE_UPLOADED = 'No image uploaded.';
    static INVALID_IMAGE_EXTENSION =
        'Invalid file extension. Only .jpeg, .jpg and .png are accepted.';
    static INVALID_MIME_TYPE =
        "Invalid Mime type. Only 'image/jpeg', 'image/jpg' and 'image/png' are accepted.";
    static INVALID_IMAGE_SIZE = 'Image size exceeds the 5MB limit.';
    static IMAGE_IS_EMPTY = 'Image is empty. Please upload a valid image.';
    static EXCEEDS_IMAGE_LIMIT =
        'You have exceeded the maximum allowed number of image uploads. Please reduce the number of images and try again.';
    static EXCEEDS_IMAGE_LIMIT_DB =
        'You have exceeded the maximum allowed number of image uploads. Please delete an image before uploading a new one.';
    static IMAGE_NOT_FOUND = 'Image not found.';
    static AUDIO_NOT_FOUND = 'Audio not found.';
    static ERROR_DELETING_IMAGE = 'There was an error deleting the image.';
    static IMAGE_DELETED_SUCCESSFULLY = 'Image deleted successfully!';
    static CANNOT_LIKE_YOURSELF = 'You cannot like yourself!';
    static USER_LIKED = 'User liked!';
    static USER_LIKED_REMOVED = 'User like removed.';
    static LOGIN_SUCCESS = 'Logged in successfully!';
    static CANNOT_CHANGE_USERNAME = 'You cannot change your username.';
    static USER_HAS_MAX_FAME = 'INFO: User has max fame!';
    static USER_CANNOT_LIKE =
        "Cannot like other users if you don't have a profile picture!";
    static INVALID_USERNAME = 'Invalid username.';
    static MATCH_DOES_NOT_EXIST =
        'Cannot create an event with a user you are not matched with.';
    static INVALID_EVENT_DATE =
        'The selected date cannot be in the past. Please choose a valid future date.';
    static EVENT_DELETION_SUCCESSFUL = 'Event deleted successfully!';
    static EVENT_NOT_FOUND = 'The event you tried to delete does not exist.';
    static USER_BLOCKED = 'User blocked!';
    static USER_UNBLOCKED = 'User unblocked!';
    static USER_ALREADY_BLOCKED = 'User already blocked.';
    static USER_NOT_BLOCKED = 'User is not blocked.';
    static CANNOT_LIKE_BLOCKED_USER = 'Cannot like a blocked user.';
    static USER_ALREADY_REPORTED = 'User already reported.';
    static USER_REPORTED = 'User reported!';
    static ERROR_SENDING_EMAIL =
        'There was an error submitting report. Please try again.';
    static NO_USERS_FOUND =
        'There are no interesting profiles for you. We are sorry :(.';
    static CANNOT_CALCULATE_DISTANCE =
        'Cannot calculate distance without both locations.';
    static NO_LOCATION = 'Please provide a location.';
    static ERROR_CHANGING_USER_STATUS =
        'An error occurred while updating the user status. Please try again.';
    static USER_STATUS_CHANGED = 'User status changed successfully!';
    static FORBIDDEN_ACCESS_EVENT =
        'Access Denied: User authentication required.';
    static INVALID_MESSAGE_PAYLOAD =
        'The message payload is malformed or missing required fields.';
    static INVALID_RECEIVER_ID =
        'The user you are trying to message does not exist.';
    static ERROR_CHECKING_MATCH =
        'An error occurred while checking the match. Please try again later.';
    static CANNOT_SEND_MESSAGE_WITHOUT_MATCH =
        "You can only send messages to users you've matched with.";
    static FAILED_SENDING_CHAT_MESSAGE =
        'Failed to send message. Please try again.';
    static CHAT_NOT_FOUND = 'Chat not found.';
    static ERROR_GETTING_CHATS_INFO =
        'An error occurred while retrieving chat information. Please try again later.';
    static COULD_NOT_GET_USER = 'Could not get user from database.';
    static COULD_NOT_GET_USER_STATUS =
        'Could not get user status from database.';
    static USER_STATUS_NOT_FOUND = 'User status not found.';
    static ERROR_SAVING_NOTIFICATION_TO_DB =
        'There was an error creating notification in the database.';
    static ERROR_FETCHING_NOTIFICATIONS =
        'There was an error fetching notifications. Please try again later.';
    static NOT_CHAT_PARTICIPANT = 'You are not participating in this chat.';
    static MEDIA_ACCESS_NOT_AUTHORIZED =
        'You do not have permission to access this media content.';
    static ERROR_PARSING_COOKIES = 'Unable to read session cookies.';
    static ERROR_REFRESHING_ACCESS_TOKEN =
        'There was a problem refreshing your authentication token.';
    static ERROR_VALIDATING_PASSWORD =
        'There was a problem validating your password. Please try again later.';
    static COMMON_ENGLISH_WORDS_FOUND =
        'Password cannot contain commonly used english words.';
    static PWNED_PASSWORD =
        'Your password is known to be compromised in security breaches. Please create a different, more secure password.';
    static CANNOT_CONTAIN_BAD_WORDS = 'Cannot contain profane words';
    static OAUTH_PROVIDER_NOT_FOUND =
        'The specified OAuth provider is not supported. Please check the provider and try again.';
    static SEARCH_QUERY_REQUIRED = 'Search query is required.';
    static MOVIE_NOT_FOUND = 'Movie not found.';
    static ERROR_GETTING_GENRES = 'There was a problem getting movie genres.';
}
