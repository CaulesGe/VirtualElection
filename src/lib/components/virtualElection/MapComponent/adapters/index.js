import { australiaMapAdapter } from "./australia";
import { canadaMapAdapter } from "./canada";
import { germanyMapAdapter } from "./germany";
import { ukMapAdapter } from "./uk";
import { usaMapAdapter } from "./usa";
import { assertMapAdapter } from "./types";

const registry = {
	AU: assertMapAdapter(australiaMapAdapter),
	CA: assertMapAdapter(canadaMapAdapter),
	DE: assertMapAdapter(germanyMapAdapter),
	UK: assertMapAdapter(ukMapAdapter),
	US: assertMapAdapter(usaMapAdapter)
};

export function getMapAdapter(countryCode) {
	const normalized = String(countryCode ?? "").trim().toUpperCase();
	return registry[normalized] ?? registry.CA;
}
