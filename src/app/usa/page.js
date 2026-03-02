import { redirect } from 'next/navigation';

export const metadata = {
	title: 'Virtual Election USA',
	description: 'USA virtual election routes.'
};

export default function UsaPage() {
	redirect('/usa/president');
}
