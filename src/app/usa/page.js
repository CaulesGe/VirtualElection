import { redirect } from 'next/navigation';

export const metadata = {
	title: 'USA Virtual Election',
	description: 'Redirecting to the USA presidential virtual election route.',
	alternates: {
		canonical: '/usa/president'
	},
	robots: {
		index: false,
		follow: true
	}
};

export default function UsaPage() {
	redirect('/usa/president');
}
