export function getMapMetadataForScope(scope) {
	return {
		countryCode: String(scope?.country ?? "ca").toUpperCase(),
		mapVersion: String(scope?.year ?? "2025")
	};
}
