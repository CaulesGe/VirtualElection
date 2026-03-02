'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './Header.module.css';

function getCountryNameFromPath(pathname) {
	if (pathname?.startsWith('/usa')) return 'USA';
	if (pathname?.startsWith('/canada')) return 'Canada';
	return '...';
}

function getCountryRouteFromPath(pathname) {
	if (pathname?.startsWith('/canada')) return '/canada';
	if (pathname?.startsWith('/usa')) return '/usa/president';
	return '/canada';
}

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
	const countryName = getCountryNameFromPath(routeContext);
	const currentCountryRoute = getCountryRouteFromPath(routeContext);
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
					VirtualElection
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
						<option value="/canada">Canada</option>
						<option value="/usa/president">USA</option>
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
