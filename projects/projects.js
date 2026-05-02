import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';

const projects = await fetchJSON('../lib/projects.json');

const titleElement = document.querySelector('.projects-title');
titleElement.textContent = `${projects.length} Projects`;

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

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

arcs.forEach((arc, idx) => {
    d3.select('#projects-pie-plot')
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(idx));
});

let legend = d3.select('.legend');

data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});

let query = '';

let searchInput = document.querySelector('.searchBar');

function setQuery(q) {
    q = q.toLowerCase();

    return projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(q);
    });
}

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {
  // re-calculate rolled data
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return {
            value: count,
            label: year
        }; // TODO
    });
    // re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value(d => d.value)
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map(d => arcGenerator(d));
    // TODO: clear up paths and legends
    let svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();

    let legend = d3.select('.legend');
    legend.selectAll('li').remove();
    // update paths and legends, refer to steps 1.4 and 2.2
    newArcs.forEach((arc, idx) => {
        svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx));
    });
}

// Call this function on page load
renderPieChart(projects);

searchInput.addEventListener('change', (event) => {
    let filteredProjects = setQuery(event.target.value);
    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});