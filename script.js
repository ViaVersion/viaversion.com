let questions = {};

async function fetchJson(name) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/ViaVersion/viaversion.com/main/data/${name}.json`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${name}.json:`, error);
        return [];
    }
}

async function fetchContributors() {
    try {
        const response = await fetch('https://api.github.com/repos/ViaVersion/ViaVersion/contributors');
        return await response.json();
    } catch (error) {
        console.error('Error fetching contributors:', error);
        return [];
    }
}

function openSetupGuide() {
    document.getElementById("formContent").innerHTML = '';
    addQuestion(questions, 1);
    document.getElementById("setupModal").style.display = "block";
}

window.onclick = function (event) {
    if (event.target == document.getElementById("setupModal")) {
        document.getElementById("setupModal").style.display = "none";
    }
};

function addQuestion(step, stepNumber) {
    const formContent = document.getElementById("formContent");

    const questionGroup = document.createElement("div");
    questionGroup.className = "question-group";
    questionGroup.id = `step-${stepNumber}`;

    const questionText = document.createElement("h3");
    questionText.innerText = `${stepNumber}. ${step.question}`;
    questionGroup.appendChild(questionText);

    if (step['multi-answers']) {
        const checkboxGroup = document.createElement("div");
        checkboxGroup.className = "checkbox-group";
        checkboxGroup.id = `checkbox-group-${stepNumber}`;

        for (const [key, value] of Object.entries(step['multi-answers'])) {
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = key;
            checkbox.dataset.recommendations = Array.isArray(value) ? value.join(",") : value;
            checkbox.id = `checkbox-${stepNumber}-${key}`;
            checkbox.name = `checkbox-${stepNumber}`;
            checkbox.onchange = function () {
                removeRecommendation();
                removeNextSteps(stepNumber);
                generateMultiAnswerRecommendation(stepNumber);
            };

            const label = document.createElement("label");
            label.htmlFor = `checkbox-${stepNumber}-${key}`;
            label.innerText = key;

            const lineBreak = document.createElement("br");

            checkboxGroup.appendChild(checkbox);
            checkboxGroup.appendChild(label);
            checkboxGroup.appendChild(lineBreak);
        }
        questionGroup.appendChild(checkboxGroup);

    } else if (step['answers']) {
        const select = document.createElement("select");
        select.id = `select-step-${stepNumber}`;
        select.onchange = function () {
            const selectedOption = this.value;
            removeRecommendation();
            removeNextSteps(stepNumber);

            const nextStep = step.answers[selectedOption];
            if (typeof nextStep === "string") {
                const recommendation = document.createElement("p");
                recommendation.className = "recommendation";
                recommendation.innerHTML = `<strong>${nextStep}</strong>`;
                questionGroup.appendChild(recommendation);
            } else {
                addQuestion(nextStep, stepNumber + 1);
            }
        };

        const defaultOption = document.createElement("option");
        defaultOption.text = "Select an option";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        for (const [key] of Object.entries(step.answers)) {
            const option = document.createElement("option");
            option.value = key;
            option.text = key;
            select.appendChild(option);
        }

        questionGroup.appendChild(select);
    }

    formContent.appendChild(questionGroup);
}

function generateMultiAnswerRecommendation(stepNumber) {
    const checkedBoxes = document.querySelectorAll(`#checkbox-group-${stepNumber} input[type="checkbox"]:checked`);
    let recommendations = [];

    checkedBoxes.forEach(cb => {
        const values = cb.dataset.recommendations.split(",");
        recommendations = recommendations.concat(values);
    });

    recommendations = [...new Set(recommendations)];

    if (recommendations.length > 0) {
        const recommendationText = recommendations.join(', ');
        const recommendation = document.createElement("p");
        recommendation.className = "recommendation";
        recommendation.innerHTML = `<strong>${recommendationText}</strong>`;
        document.getElementById(`step-${stepNumber}`).appendChild(recommendation);
    }
}

function removeNextSteps(currentStep) {
    let nextStep = currentStep + 1;
    while (document.getElementById(`step-${nextStep}`)) {
        document.getElementById(`step-${nextStep}`).remove();
        nextStep++;
    }
}

