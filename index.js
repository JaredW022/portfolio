import { fetchJSON, renderProjects } from './global.js';
// import { fetchGitHubData } from './global.js';

const projectsContainer = document.querySelector('.projects');
try {
  const projects = await fetchJSON('./lib/projects.json');
  renderProjects(projects.slice(0, 3), projectsContainer, 'h3');
} catch {
  projectsContainer.textContent = 'Projects could not be loaded. Please refresh to try again.';
}

/*
const githubData = await fetchGitHubData('jaredw022');
const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
  profileStats.innerHTML = `
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}
*/
