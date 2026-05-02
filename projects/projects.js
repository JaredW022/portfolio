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

function renderPieChart() {
  svg.selectAll('*').remove();
  legend.selectAll('*').remove();

  let filtered = getFilteredProjects();

  let rolledData = d3.rollups(
    filtered,
    v => v.length,
    d => d.year
  );

  let data = rolledData.map(([year, count]) => ({
    value: count,
    label: year
  }));

  renderPieChart.selectedData = data;

  let sliceGenerator = d3.pie().value(d => d.value);
  let arcData = sliceGenerator(data);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let arcs = arcData.map(d => arcGenerator(d));

  arcs.forEach((arc, idx) => {
    svg.append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .attr('class', idx === selectedIndex ? 'selected' : '')
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        updateProjects();
        renderPieChart();
      });
  });

  data.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', idx === selectedIndex ? 'selected' : '')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;
        updateProjects();
        renderPieChart();
      });
  });
}


renderPieChart(projects);


