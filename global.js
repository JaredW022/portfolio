const BASE_PATH = new URL('.', import.meta.url).pathname;

const pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    // { url: 'contact/', title: 'Contact' },
    // { url: 'about/', title: 'About Me' },
    // { url: 'https://github.com/Jaredw022', title: 'GitHub' },
    // { url: 'meta/', title: 'Meta' },
    // { url: 'resume.html', title: 'Resume' }
];

const header = document.createElement('header');
header.className = 'site-header';
header.innerHTML = `
    <a class="brand" href="${BASE_PATH}" aria-label="Jared Wang, home"><span>Jared Wang<span class="brand-caption">Data &amp; curiosity</span></span></a>
    <nav aria-label="Main navigation"></nav>
    <label class="color-scheme"><span class="theme-symbol" aria-hidden="true">◐</span><span class="sr-only">Color theme</span><select id="color-scheme-select"><option value="light">Light</option><option value="dark">Dark</option><option value="light dark">Auto</option></select></label>
`;
document.body.prepend(header);

const main = document.querySelector('main, .resume');
if (main) {
    main.id = 'main';
    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main';
    skip.textContent = 'Skip to content';
    document.body.prepend(skip);
}

const normalizePath = path => path.replace(/index\.html$/, '').replace(/\/$/, '');
for (const page of pages) {
    const link = document.createElement('a');
    link.href = page.url.startsWith('http') ? page.url : BASE_PATH + page.url;
    link.textContent = page.title;
    if (normalizePath(link.pathname) === normalizePath(location.pathname) && link.host === location.host) {
        link.classList.add('current');
        link.setAttribute('aria-current', 'page');
    }
    header.querySelector('nav').append(link);
}

const select = header.querySelector('select');
try {
    const saved = localStorage.getItem('colorScheme');
    if (['light', 'dark', 'light dark'].includes(saved)) select.value = saved;
} catch { /* The theme control also works when browser storage is unavailable. */ }
document.documentElement.style.colorScheme = select.value;
select.addEventListener('change', () => {
    document.documentElement.style.colorScheme = select.value;
    try { localStorage.setItem('colorScheme', select.value); } catch { /* Optional persistence. */ }
});

const footer = document.createElement('footer');
footer.className = 'site-footer';
footer.innerHTML = `<div class="footer-meta"><span>Data science · UC San Diego</span><span>© ${new Date().getFullYear()} Jared Wang</span></div>`;
document.body.append(footer);

export async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    return response.json();
}

const artwork = {
    honey: '<span class="honey-cell cell-one"></span><span class="honey-cell cell-two"></span><span class="honey-cell cell-three"></span><span class="art-word">sweet<br><i>science.</i></span>',
    game: '<span class="game-map"></span><span class="map-node node-one"></span><span class="map-node node-two"></span><span class="map-node node-three"></span><span class="art-word">vision &amp;<br><i>victory.</i></span>',
    earth: '<span class="earth-orbit orbit-one"></span><span class="earth-orbit orbit-two"></span><span class="earth-orbit orbit-three"></span><span class="art-word">a greener<br><i>world.</i></span>'
};

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.replaceChildren();
    if (!projects.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = 'No projects found. Try another topic, skill, or year.';
        containerElement.append(empty);
        return;
    }
    const preview = containerElement.dataset.preview === 'true';
    projects.forEach(project => {
        const setDestination = link => {
            link.href = project.url || `${BASE_PATH}projects/#${project.id}`;
            if (project.url) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        };
        const article = document.createElement('article');
        article.className = 'project-card';
        article.id = project.id;
        const art = document.createElement('div');
        art.className = `project-art art-${project.art || 'earth'}`;
        art.setAttribute('aria-hidden', 'true');
        art.innerHTML = artwork[project.art] || artwork.earth;
        const artLabel = document.createElement('span');
        artLabel.className = 'art-label';
        artLabel.textContent = project.category;
        art.append(artLabel);
        if (preview || project.url) {
            const coverLink = document.createElement('a');
            setDestination(coverLink);
            coverLink.className = 'project-cover-link';
            coverLink.setAttribute('aria-label', project.url ? `View ${project.title} (opens in a new tab)` : `Read about ${project.title}`);
            coverLink.append(art);
            article.append(coverLink);
        } else article.append(art);
        const body = document.createElement('div');
        body.className = 'project-body';
        const meta = document.createElement('p');
        meta.className = 'project-meta';
        meta.textContent = `${project.category} / ${project.year}`;
        const heading = document.createElement(headingLevel);
        if (preview || project.url) {
            const link = document.createElement('a');
            setDestination(link);
            link.textContent = project.title;
            if (project.url) link.setAttribute('aria-label', `${project.title} (opens in a new tab)`);
            heading.append(link);
        } else heading.textContent = project.title;
        const description = document.createElement('p');
        description.className = 'project-description';
        description.textContent = preview ? project.summary || project.description : project.description;
        const skills = document.createElement('ul');
        skills.className = 'project-skills';
        skills.setAttribute('aria-label', 'Project skills and tools');
        (project.skills || []).forEach(skill => {
            const tag = document.createElement('li');
            tag.textContent = skill;
            skills.append(tag);
        });
        body.append(meta, heading, description, skills);
        if (project.url) {
            const projectLink = document.createElement('a');
            setDestination(projectLink);
            projectLink.className = 'text-link project-external-link';
            projectLink.textContent = 'View project ↗';
            projectLink.setAttribute('aria-label', `View project: ${project.title} (opens in a new tab)`);
            body.append(projectLink);
        }
        article.append(body);
        containerElement.append(article);
    });
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}
