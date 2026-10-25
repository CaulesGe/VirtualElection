import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerAuthSession } from '@/lib/auth';
import { getPartyShortName } from '@/lib/components/virtualElection/partyMeta';
import { getUserIdFromSession } from '@/lib/server/virtualElection/identity';
import { listVotesForUser } from '@/lib/server/virtualElection/service';
import styles from './page.module.css';

export const metadata = {
	title: 'Your Vote History',
	description: 'Review your virtual election votes across all scopes.'
};

function resolveBackHref(rawFrom) {
	if (!rawFrom) return '/';
	const from = Array.isArray(rawFrom) ? rawFrom[0] : rawFrom;
	if (typeof from !== 'string') return '/';
	return from.startsWith('/') ? from : '/';
}

// Display order follows the home page (North America, Europe, Oceania) so that related
// scopes, such as the two USA elections, stay next to each other.
const COUNTRY_ENTRIES = [
	{ key: 'ca', label: 'Canada', flag: '/static/flags/Canada.svg.png' },
	{ key: 'us-pres', label: 'USA-Presidential Election', flag: '/static/flags/USA.png' },
	{ key: 'us-fed', label: 'USA-House of Representatives', flag: '/static/flags/USA.png' },
	{ key: 'uk', label: 'UK', flag: '/static/flags/UK.svg.png' },
	{ key: 'de', label: 'Germany', flag: '/static/flags/Germany.svg' },
	{ key: 'au', label: 'Australia', flag: '/static/flags/Australia.svg' }
];

function getCountryEntry(vote) {
	const country = String(vote?.scopeCountry ?? '').toLowerCase();
	const district = String(vote?.scopeDistrict ?? '').toLowerCase();
	const key = country === 'us' ? `us-${district}` : country;
	return COUNTRY_ENTRIES.find((entry) => entry.key === key) ?? null;
}

function toCountryLabel(vote) {
	return getCountryEntry(vote)?.label ?? String(vote?.scopeCountry ?? '').toUpperCase();
}

function sortVotes(votes) {
	const rank = (vote) => {
		const entry = getCountryEntry(vote);
		return entry ? COUNTRY_ENTRIES.indexOf(entry) : COUNTRY_ENTRIES.length;
	};
	return [...votes].sort((a, b) => rank(a) - rank(b));
}
export default async function UserPage({ searchParams }) {
	const resolvedSearchParams = await Promise.resolve(searchParams);
	const session = await getServerAuthSession();
	const userId = getUserIdFromSession(session);
	const backHref = resolveBackHref(resolvedSearchParams?.from);
	const userPageUrl = `/user?from=${encodeURIComponent(backHref)}`;
	if (!userId) {
		redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(userPageUrl)}`);
	}

	const votes = sortVotes(await listVotesForUser(userId));

	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<div className={styles.topActions}>
					<Link href={backHref} className={styles.actionBtn}>
						Back
					</Link>
				</div>

				<header className={styles.header}>
					<h1>Your Votes</h1>
					<p className="muted">Signed in as {session?.user?.email ?? session?.user?.name ?? userId}</p>
				</header>

				{votes.length === 0 ? (
					<p className="muted">No votes yet — go vote in an election.</p>
				) : (
					<div className={styles.tableWrap}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>Country</th>
									<th>Party</th>
								</tr>
							</thead>
							<tbody>
								{votes.map((vote, index) => {
									const flagSrc = getCountryEntry(vote)?.flag;
									return (
									<tr key={`${vote.scopeCountry}-${vote.scopeDistrict}-${vote.scopeYear}-${index}`}>
										<td>
											<span className={styles.country}>
												{flagSrc ? (
													<Image src={flagSrc} alt="" width={28} height={20} className={styles.flag} />
												) : null}
												<span>{toCountryLabel(vote)}</span>
											</span>
										</td>
										<td>{getPartyShortName(vote.partyId)}</td>
									</tr>
								);
								})}
							</tbody>
						</table>
					</div>
				)}

				<div className={styles.bottomActions}>
					<Link className={`${styles.actionBtn} ${styles.danger}`} href="/api/auth/signout?callbackUrl=%2F">
						Logout
					</Link>
				</div>
			</section>
		</main>
	);
}
