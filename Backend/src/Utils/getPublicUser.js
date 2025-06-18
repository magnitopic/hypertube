export default async function getPublicUser(user) {
    const { API_HOST, API_PORT, API_VERSION } = process.env;

    const profilePicture = `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${user.id}/profile-picture`;

    const publicUser = {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        biography: user.biography,
        profile_picture: profilePicture,
    };

    return publicUser;
}
