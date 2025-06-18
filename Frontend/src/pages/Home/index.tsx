import MainHeader from "./MainHeader";
import Phone from "../../components/common/devices/PhoneMockup";
import Tablet from "../../components/common/devices/TabletMockup";
import Laptop from "../../components/common/devices/LaptopMockup";
import { useBreakpoints } from "../../hooks/useBreakpoints";

const index = () => {
	const { isMobile, isTablet, isDesktop } = useBreakpoints();

	return (
		<main className="flex flex-1 justify-center items-center flex-col">
			<MainHeader />
			<section className="mb-5">
				{isMobile && <Phone imgSrc="/devices/phone.png" />}
				{isTablet && <Tablet imgSrc="/devices/tablet.png" />}
				{isDesktop && <Laptop imgSrc="/devices/laptop.png" />}
			</section>
		</main>
	);
};

export default index;
