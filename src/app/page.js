import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
	return (
		<main className="home-page">
			<section className="home-hero">
				<p className="home-kicker">Who will you vote for if you live in ...?</p>
				<h1>Choose an election</h1>
				<p className="home-subtitle">
					VirtualElection is a multi-country interactive voting sandbox with live district totals,
					regional breakdowns, and map-driven exploration.
				</p>
			</section>

			<section className="home-card-grid" aria-label="Election choices">
				<Link href="/canada" className="home-election-card">
					<div className="home-card-title">
						<Image
							src="/static/flags/Canada.svg.png"
							alt="Canada flag"
							width={28}
							height={20}
							className="home-card-flag"
						/>
						<span>Canada</span>
						<span className="home-badge">Federal</span>
					</div>
					<p className="home-card-subtitle">
						Explore ridings, see live totals, and compare regional breakdowns.
					</p>
					<span className="home-card-cta">Open Canada election →</span>
				</Link>

				<Link href="/usa/president" className="home-election-card">
					<div className="home-card-title">
						<Image
							src="/static/flags/USA.png"
							alt="USA flag"
							width={28}
							height={20}
							className="home-card-flag"
						/>
						<span>USA</span>
						<span className="home-badge">House & President</span>
					</div>
					<p className="home-card-subtitle">
						Choose House districts or simulate the Electoral College by state.
					</p>
					<span className="home-card-cta">Open USA elections →</span>
				</Link>
			</section>
			<p className="home-tip">
				Tip: You can vote once per election scope (e.g., Canada federal vs USA president).
			</p>
		</main>
	);
}
