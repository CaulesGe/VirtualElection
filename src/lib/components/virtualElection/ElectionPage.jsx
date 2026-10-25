import VirtualElectionPage from '@/lib/components/virtualElection/VirtualElectionPage';
import { loadElectionPageData } from '@/lib/server/virtualElection/loadElectionPageData';

/**
 * Next.js metadata for an election page, derived from its entry in ELECTION_SITES.
 */
export function buildElectionMetadata(site) {
	const { title, description } = site.seo;
	return {
		title,
		description,
		alternates: { canonical: site.route },
		openGraph: { title, description, url: site.route }
	};
}

/**
 * Server component shared by every election page: loads the page data for the scope, renders the
 * SEO intro and hands everything to the interactive view. `View` lets a page swap in a variant
 * (for example the USA presidential view) that accepts the same props.
 */
export default async function ElectionPage({ site, View = VirtualElectionPage }) {
	const pageData = await loadElectionPageData(site.scope);
	return (
		<>
			<section
				aria-label={site.seo.ariaLabel}
				style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1rem', color: '#4b5563' }}
			>
				<p style={{ margin: '0.5rem 0 0' }}>{site.seo.intro}</p>
			</section>
			<View {...pageData} />
		</>
	);
}
