import { notFound, redirect } from 'next/navigation';
import ElectionPage, { buildElectionMetadata } from '@/lib/components/virtualElection/ElectionPage';
import UsaPresidentView from '@/lib/components/virtualElection/president/UsaPresidentView';
import { ELECTION_COUNTRIES, getElectionSiteByRoute } from '@/lib/config/electionCountries';

// Every election page (routes come from ELECTION_SITES in the country configs). Static routes such
// as /user and /api take precedence over this catch-all.

// Page variants selectable with `view` in a site config; the default is VirtualElectionPage.
const VIEWS = {
	president: UsaPresidentView
};

async function resolveRoute(params) {
	const { election = [] } = await params;
	const route = `/${election.map((segment) => decodeURIComponent(segment)).join('/')}`;
	const site = getElectionSiteByRoute(route);
	// A country base path with several pages (e.g. /usa) redirects to its entry page.
	const redirectCountry = site
		? null
		: ELECTION_COUNTRIES.find((country) => country.basePath === route);
	return { site, redirectCountry };
}

export async function generateMetadata({ params }) {
	const { site, redirectCountry } = await resolveRoute(params);
	if (site) return buildElectionMetadata(site);
	if (redirectCountry) {
		return {
			title: `${redirectCountry.name} Virtual Election`,
			description: `Redirecting to the ${redirectCountry.name} virtual election.`,
			alternates: { canonical: redirectCountry.entryRoute },
			robots: { index: false, follow: true }
		};
	}
	return {};
}

export default async function ElectionRoutePage({ params }) {
	const { site, redirectCountry } = await resolveRoute(params);
	if (site) return <ElectionPage site={site} View={VIEWS[site.view]} />;
	if (redirectCountry) redirect(redirectCountry.entryRoute);
	notFound();
}
