let year = 2017;
let gender = 'Total';
let type = 0;
let datapath = './datasets/' + year + '-' + gender + '-' + type +'.csv';
const types = ['Au moins une fois par mois','Au moins une fois au cours des 12 derniers mois']

let projection = d3.geoMercator()
	.scale(5800)
	.translate([200, 280])
	.center([7.225500, 46.814500]);

let geoGenerator = d3.geoPath()
	.projection(projection);

function handleMouseover(e, d) {	
			
}

d3.select('#year').on('change', function() {
	let value = d3.select(this).property('value');
	year = value;
	datapath = './datasets/' + year + '-' + gender + '-' + type +'.csv';
	showData();
});

d3.select('#gender').on('change', function() {
	let value = d3.select(this).property('value');
	gender = value;	
	datapath = './datasets/' + year + '-' + gender + '-' + type +'.csv';
	showData();
});

d3.select('#type').on('change', function() {
	let value = d3.select(this).property('value');
	type = value;	
	datapath = './datasets/' + year + '-' + gender + '-' + type +'.csv';
	showData();	
});

function showData() {
	d3.csv(datapath).then(function(data) {
		let map = d3.select('g.map');
		let paths = map.selectAll('path');
		paths.each(function(d) {
			let canton = d.properties.name;
			let value = data.filter(function(row) {
				return row.canton == canton;
			});
			if (value && value[0]['Proportion de la population en %'] != '.') {
				d3.select(this).attr('fill', function() {
					let color = d3.scaleLinear()
						.domain([0, 10])
						.range(['#fff', '#000']);
					return color(value[0]['Proportion de la population en %']);
				});
			}
		});		
	});
}


function update(geojson) {
	let u = d3.select('content g.map')
		.selectAll('path')
		.data(geojson.features);

	u.enter()
		.append('path')
		.attr('d', geoGenerator)
		.on('mouseover', handleMouseover);
}



// REQUEST DATA
d3.json('./datasets/switzerland-with-regions.geojson')
	.then(function(json) {
		update(json);
		showData();
	});

