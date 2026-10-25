// Region breakdown profiles (the "Select a region" dropdown of the seat/vote charts), built from a
// country's `regions` config. A profile exposes the options, alias normalization and how a riding
// resolves to a region; the logic is identical for every country.

function normalizeRegionKey(value) {
	return String(value ?? '')
		.toUpperCase()
		.replace(/[^A-Z]/g, '');
}

/**
 * @param {Object} config
 * @param {{ value: string, label: string, codes: string[] }[]} config.options
 *   First entry is the "Total" option. `codes` are alternative spellings that resolve to `value`.
 * @param {Record<string, string>} [config.extraAliases]
 *   Extra normalized (A-Z only, upper case) spellings -> region value.
 * @param {(input: { riding?: object, row?: object }) => string} config.resolveRegionCode
 */
export function createRegionProfile({ options, extraAliases = {}, resolveRegionCode }) {
	const aliases = {
		...Object.fromEntries(
			options.flatMap((option) =>
				option.codes.map((code) => [normalizeRegionKey(code), option.value])
			)
		),
		...extraAliases
	};

	return {
		getRegionOptions: () => options,
		toCanonicalRegionCode: (value) => {
			const normalized = normalizeRegionKey(value);
			return aliases[normalized] ?? normalized;
		},
		resolveRegionCode
	};
}

// One option per state, built from a division list ({ state, stateName }).
function buildOptionsFromDivisions(totalLabel, divisions) {
	const states = Array.from(
		new Map(divisions.map((division) => [division.state, division.stateName ?? division.state])).entries()
	)
		.map(([code, label]) => ({ value: code, label, codes: [code, label] }))
		.sort((a, b) => a.label.localeCompare(b.label));
	return [{ value: 'Total', label: totalLabel, codes: [] }, ...states];
}

/**
 * Compiles the `regions.resolve` rules of a country config into a resolver. Rules are tried in
 * order; the first non-empty result wins:
 * - 'subnational': the riding's `subnational` code
 * - 'division': the state of the riding in the committed division list
 * - { prefix: { from: 'code' | 'rowId', length, digitsOnly?, map?, values? } }: the first `length`
 *   characters (digits only if `digitsOnly`) of the riding code (`code`: riding code, else the
 *   result row's riding id; `rowId`: result row's riding id only), mapped through `map` or kept
 *   if listed in `values`.
 */
function compileResolver(rules, divisions) {
	const regionByDivisionCode = new Map(
		(divisions ?? []).map((division) => [String(division.code), division.state])
	);
	const steps = rules.map((rule) => {
		if (rule === 'subnational') return ({ riding }) => riding?.subnational;
		if (rule === 'division') {
			return ({ riding, row }) =>
				regionByDivisionCode.get(String(riding?.code ?? row?.ridingId ?? ''));
		}
		if (rule?.prefix) {
			const { from = 'code', length, digitsOnly = false, map, values } = rule.prefix;
			return ({ riding, row }) => {
				const source = from === 'rowId' ? row?.ridingId : (riding?.code ?? row?.ridingId);
				let text = String(source ?? '').trim().toUpperCase();
				if (digitsOnly) text = text.replace(/\D/g, '');
				if (text.length < length) return '';
				const prefix = text.slice(0, length);
				if (map) return map[digitsOnly ? Number(prefix) : prefix] ?? '';
				return values?.includes(prefix) ? prefix : '';
			};
		}
		throw new Error(`Unknown region resolve rule: ${JSON.stringify(rule)}`);
	});
	return (input) => {
		for (const step of steps) {
			const value = step(input);
			if (value) return value;
		}
		return '';
	};
}

/** Region profile for a country config (`regions`, plus `districts.divisions` when present). */
export function createConfiguredRegionProfile(country) {
	const { regions } = country;
	const divisions = country.districts?.source === 'divisions' ? country.districts.divisions : null;
	const options = regions.fromDivisions
		? buildOptionsFromDivisions(regions.totalLabel, divisions ?? [])
		: regions.options;
	return createRegionProfile({
		options,
		extraAliases: regions.aliases,
		resolveRegionCode: compileResolver(regions.resolve ?? ['subnational'], divisions)
	});
}
