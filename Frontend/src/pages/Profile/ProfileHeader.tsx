import { Link } from "react-router-dom";
import MainInformation from "../../components/profile/MainInformation";

interface UserData {
	first_name: string;
	last_name: string;
	username: string;
	email: string;
	age: number;
	biography: string;
	fame: number;
	last_online: number;
	profile_picture: string;
	gender: string;
	sexual_preference: string;
}

interface ProfileHeaderProps {
	user: UserData;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
	return (
		<section className="container max-w-4xl text-center my-20 px-3 relative">
			<Link
				to="/profile/edit"
				className="absolute top-0 right-4 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200 group w-10 h-10 flex justify-center items-center"
				aria-label="Edit profile"
				title="Edit profile"
			>
				<p className="fa fa-pencil text-xl text-gray-600 group-hover:text-gray-900 transition-colors" />
			</Link>

			<MainInformation user={user} />
		</section>
	);
};

export default ProfileHeader;
