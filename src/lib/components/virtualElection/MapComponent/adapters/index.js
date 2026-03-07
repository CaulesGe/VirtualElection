import { canadaMapAdapter } from "./canada";
import { ukMapAdapter } from "./uk";
import { usaMapAdapter } from "./usa";
import { assertMapAdapter } from "./types";

const registry = {
	CA: assertMapAdapter(canadaMapAdapter),
	UK: assertMapAdapter(ukMapAdapter),
	US: assertMapAdapter(usaMapAdapter)
};

export function getMapAdapter(countryCode) {
	const normalized = String(countryCode ?? "").trim().toUpperCase();
	return registry[normalized] ?? registry.CA;
}
