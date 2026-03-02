import { createHash } from 'node:crypto';

const WINDOW_MS = Number(process.env.VIRTUAL_ELECTION_RATE_WINDOW_MS ?? 60_000);
const MAX_REQUESTS_PER_WINDOW = Number(process.env.VIRTUAL_ELECTION_RATE_MAX ?? 10);
const BURST_WARN_THRESHOLD = Number(process.env.VIRTUAL_ELECTION_BURST_WARN_THRESHOLD ?? 25);

const recentByIpHash = new Map();

export class VirtualElectionAbuseError extends Error {
	constructor(code, message, status) {
		super(message);
		this.code = code;
		this.status = status;
	}
}

function prune(now, timestamps) {
	const cutoff = now - WINDOW_MS;
	return timestamps.filter((t) => t >= cutoff);
}

export function hashIp(ip) {
	return createHash('sha256').update(ip || 'unknown').digest('hex').substring(0, 32);
}

export function assertRateLimit(ipHash) {
	const now = Date.now();
	const history = prune(now, recentByIpHash.get(ipHash) ?? []);
	history.push(now);
	recentByIpHash.set(ipHash, history);

	const countInWindow = history.length;
	if (countInWindow > BURST_WARN_THRESHOLD) {
		console.warn('[virtual-election][abuse] suspicious burst detected', {
			ipHash,
			countInWindow,
			windowMs: WINDOW_MS
		});
	}

	if (countInWindow > MAX_REQUESTS_PER_WINDOW) {
		throw new VirtualElectionAbuseError(
			'RATE_LIMITED',
			'Too many vote attempts. Please wait and try again.',
			429
		);
	}
}

async function verifyRecaptchaToken(token, secret, remoteIp) {
	const payload = new URLSearchParams();
	payload.set('secret', secret);
	payload.set('response', token);
	if (remoteIp) payload.set('remoteip', remoteIp);

	const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: payload
	});
	if (!response.ok) return false;
	const result = await response.json();
	return !!result.success;
}

export async function assertCaptchaIfConfigured({ captchaToken, clientIp }) {
	const secret = process.env.RECAPTCHA_SECRET_KEY;
	if (!secret) return;

	const token = captchaToken?.trim();
	if (!token) {
		throw new VirtualElectionAbuseError('CAPTCHA_REQUIRED', 'CAPTCHA token is required.', 400);
	}
	const ok = await verifyRecaptchaToken(token, secret, clientIp);
	if (!ok) {
		throw new VirtualElectionAbuseError('CAPTCHA_FAILED', 'CAPTCHA verification failed.', 400);
	}
}

export function assertTrustedOrigin({ request, allowedOrigins = [] }) {
	const reqOrigin = request.headers.get('origin');
	const referrer = request.headers.get('referer');
	const requestUrl = new URL(request.url);
	const allowed = new Set([requestUrl.origin, ...allowedOrigins]);

	if (reqOrigin) {
		if (!allowed.has(reqOrigin)) {
			throw new VirtualElectionAbuseError(
				'FORBIDDEN_ORIGIN',
				'Cross-origin vote requests are not allowed.',
				403
			);
		}
		return;
	}

	if (referrer) {
		let referrerOrigin = '';
		try {
			referrerOrigin = new URL(referrer).origin;
		} catch {
			throw new VirtualElectionAbuseError(
				'FORBIDDEN_ORIGIN',
				'Cross-origin vote requests are not allowed.',
				403
			);
		}
		if (!allowed.has(referrerOrigin)) {
			throw new VirtualElectionAbuseError(
				'FORBIDDEN_ORIGIN',
				'Cross-origin vote requests are not allowed.',
				403
			);
		}
	}
}
