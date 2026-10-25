'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
	DEFAULT_COUNTRY,
	ELECTION_COUNTRIES,
	getElectionCountryFromPath
} from '@/lib/config/electionCountries';
import styles from './Header.module.css';

function getRouteContext(pathname, fromParam) {
	if (pathname?.startsWith('/user') && typeof fromParam === 'string' && fromParam.startsWith('/')) {
		return fromParam;
	}
	return pathname;
}

export default function Header({ isAuthenticated = false, userLabel = '' }) {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const fromParam = searchParams?.get('from') ?? '';
	const routeContext = getRouteContext(pathname, fromParam);
	const currentCountry = getElectionCountryFromPath(routeContext);
	const countryName = currentCountry?.name ?? '...';
	const currentCountryRoute = currentCountry?.entryRoute ?? DEFAULT_COUNTRY.entryRoute;
	const query = searchParams?.toString();
	const currentPathWithQuery = `${pathname}${query ? `?${query}` : ''}`;
	const from = pathname === '/user' ? '/' : currentPathWithQuery;
	const userPageUrl = `/user?from=${encodeURIComponent(from)}`;
	const userHref = isAuthenticated
		? userPageUrl
		: `/api/auth/signin?callbackUrl=${encodeURIComponent(userPageUrl)}`;

	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Link href="/" className={styles.brand}>
					Poliwave/VirtualElection
				</Link>
				<h1 className={styles.title}>How will you vote in {countryName}?</h1>
				<div className={styles.selectorWrap}>
					<label htmlFor="country-selector" className="sr-only">
						Switch election country
					</label>
					<select
						id="country-selector"
						className={styles.selector}
						aria-label="Switch election country"
						value={currentCountryRoute}
						onChange={(event) => {
							router.push(event.target.value);
						}}
					>
						{ELECTION_COUNTRIES.map((country) => (
							<option key={country.code} value={country.entryRoute}>
								{country.name}
							</option>
						))}
					</select>
				</div>
				<div className={styles.userSlot}>
					<Link href={userHref} className={styles.userBtn}>
						{isAuthenticated ? (userLabel ? `User: ${userLabel}` : 'User') : 'Login'}
					</Link>
				</div>
			</div>
		</header>
	);
}
