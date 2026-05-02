import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const titleElement = document.querySelector('.projects-title');
titleElement.textContent = `${projects.length} Projects`;

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

let currentQuery = '';

let arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(50);

let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);

let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);

let searchInput = document.querySelector('.searchBar');

function setQuery(q) {
    q = q.toLowerCase();

    return projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(q);
    });
}

searchInput.addEventListener('input', (event) => {
    currentQuery = event.target.value;

    let filteredProjects = setQuery(currentQuery);

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});

let selectedIndex = -1;

function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
        projectsGiven,
        v => v.length,
        d => d.year
    );

    let newData = newRolledData.map(([year, count]) => ({
        value: count,
        label: year
    }));

    let newSliceGenerator = d3.pie().value(d => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map(d => arcGenerator(d));

    let svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();

    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    newArcs.forEach((arc, i) => {
        svg.append('path')
            .attr('d', arc)
            .attr('fill', colors(i))
            .attr('class', i === selectedIndex ? 'selected' : '')
            .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;

                svg.selectAll('path')
                    .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

                legend.selectAll('li')
                    .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

                let base = setQuery(currentQuery);

                if (selectedIndex === -1) {
                    renderProjects(base, projectsContainer, 'h2');
                } else {
                    let selectedLabel = newData[selectedIndex].label;
                    let filtered = base.filter(p => p.year === selectedLabel);
                    renderProjects(filtered, projectsContainer, 'h2');
                }
            });
    });

    newData.forEach((d, i) => {
    legend.append('li')
        .attr('style', `--color:${colors(i)}`)
        .attr('class', i === selectedIndex ? 'selected' : '')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;

            svg.selectAll('path')
                .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

            legend.selectAll('li')
                .attr('class', (_, idx) => idx === selectedIndex ? 'selected' : '');

            let base = setQuery(currentQuery);

            if (selectedIndex === -1) {
                renderProjects(base, projectsContainer, 'h2');
            } else {
                let selectedLabel = newData[selectedIndex].label;
                let filtered = base.filter(p => p.year === selectedLabel);
                renderProjects(filtered, projectsContainer, 'h2');
            }

        });
    });
}

renderPieChart(projects);


