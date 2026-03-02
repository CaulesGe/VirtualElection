import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

const HOUSE_SCOPE = {
	country: 'us',
	district: 'fed',
	year: 2025
};

export const metadata = {
	title: 'Virtual Election USA House 2025',
	description: 'Participate in the USA House virtual election and view live district totals.'
};

export default async function UsaHousePage() {
	const pageData = await loadElectionPageData(HOUSE_SCOPE);
	return <VirtualElectionPage {...pageData} />;
}
