import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';
import UsaPresidentView from '@/lib/components/virtualElection/president/UsaPresidentView';

const PRESIDENT_SCOPE = {
	country: 'us',
	district: 'pres',
	year: 2025
};

export const metadata = {
	title: 'Virtual Election USA President 2025',
	description: 'Participate in the USA presidential virtual election and view live state totals.'
};

export default async function UsaPresidentPage() {
	const pageData = await loadElectionPageData(PRESIDENT_SCOPE);
	return <UsaPresidentView {...pageData} />;
}
