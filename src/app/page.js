import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
	title: 'Interactive Election Map and Virtual Voting',
	description:
		'Choose Canada, USA, or United Kingdom election simulations with live riding totals, regional breakdowns, and map-driven exploration.',
	alternates: {
		canonical: '/'
	},
	openGraph: {
		title: 'VirtualElection - Interactive Election Map and Virtual Voting',
		description:
			'Choose Canada, USA, or United Kingdom election simulations with live riding totals, regional breakdowns, and map-driven exploration.',
		url: '/'
	},
	twitter: {
		title: 'VirtualElection - Interactive Election Map and Virtual Voting',
		description:
			'Choose Canada, USA, or United Kingdom election simulations with live riding totals, regional breakdowns, and map-driven exploration.'
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

			<section className={styles.regionSection} aria-labelledby="north-america-heading">
				<div className={styles.regionHeader}>
					<h2 id="north-america-heading" className={styles.regionTitle}>North America</h2>
				</div>
				<div className={styles.cardGrid} aria-label="North America election choices">
					<Link href="/canada" className={styles.card}>
						<div className={styles.cardTitle}>
							<Image
								src="/static/flags/Canada.svg.png"
								alt="Canada flag"
								width={28}
								height={20}
								className={styles.flag}
							/>
							<span>Canada</span>
							<span className={styles.badge}>Federal</span>
						</div>
						<p className={styles.cardSubtitle}>
							Explore ridings, see live totals, and compare regional breakdowns.
						</p>
						<span className={styles.cta}>Open Canada election →</span>
					</Link>

					<Link href="/usa/president" className={styles.card}>
						<div className={styles.cardTitle}>
							<Image
								src="/static/flags/USA.png"
								alt="USA flag"
								width={28}
								height={20}
								className={styles.flag}
							/>
							<span>USA</span>
							<span className={styles.badge}>House & President</span>
						</div>
						<p className={styles.cardSubtitle}>
							Choose House districts or simulate the Electoral College by state.
						</p>
						<span className={styles.cta}>Open USA elections →</span>
					</Link>
				</div>
			</section>

			<section className={styles.regionSection} aria-labelledby="europe-heading">
				<div className={styles.regionHeader}>
					<h2 id="europe-heading" className={styles.regionTitle}>Europe</h2>
				</div>
				<div className={styles.cardGrid} aria-label="Europe election choices">
					<Link href="/uk" className={styles.card}>
						<div className={styles.cardTitle}>
							<Image
								src="/static/flags/UK.svg.png"
								alt="United Kingdom flag"
								width={28}
								height={20}
								className={styles.flag}
							/>
							<span>United Kingdom</span>
							<span className={styles.badge}>Parliament</span>
						</div>
						<p className={styles.cardSubtitle}>
							Preview UK election support and future constituency-based voting flows.
						</p>
						<span className={styles.cta}>Open UK election →</span>
					</Link>
				</div>
			</section>
			<p className={styles.tip}>
				Tip: You can vote once per election scope (e.g., Canada federal vs USA president).
			</p>
		</main>
	);
}
