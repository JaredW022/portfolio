import { fetchJSON, renderProjects } from '../global.js';

const container = document.querySelector('.projects');
const count = document.querySelector('.project-count');
const search = document.querySelector('.searchBar');

try {
    const projects = await fetchJSON('../lib/projects.json');
    const update = () => {
        const query = search.value.trim().toLowerCase();
        const filtered = projects.filter(project =>
            [project.title, project.description, project.year, project.category, ...(project.skills ?? [])]
                .join(' ').toLowerCase().includes(query)
        );
        count.textContent = `${filtered.length} / ${projects.length}`;
        renderProjects(filtered, container, 'h3');
    };
    update();
    search.addEventListener('input', update);
} catch {
    container.textContent = 'Projects could not be loaded. Please refresh to try again.';
    count.textContent = 'Unavailable';
}
