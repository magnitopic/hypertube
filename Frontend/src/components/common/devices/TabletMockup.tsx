interface PhoneMockupProps {
	imgSrc: string;
}

const PhoneMockup: React.FC<PhoneMockupProps> = ({ imgSrc }) => {
	return (
		<div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[454px] max-w-[341px] md:h-[682px] md:max-w-[512px]">
			<div className="h-[32px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
			<div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
			<div className="h-[46px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
			<div className="h-[64px] w-[3px] bg-gray-800 dark:bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
			<div className="rounded-[2rem] overflow-hidden h-[426px] md:h-[654px] bg-white">
				<img src={imgSrc} alt="" />
			</div>
		</div>
	);
};

export default PhoneMockup;
