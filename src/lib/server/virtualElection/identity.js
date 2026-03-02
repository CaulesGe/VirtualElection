export function getUserIdFromSession(session) {
	const user = session?.user;
	const email = user?.email?.trim().toLowerCase();
	if (email) return email;
	const id = user?.id?.trim();
	return id || null;
}
