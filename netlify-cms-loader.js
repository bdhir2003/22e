// Netlify CMS Content Loader
// This script loads content from markdown files created by Netlify CMS

async function loadNetlifyCMSContent() {
    console.log('🔄 Loading Netlify CMS content...');
    
    try {
        // Load personal information
        try {
            const personalResponse = await fetch('./content/personal.md');
            if (personalResponse.ok) {
                const personalText = await personalResponse.text();
                const personalData = parseMarkdownFrontmatter(personalText);
                updatePersonalInfo(personalData);
                console.log('✅ Personal info loaded');
            }
        } catch (error) {
            console.log('⚠️ Could not load personal.md:', error.message);
        }

        // Load hero section
        try {
            const heroResponse = await fetch('./content/hero.md');
            if (heroResponse.ok) {
                const heroText = await heroResponse.text();
                const heroData = parseMarkdownFrontmatter(heroText);
                updateHeroSection(heroData);
                console.log('✅ Hero section loaded');
            }
        } catch (error) {
            console.log('⚠️ Could not load hero.md:', error.message);
        }

        // Load about section
        try {
            const aboutResponse = await fetch('./content/about.md');
            if (aboutResponse.ok) {
                const aboutText = await aboutResponse.text();
                const aboutData = parseMarkdownFrontmatter(aboutText);
                updateAboutSection(aboutData);
                console.log('✅ About section loaded');
            }
        } catch (error) {
            console.log('⚠️ Could not load about.md:', error.message);
        }

        // Load settings
        try {
            const settingsResponse = await fetch('./content/settings.md');
            if (settingsResponse.ok) {
                const settingsText = await settingsResponse.text();
                const settingsData = parseMarkdownFrontmatter(settingsText);
                updateSiteSettings(settingsData);
                console.log('✅ Site settings loaded');
            }
        } catch (error) {
            console.log('⚠️ Could not load settings.md:', error.message);
        }

        // Load collections (education, skills, projects, etc.)
        await loadCollections();

        console.log('✅ Netlify CMS content loading completed!');
    } catch (error) {
        console.log('⚠️ Netlify CMS content not available, using defaults:', error);
        // Set some default content
        setDefaultContent();
    }
}

function setDefaultContent() {
    console.log('🔄 Setting default content...');
    
    // Set default hero content
    const homeName = document.getElementById('homeName');
    const homeTitle = document.getElementById('homeTitle');
    const homeTagline = document.getElementById('homeTagline');
    
    if (homeName && homeName.textContent.includes('<!-- Name')) {
        homeName.textContent = 'Your Name';
    }
    if (homeTitle && homeTitle.textContent.includes('<!-- Title')) {
        homeTitle.textContent = 'Your Professional Title';
    }
    if (homeTagline && homeTagline.textContent.includes('<!-- Tagline')) {
        homeTagline.textContent = 'Your professional tagline here';
    }
    
    // Set default about content
    const aboutText = document.querySelector('.about-text');
    if (aboutText && aboutText.textContent.includes('<!-- About')) {
        aboutText.innerHTML = '<p>Welcome to my portfolio! Please use the admin panel to add your personal information and content.</p>';
    }
}

