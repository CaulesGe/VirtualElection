import { canadaMapAdapter } from "./canada";
import { assertMapAdapter } from "./types";

const registry = {
	CA: assertMapAdapter(canadaMapAdapter)
};

export function getMapAdapter(countryCode) {
	const normalized = String(countryCode ?? "").trim().toUpperCase();
	return registry[normalized] ?? registry.CA;
}
