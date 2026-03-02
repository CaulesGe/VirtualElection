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

function toCountryLabel(vote) {
	const country = String(vote?.scopeCountry ?? '').toLowerCase();
	const district = String(vote?.scopeDistrict ?? '').toLowerCase();
	if (country === 'us' && district === 'pres') return 'USA-Presidential Election';
	if (country === 'us' && district === 'fed') return 'USA-House of Representatives';
	if (country === 'ca') return 'Canada';
	return String(vote?.scopeCountry ?? '').toUpperCase();
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

	const votes = await listVotesForUser(userId);

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
								{votes.map((vote, index) => (
									<tr key={`${vote.scopeCountry}-${vote.scopeDistrict}-${vote.scopeYear}-${index}`}>
										<td>{toCountryLabel(vote)}</td>
										<td>{getPartyShortName(vote.partyId)}</td>
									</tr>
								))}
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