function removeRecommendation() {
    const recommendations = document.getElementsByClassName("recommendation");
    while (recommendations.length > 0) {
        recommendations[0].remove();
    }
}

function createProjectCard(project) {
    return `
        <div class="project-section">
            <button class="collapsible true">${project.category}</button>
            <div class="collapsible-content ${'show'}">
                <div class="project-container">
                    ${project.items.map(item => `
                        <div class="project-card" data-name="${item.name}" data-url="${item.url}" data-image="${item.image}" data-description="${item.description}" data-details='${JSON.stringify(item.details)}'>
                            <img src="${item.image}" alt="${item.name} Logo">
                            <div class="project-name">${item.name}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function setupProjectCards(projects) {
    const overviewContainer = document.querySelector('.projects-overview');
    overviewContainer.innerHTML = projects["projects"].map((project, index) => createProjectCard(project)).join('');

    // Event listeners for collapsible sections
    document.querySelectorAll('.collapsible').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('collapsed');
            content.classList.toggle('show');
        });
    });

    // Event listeners for project cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.getAttribute('data-name');
            const url = card.getAttribute('data-url');
            const image = card.getAttribute('data-image');
            const description = card.getAttribute('data-description');
            const details = JSON.parse(card.getAttribute('data-details'));
            const popup = document.getElementById('popup');
            const popupBody = document.getElementById('popup-body');

            let additionalButtons = '';
            let requiresText = '';

            // Check for existence and non-empty value of each button
            if (details.gettingStarted && details.gettingStarted.trim()) {
                additionalButtons += `<a href="${details.gettingStarted}" class="btn-popup btn-getting-started" target="_blank"><i class="fas fa-play-circle"></i> Getting Started</a>`;
            }
            if (details.javadocs && details.javadocs.trim()) {
                additionalButtons += `<a href="${details.javadocs}" class="btn-popup btn-javadocs" target="_blank"><i class="fas fa-book"></i> Javadocs</a>`;
            }
            if (details.apiDevelopers && details.apiDevelopers.trim()) {
                additionalButtons += `<a href="${details.apiDevelopers}" class="btn-popup btn-api-developers" target="_blank"><i class="fas fa-code"></i> API for Developers</a>`;
            }
            if (details.wiki && details.wiki.trim()) {
                additionalButtons += `<a href="${details.wiki}" class="btn-popup btn-wiki" target="_blank"><i class="fas fa-book"></i> Wiki</a>`;
            }

            // Add Requires field if present
            if (details.requires && details.requires.trim()) {
                requiresText = `<p class="requires">Requires ${details.requires}</p>`;
            }

            popupBody.innerHTML = `
                    <div class="popup-header">
                        <img src="${image}" alt="${name} Logo">
                        <div class="popup-header-content">
                            <h2>${name}</h2>
                            ${requiresText} <!-- Directly include requiresText here -->
                        </div>
                    </div>
                    <p>${description}</p>
                    <p><strong>Installed on:</strong> ${details.installedOn}</p>
                    ${details.allows ? `<p><strong>Allows:</strong> ${details.allows}</p>` : ''}
                    ${details.additionalBenefits ? `<p><strong>Additional benefits:</strong> ${details.additionalBenefits}</p>` : ''}
                    <div class="buttons-row">
                        <a href="${url}" class="btn-popup download-btn-popup" target="_blank"><i class="fas fa-download"></i> Download</a>
                        ${additionalButtons}
                    </div>
                `;
            popup.style.display = 'flex';
        });
    });
}

function setupContributors(contributors) {
    const grid = document.getElementById('contributor-grid');
    grid.innerHTML = contributors.map(contributor => `
            <a href="${contributor.html_url}" target="_blank">
                <img src="${contributor.avatar_url}" alt="${contributor.login}">
            </a>
        `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    fetchJson("projects").then(data => {
        setupProjectCards(data);
    });
    fetchContributors().then(data => {
        setupContributors(data);
    });
    fetchJson("selections").then(data => {
        questions = data
    });

    document.getElementById('popup-close').addEventListener('click', () => {
        document.getElementById('popup').style.display = 'none';
    });

    // Close popup when clicking outside of it
    window.addEventListener('click', (event) => {
        const popup = document.getElementById('popup');
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});