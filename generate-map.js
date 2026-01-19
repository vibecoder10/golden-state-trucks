import fs from 'fs';
import * as d3 from 'd3-geo';

const geoJson = JSON.parse(fs.readFileSync('./california-counties.geojson', 'utf8'));

const BAY_AREA_COUNTIES = [
    'Alameda', 'Contra Costa', 'Marin', 'Napa', 'San Francisco',
    'San Mateo', 'Santa Clara', 'Solano', 'Sonoma'
];

const SURROUNDING_COUNTIES = [
    'Mendocino', 'Lake', 'Yolo', 'Sacramento', 'San Joaquin',
    'Stanislaus', 'Merced', 'San Benito', 'Santa Cruz', 'Monterey'
];

const width = 800;
const height = 1000;

// Center roughly on SF Bay to ensure consistent projection
// Note: We MUST use the same projection parameters as before to make them line up.
const projection = d3.geoMercator()
    .center([-122.3, 37.8])
    .scale(25000)
    .translate([width / 2, height / 2]);

const pathGenerator = d3.geoPath().projection(projection);

const output = {
    bayArea: {},
    context: {}
};

geoJson.features.forEach(feature => {
    const name = feature.properties.name;
    if (BAY_AREA_COUNTIES.includes(name)) {
        output.bayArea[name] = pathGenerator(feature);
    } else if (SURROUNDING_COUNTIES.includes(name)) {
        output.context[name] = pathGenerator(feature);
    }
});

console.log(JSON.stringify(output, null, 2));
