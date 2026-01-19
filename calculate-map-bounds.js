import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./src/bay-area-full-map.json', 'utf8'));

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

const processPath = (d) => {
    // Match all coordinate pairs
    const matches = d.matchAll(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g);
    for (const match of matches) {
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
};

Object.values(data.bayArea).forEach(processPath);
Object.values(data.context).forEach(processPath);

const width = maxX - minX;
const height = maxY - minY;
const padding = 20;

console.log(`${minX - padding} ${minY - padding} ${width + padding * 2} ${height + padding * 2}`);
