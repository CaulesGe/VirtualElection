import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<p className={styles.kicker}>Who will you vote for if you live in ...?</p>
				<h1>Choose an election</h1>
				<p className={styles.subtitle}>
					VirtualElection is a multi-country interactive voting sandbox with live district totals,
					regional breakdowns, and map-driven exploration.
				</p>
			</section>

			<section className={styles.cardGrid} aria-label="Election choices">
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
			</section>
			<p className={styles.tip}>
				Tip: You can vote once per election scope (e.g., Canada federal vs USA president).
			</p>
		</main>
	);
}
