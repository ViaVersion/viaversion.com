document.addEventListener('DOMContentLoaded', function () {
    fetch('data/staff.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('staff-container');
            const roles = {
                admins: 'Admin',
                core_developers: 'Core Developer',
                developers: 'Developer',
                moderators: 'Moderator',
                triage: 'Triage',
                former_collaborators: 'Former Collaborator'
            };

            for (const [roleKey, roleName] of Object.entries(roles)) {
                if (data[roleKey] && data[roleKey].members.length > 0) {
                    const section = document.createElement('div');
                    section.classList = "mt-4 text-center";

                    const title = document.createElement('h2');
                    title.classList.add(roleKey === 'admins' ? 'admin' :
                        roleKey === 'core_developers' ? 'core-developer' :
                            roleKey === 'developers' ? 'developer' :
                                roleKey === 'moderators' ? 'moderator' :
                                    roleKey === 'triage' ? 'triage' :
                                        'former-collaborator');
                    title.textContent = roleName;
                    section.appendChild(title);

                    const description = document.createElement('p');
                    description.classList.add('mb-1');
                    description.textContent = data[roleKey].description;
                    section.appendChild(description);

                    const gridContainer = document.createElement('div');
                    gridContainer.classList = "row cardcontainer justify-content-center";

                    data[roleKey].members.forEach(member => {
                        const div = document.createElement('div');
                        div.className = "card ms-3 mt-2 p-2 bg-content";

                        const a = document.createElement('a');
                        a.href = member.url;
                        a.target = '_blank';

                        const img = document.createElement('img');
                        img.src = member.profile_picture;
                        img.alt = member.name;
                        img.loading = "lazy";
                        img.className = "card-img-top rounded-circle";

                        const divBody = document.createElement('div');
                        divBody.className = "card-body";

                        const h5 = document.createElement('h5');
                        h5.className = "card-title text-center";
                        h5.innerText = member.name
                        div.appendChild(h5);

                        if (roleName !== member.role) {
                            const roleDiv = document.createElement('div');
                            roleDiv.className = "text-center fst-italic";
                            roleDiv.textContent += `${member.role}`;
                            divBody.appendChild(roleDiv);
                        }

                        a.appendChild(img);
                        div.appendChild(a);
                        div.appendChild(divBody);
                        gridContainer.appendChild(div);
                    });
                    section.appendChild(gridContainer);
                    container.appendChild(section);
                }
            }
        })
        .catch(error => console.error('Error loading staff data:', error));
});