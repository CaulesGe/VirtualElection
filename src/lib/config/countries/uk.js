function party(name, shortName, color, cssKey, colorGradient) {
	return {
		name,
		shortName,
		color,
		backgroundColor: `bg-${cssKey}`,
		textColor: `text-${cssKey}`,
		logo: '',
		colorGradient
	};
}

const uk = {
	code: 'uk',
	name: 'United Kingdom',
	region: 'Europe',
	basePath: '/uk',
	entryRoute: '/uk',
	flag: '/static/flags/UK.svg.png',
	home: {
		badge: 'Parliament',
		subtitle:
			'Vote across UK constituencies and watch the race for Parliament unfold in real time.',
		cta: 'Open UK election'
	},

	votingSystem: 'single',
	// UK party IDs are the full party names.
	parties: {
		'Labour Party': party('Labour Party', 'LAB', '#E4003B', 'lab', ['#FF8AA8', '#FF668D', '#F24577', '#E4003B', '#B3002E', '#7A001F']),
		'Conservative Party': party('Conservative Party', 'CON', '#0087DC', 'con-uk', ['#8FD4FF', '#5CC1FF', '#2AAAF2', '#0087DC', '#006AAE', '#004C7D']),
		'Liberal Democrats': party('Liberal Democrats', 'LD', '#FDBB30', 'ld', ['#FFE09A', '#FFD36F', '#FFC650', '#FDBB30', '#D69518', '#9F6D0B']),
		'Scottish National Party': party('Scottish National Party', 'SNP', '#FFF95D', 'snp', ['#FFFDA6', '#FFF98A', '#FFF56E', '#FFF95D', '#E4D84A', '#B5A82F']),
		'Sinn Féin': party('Sinn Féin', 'SF', '#326760', 'sf', ['#7EA9A3', '#5E9088', '#4A7F76', '#326760', '#234C46', '#15312D']),
		Independent: party('Independent', 'IND', '#6B7280', 'ind-uk', ['#B6BDC8', '#9EA6B3', '#8A93A0', '#747D8A', '#5E6672', '#474E59']),
		'Reform UK': party('Reform UK', 'REF', '#12B6CF', 'ref', ['#8BE6F2', '#5DD7EA', '#37CADF', '#12B6CF', '#0E8EA2', '#096875']),
		'Democratic Unionist Party': party('Democratic Unionist Party', 'DUP', '#D46A00', 'dup', ['#F5B77A', '#ED9B52', '#E4832C', '#D46A00', '#A65300', '#783B00']),
		'Green Party of England and Wales': party('Green Party of England and Wales', 'GRN', '#6AB023', 'grn-uk', ['#A8D981', '#8CC85A', '#7ABD3E', '#6AB023', '#4F8617', '#365D0E']),
		'Plaid Cymru': party('Plaid Cymru', 'PC', '#008142', 'pc', ['#77C89D', '#4FB57F', '#2EA566', '#008142', '#006334', '#004626']),
		'Social Democratic and Labour Party': party('Social Democratic and Labour Party', 'SDLP', '#3CB371', 'sdlp', ['#96D8B0', '#73CB97', '#57C182', '#3CB371', '#2E8A56', '#20603B']),
		'Alliance Party of Northern Ireland': party('Alliance Party of Northern Ireland', 'APNI', '#F6C100', 'apni', ['#FFE38C', '#FFD95E', '#FFD133', '#F6C100', '#C79C00', '#927200']),
		'Ulster Unionist Party': party('Ulster Unionist Party', 'UUP', '#2B4EA2', 'uup', ['#91A6D8', '#6F88CB', '#5573BE', '#2B4EA2', '#1F3A7A', '#14284F']),
		'Traditional Unionist Voice': party('Traditional Unionist Voice', 'TUV', '#0D5BA6', 'tuv', ['#7FAED8', '#5996CA', '#3A80BD', '#0D5BA6', '#09457F', '#053058']),
		'Restore Britain': party('Restore Britain', 'RB', '#9B1C31', 'rb', ['#D58A98', '#C96579', '#B9475F', '#9B1C31', '#771524', '#520D18'])
	},

	map: {
		renderer: 'leaflet',
		asset: '/static/ridingMaps/UK.json',
		idProperties: ['GSScode', '3CODE', 'Name'],
		nameProperties: ['Name', 'AltName'],
		subnationalProperties: ['CTR_REG', 'Country'],
		versionPrefix: 'uk-',
		regionKey: 'constituency',
		view: { center: [54.2, -2.8], zoom: 5.2, minZoom: 4, maxZoom: 18 }
	},
	districts: { source: 'map', seed: true },
	regions: {
		options: [
			{ value: 'Total', label: 'United Kingdom (Total)', codes: [] },
			{ value: 'E', label: 'England', codes: ['E', 'ENGLAND'] },
			{ value: 'S', label: 'Scotland', codes: ['S', 'SCOTLAND'] },
			{ value: 'W', label: 'Wales', codes: ['W', 'WALES'] },
			{ value: 'N', label: 'Northern Ireland', codes: ['N', 'NORTHERNIRELAND'] }
		],
		// The first letter of a GSS constituency code is the constituent country.
		resolve: [{ prefix: { from: 'code', length: 1, values: ['E', 'S', 'W', 'N'] } }]
	},

	sites: [
		{
			district: 'fed',
			year: 2025,
			route: '/uk',
			pageTitle: 'United Kingdom',
			historyLabel: 'UK',
			seo: {
				title: 'UK Parliament Virtual Election',
				description:
					'Explore the UK constituency map, cast a virtual vote, and follow live seat and vote distribution updates across England, Scotland, Wales, and Northern Ireland.',
				ariaLabel: 'UK election overview',
				intro:
					'View UK parliament virtual election results by constituency, compare regional trends across the constituent countries, and interact with the live UK map.'
			}
		}
	]
};

export default uk;
