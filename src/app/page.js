import Image from 'next/image';
import Link from 'next/link';
import { ELECTION_COUNTRIES } from '@/lib/config/electionCountries';
import styles from './page.module.css';

// Regions (alphabetical) derived from the country registry; countries inside keep registry order.
const REGIONS = [...new Set(ELECTION_COUNTRIES.map((country) => country.region))].sort((a, b) =>
	a.localeCompare(b, 'en')
);

const COUNTRY_LIST = new Intl.ListFormat('en', { type: 'disjunction' }).format(
	ELECTION_COUNTRIES.map((country) => country.name)
);
const DESCRIPTION = `Choose ${COUNTRY_LIST} election simulations with live riding totals, regional breakdowns, and map-driven exploration.`;

export const metadata = {
	title: 'Interactive Election Map and Virtual Voting',
	description: DESCRIPTION,
	alternates: {
		canonical: '/'
	},
	openGraph: {
		title: 'VirtualElection - Interactive Election Map and Virtual Voting',
		description: DESCRIPTION,
		url: '/'
	},
	twitter: {
		title: 'VirtualElection - Interactive Election Map and Virtual Voting',
		description: DESCRIPTION
	}
};

export default function Home() {
	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<p className={styles.kicker}>Which party will you vote for if you live in ...?</p>
				<h1>Choose an election</h1>
				<p className={styles.subtitle}>
					VirtualElection is a multi-country interactive voting sandbox with live district totals,
					regional breakdowns, and map-driven exploration.
				</p>
			</section>

			{REGIONS.map((region) => {
				const headingId = `${region.toLowerCase().replace(/\s+/g, '-')}-heading`;
				return (
					<section key={region} className={styles.regionSection} aria-labelledby={headingId}>
						<div className={styles.regionHeader}>
							<h2 id={headingId} className={styles.regionTitle}>
								{region}
							</h2>
						</div>
						<div className={styles.cardGrid} aria-label={`${region} election choices`}>
							{ELECTION_COUNTRIES.filter((country) => country.region === region).map((country) => (
								<Link key={country.code} href={country.entryRoute} className={styles.card}>
									<div className={styles.cardTitle}>
										<Image
											src={country.flag}
											alt={`${country.name} flag`}
											width={28}
											height={20}
											className={styles.flag}
										/>
										<span>{country.name}</span>
										<span className={styles.badge}>{country.home.badge}</span>
									</div>
									<p className={styles.cardSubtitle}>{country.home.subtitle}</p>
									<span className={styles.cta}>{country.home.cta} →</span>
								</Link>
							))}
						</div>
					</section>
				);
			})}			<p className={styles.tip}>
				Tip: You can vote once per election scope (e.g., Canada federal vs USA president).
			</p>
		</main>
	);
}