function parseMarkdownFrontmatter(markdownText) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = markdownText.match(frontmatterRegex);
    
    if (!match) return {};
    
    const frontmatter = match[1];
    const data = {};
    
    // Simple YAML parser for basic key-value pairs
    const lines = frontmatter.split('\n');
    let currentKey = null;
    let currentValue = '';
    let inMultiline = false;
    
    for (const line of lines) {
        if (line.trim() === '') continue;
        
        if (line.includes('|') && !inMultiline) {
            // Start of multiline string
            currentKey = line.split(':')[0].trim();
            inMultiline = true;
            currentValue = '';
        } else if (inMultiline) {
            if (line.startsWith('  ')) {
                // Continuation of multiline string
                currentValue += (currentValue ? '\n' : '') + line.substring(2);
            } else {
                // End of multiline string
                data[currentKey] = currentValue.trim();
                inMultiline = false;
                
                // Process current line as new key-value pair
                if (line.includes(':')) {
                    const [key, value] = line.split(':').map(s => s.trim());
                    data[key] = value.replace(/^["']|["']$/g, '');
                }
            }
        } else if (line.includes(':')) {
            const [key, value] = line.split(':').map(s => s.trim());
            data[key] = value.replace(/^["']|["']$/g, '');
        }
    }
    
    // Handle last multiline if exists
    if (inMultiline && currentKey) {
        data[currentKey] = currentValue.trim();
    }
    
    return data;
}

function updatePersonalInfo(data) {
    console.log('Updating personal info:', data);
    
    if (data.fullName) {
        // Update navigation name
        const navName = document.getElementById('navName');
        if (navName) navName.textContent = data.fullName;
        
        // Update footer name
        const footerName = document.getElementById('footerName');
        if (footerName) footerName.textContent = data.fullName;
    }
    
    if (data.email) {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        emailLinks.forEach(link => {
            link.href = `mailto:${data.email}`;
            link.textContent = data.email;
        });
        
        // Update contact email display
        const contactEmail = document.getElementById('contactEmail');
        if (contactEmail) contactEmail.textContent = data.email;
    }
    
    if (data.profileImage) {
        const profileImages = document.querySelectorAll('.profile-image, #profileImage');
        profileImages.forEach(img => img.src = data.profileImage);
    }
    
    if (data.linkedin) {
        const linkedinLinks = document.querySelectorAll('a[href*="linkedin"]');
        linkedinLinks.forEach(link => link.href = data.linkedin);
    }
    
    if (data.github) {
        const githubLinks = document.querySelectorAll('a[href*="github"]');
        githubLinks.forEach(link => link.href = data.github);
    }
}

function updateHeroSection(data) {
    console.log('Updating hero section:', data);
    
    if (data.heroName) {
        const homeName = document.getElementById('homeName');
        if (homeName) homeName.textContent = data.heroName;
    }
    
    if (data.heroTitle) {
        const homeTitle = document.getElementById('homeTitle');
        if (homeTitle) homeTitle.textContent = data.heroTitle;
    }
    
    if (data.heroTagline) {
        const homeTagline = document.getElementById('homeTagline');
        if (homeTagline) homeTagline.textContent = data.heroTagline;
    }
    
    if (data.heroSubtitle) {
        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.textContent = data.heroSubtitle;
    }
    
    if (data.heroButtonText && data.heroButtonUrl) {
        const heroButton = document.querySelector('.hero-button, .btn-primary');
        if (heroButton) {
            heroButton.textContent = data.heroButtonText;
            heroButton.href = data.heroButtonUrl;
        }
    }
}

function updateAboutSection(data) {
    console.log('Updating about section:', data);
    
    if (data.aboutText) {
        const aboutText = document.querySelector('.about-text, #aboutDescription');
        if (aboutText) {
            // Convert markdown to HTML (simple conversion)
            const htmlText = data.aboutText
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n/g, '<br>');
            aboutText.innerHTML = `<p>${htmlText}</p>`;
        }
    }
}

function updateSiteSettings(data) {
    if (data.siteTitle) {
        document.title = data.siteTitle;
        const titleElements = document.querySelectorAll('.site-title');
        titleElements.forEach(el => el.textContent = data.siteTitle);
    }
    
    if (data.colorScheme) {
        document.documentElement.setAttribute('data-theme', data.colorScheme);
    }
    
    if (data.metaDescription) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = data.metaDescription;
    }
}

async function loadCollections() {
    console.log('🔄 Loading collections...');
    
    try {
        // Initialize the collection loader
        const collectionLoader = new NetlifyCMSCollectionLoader();
        
        // Try to load the content manifest first
        let manifest = null;
        try {
            const manifestResponse = await fetch('./content/manifest.json');
            if (manifestResponse.ok) {
                manifest = await manifestResponse.json();
                console.log('✅ Content manifest loaded');
            }
        } catch (error) {
            console.log('⚠️ Could not load manifest, using auto-discovery');
        }
        
        // If no manifest, try auto-discovery
        if (!manifest) {
            try {
                // Load the content discovery script if available
                if (window.updateManifest) {
                    manifest = await window.updateManifest();
                }
            } catch (error) {
                console.log('⚠️ Auto-discovery failed, using defaults');
                manifest = {
                    education: ['bachelor-degree.md'],
                    skills: ['javascript.md', 'react.md', 'nodejs.md', 'python.md', 'html5.md'],
                    projects: ['portfolio-website.md'],
                    publications: [],
                    podcasts: [],
                    videos: [],
                    awards: []
                };
            }
        }
        
        // Load all collections using the new loader
        if (manifest) {
            await Promise.all([
                collectionLoader.loadCollection('education', manifest.education || []),
                collectionLoader.loadCollection('skills', manifest.skills || []),
                collectionLoader.loadCollection('projects', manifest.projects || []),
                collectionLoader.loadCollection('publications', manifest.publications || []),
                collectionLoader.loadCollection('podcasts', manifest.podcasts || []),
                collectionLoader.loadCollection('videos', manifest.videos || []),
                collectionLoader.loadCollection('awards', manifest.awards || [])
            ]);
        }
        
        console.log('✅ All collections loaded');
    } catch (error) {
        console.log('⚠️ Error loading collections:', error);
        
        // Fallback to individual loading
        try {
            await loadEducation();
            await loadSkills();
            await loadProjects();
        } catch (fallbackError) {
            console.log('⚠️ Fallback loading also failed:', fallbackError);
        }
    }
}

async function loadEducation(manifest) {
    try {
        // Get education files from manifest or use defaults
        const educationFiles = manifest?.education || ['bachelor-degree.md'];
        const educationContainer = document.getElementById('educationList');
        if (!educationContainer) return;
        
        let educationHTML = '';
        
        for (const file of educationFiles) {
            try {
                const response = await fetch(`./content/education/${file}`);
                if (response.ok) {
                    const text = await response.text();
                    const data = parseMarkdownFrontmatter(text);
                    
                    // Format dates properly
                    const startYear = data.startDate ? new Date(data.startDate).getFullYear() : '';
                    const endYear = data.endDate ? new Date(data.endDate).getFullYear() : 'Present';
                    
                    educationHTML += `
                        <div class="education-item">
                            <div class="education-date">${startYear}${startYear && endYear !== 'Present' ? ' - ' + endYear : endYear !== 'Present' ? ' - ' + endYear : endYear === 'Present' ? ' - Present' : ''}</div>
                            <div class="education-content">
                                <h3>${data.degree || data.title || 'Education'}</h3>
                                <p class="education-school">${data.institution || data.school || ''}</p>
                                <p>${data.description || ''}</p>
                            </div>
                        </div>
                    `;
                    console.log(`✅ Loaded education: ${data.degree || file}`);
                }
            } catch (error) {
                console.log(`⚠️ Could not load education file ${file}:`, error.message);
            }
        }
        
        if (educationHTML) {
            educationContainer.innerHTML = educationHTML;
            console.log('✅ Education content loaded successfully');
        } else {
            console.log('⚠️ No education content loaded, keeping existing content');
        }
        
    } catch (error) {
        console.log('⚠️ Could not load education:', error.message);
    }
}

async function loadSkills(manifest) {
    try {
        // Get skill files from manifest or use defaults
        const skillFiles = manifest?.skills || ['javascript.md', 'react.md'];
        const skillsContainer = document.getElementById('allSkills');
        if (!skillsContainer) return;
        
        let skillsHTML = '';
        
        for (const file of skillFiles) {
            try {
                const response = await fetch(`./content/skills/${file}`);
                if (response.ok) {
                    const text = await response.text();
                    const data = parseMarkdownFrontmatter(text);
                    
                    if (data.name) {
                        skillsHTML += `<span class="skill-tag">${data.name}</span>`;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not load skill file ${file}:`, error.message);
            }
        }
        
        if (skillsHTML) {
            skillsContainer.innerHTML = skillsHTML;
            console.log('✅ Skills content loaded');
        }
        
    } catch (error) {
        console.log('⚠️ Could not load skills:', error.message);
    }
}

async function loadProjects(manifest) {
    try {
        // Get project files from manifest or use defaults
        const projectFiles = manifest?.projects || ['portfolio-website.md'];
        const projectsContainer = document.getElementById('projectsGrid');
        if (!projectsContainer) return;
        
        let projectsHTML = '';
        
        for (const file of projectFiles) {
            try {
                const response = await fetch(`./content/projects/${file}`);
                if (response.ok) {
                    const text = await response.text();
                    const data = parseMarkdownFrontmatter(text);
                    
                    let techTags = '';
                    if (data.technologies && Array.isArray(data.technologies)) {
                        techTags = data.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
                    }
                    
                    projectsHTML += `
                        <div class="project-card">
                            <h3>${data.title || 'Project'}</h3>
                            <p>${data.description || ''}</p>
                            <div class="project-tech">
                                ${techTags}
                            </div>
                            <div class="project-links">
                                ${data.url ? `<a href="${data.url}" class="project-link" target="_blank">Live Demo</a>` : ''}
                                ${data.github ? `<a href="${data.github}" class="project-link" target="_blank">GitHub</a>` : ''}
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                console.log(`⚠️ Could not load project file ${file}:`, error.message);
            }
        }
        
        if (projectsHTML) {
            projectsContainer.innerHTML = projectsHTML;
            console.log('✅ Projects content loaded');
        }
        
    } catch (error) {
        console.log('⚠️ Could not load projects:', error.message);
    }
}

async function loadPublications(manifest) {
    try {
        const publicationFiles = manifest?.publications || [];
        const publicationsContainer = document.getElementById('publicationsList');
        if (!publicationsContainer) return;
        
        console.log('✅ Publications section ready for CMS content');
    } catch (error) {
        console.log('⚠️ Could not load publications:', error.message);
    }
}

async function loadPodcasts(manifest) {
    try {
        const podcastFiles = manifest?.podcasts || [];
        const podcastsContainer = document.getElementById('podcastsList');
        if (!podcastsContainer) return;
        
        console.log('✅ Podcasts section ready for CMS content');
    } catch (error) {
        console.log('⚠️ Could not load podcasts:', error.message);
    }
}

async function loadVideos(manifest) {
    try {
        const videoFiles = manifest?.videos || [];
        const videosContainer = document.getElementById('videosList');
        if (!videosContainer) return;
        
        console.log('✅ Videos section ready for CMS content');
    } catch (error) {
        console.log('⚠️ Could not load videos:', error.message);
    }
}

async function loadAwards(manifest) {
    try {
        const awardFiles = manifest?.awards || [];
        const awardsContainer = document.getElementById('awardsList');
        if (!awardsContainer) return;
        
        console.log('✅ Awards section ready for CMS content');
    } catch (error) {
        console.log('⚠️ Could not load awards:', error.message);
    }
}

// Load content when page loads
document.addEventListener('DOMContentLoaded', loadNetlifyCMSContent);

// Export for use in other scripts
window.loadNetlifyCMSContent = loadNetlifyCMSContent;
