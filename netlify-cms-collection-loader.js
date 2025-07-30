// Netlify CMS Collection Handler
// This handles both manual and CMS-generated content files

class NetlifyCMSCollectionLoader {
    constructor() {
        this.collections = {
            education: {
                folder: 'education',
                template: this.renderEducationItem.bind(this)
            },
            skills: {
                folder: 'skills',
                template: this.renderSkillItem.bind(this)
            },
            projects: {
                folder: 'projects', 
                template: this.renderProjectItem.bind(this)
            },
            publications: {
                folder: 'publications',
                template: this.renderPublicationItem.bind(this)
            },
            podcasts: {
                folder: 'podcasts',
                template: this.renderPodcastItem.bind(this)
            },
            videos: {
                folder: 'videos',
                template: this.renderVideoItem.bind(this)
            },
            awards: {
                folder: 'awards',
                template: this.renderAwardItem.bind(this)
            }
        };
    }

    async loadCollection(collectionName, files) {
        console.log(`🔄 Loading collection: ${collectionName} with ${files.length} files`);
        const items = [];
        
        for (const file of files) {
            try {
                const filePath = `./content/${collectionName}/${file}`;
                console.log(`📄 Loading file: ${filePath}`);
                const response = await fetch(filePath);
                const text = await response.text();
                console.log(`📝 File content preview:`, text.substring(0, 200) + '...');
                
                const data = this.parseMarkdownFrontmatter(text);
                console.log(`✅ Parsed data:`, data);
                
                if (Object.keys(data).length > 0) {
                    items.push(data);
                }
            } catch (error) {
                console.error(`❌ Error loading ${file}:`, error);
            }
        }
        
        console.log(`📊 Total items loaded for ${collectionName}:`, items.length);
        
        if (items.length > 0) {
            this.renderCollection(collectionName, items);
        }
        
        return items;
    }

    async loadCollectionData(collectionName) {
        console.log(`🔄 Loading collection: ${collectionName}`);
        const files = this.getCollectionFiles(collectionName);
        const items = [];
        
        for (const file of files) {
            try {
                console.log(`📄 Loading file: ${file}`);
                const response = await fetch(file);
                const text = await response.text();
                console.log(`📝 File content preview:`, text.substring(0, 200) + '...');
                
                const data = this.parseMarkdownFrontmatter(text);
                console.log(`✅ Parsed data:`, data);
                
                if (Object.keys(data).length > 0) {
                    items.push(data);
                }
            } catch (error) {
                console.error(`❌ Error loading ${file}:`, error);
            }
        }
        
        console.log(`📊 Total items loaded for ${collectionName}:`, items.length);
        return items;
    }

    parseMarkdownFrontmatter(markdownText) {
        // Use the multi-format parser if available
        if (window.MultiFormatContentParser) {
            return window.MultiFormatContentParser.parseContent(markdownText);
        }
        
        // Fallback to original parser
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
        const match = markdownText.match(frontmatterRegex);
        
        if (!match) {
            // If no frontmatter, try to parse as tabular data
            console.log('⚠️ No frontmatter found, attempting tabular parsing');
            return this.parseTabularFallback(markdownText);
        }
        
        const frontmatter = match[1];
        const data = {};
        
        // Simple YAML parser for basic key-value pairs and arrays
        const lines = frontmatter.split('\n');
        let currentKey = null;
        let currentValue = '';
        let inMultiline = false;
        let inArray = false;
        let arrayItems = [];
        
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
            } else if (line.trim().startsWith('- ')) {
                // Array item
                if (!inArray) {
                    inArray = true;
                    arrayItems = [];
                }
                arrayItems.push(line.trim().substring(2).trim());
            } else if (line.includes(':') && !line.trim().startsWith('- ')) {
                // End array if we were in one
                if (inArray && currentKey) {
                    data[currentKey] = arrayItems;
                    inArray = false;
                }
                
                const [key, value] = line.split(':').map(s => s.trim());
                currentKey = key;
                
                if (value) {
                    data[key] = value.replace(/^["']|["']$/g, '');
                } else {
                    // Might be start of an array
                    inArray = true;
                    arrayItems = [];
                }
            }
        }
        
        // Handle last multiline or array if exists
        if (inMultiline && currentKey) {
            data[currentKey] = currentValue.trim();
        }
        if (inArray && currentKey) {
            data[currentKey] = arrayItems;
        }
        
        return data;
    }

    parseTabularFallback(text) {
        console.log('📊 Parsing as tabular data (fallback)');
        const lines = text.trim().split('\n');
        if (lines.length < 2) return {};

        const data = {};
        
        // Check if first line looks like headers
        const firstLine = lines[0];
        if (firstLine.includes('\t') || firstLine.includes('degree') || firstLine.includes('title')) {
            const headers = firstLine.split('\t').map(h => h.trim());
            
            // Find data line
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split('\t').map(v => v.trim());
                    headers.forEach((header, index) => {
                        if (values[index]) {
                            let key = header.toLowerCase().replace(/[^a-z0-9]/g, '');
                            // Normalize some common field names
                            if (key === 'projectdegree') key = 'degree';
                            if (key === 'project') key = 'title';
                            data[key] = values[index];
                        }
                    });
                    break;
                }
            }
        }
        
        return data;
    }

    renderEducationItem(data, filename) {
        // Handle both traditional and tabular format
        const degree = data.degree || data['project-degree'] || data.projectdegree || data.title || 'Education';
        const institution = data.institution || data.school || '';
        const description = data.description || '';
        
        // Handle dates
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            try {
                const date = new Date(dateStr);
                return date.getFullYear();
            } catch {
                return dateStr;
            }
        };
        
        const startYear = formatDate(data.startDate || data.startdate);
        const endYear = formatDate(data.endDate || data.enddate) || 'Present';
        
        let dateRange = '';
        if (startYear && endYear !== 'Present') {
            dateRange = `${startYear} - ${endYear}`;
        } else if (startYear) {
            dateRange = `${startYear} - ${endYear}`;
        } else if (endYear !== 'Present') {
            dateRange = endYear;
        }
        
        return `
            <div class="education-item">
                ${dateRange ? `<div class="education-date">${dateRange}</div>` : ''}
                <div class="education-content">
                    <h3>${degree}</h3>
                    ${institution ? `<p class="education-school">${institution}</p>` : ''}
                    ${description ? `<p>${description}</p>` : ''}
                </div>
            </div>
        `;
    }

    renderSkillItem(data, filename) {
        // Handle both traditional and tabular format
        const skillName = data.name || data['skill-name'] || data.skillname || data.title || filename.replace('.md', '');
        const category = data.category || '';
        const proficiency = data.proficiency || data.level || '';
        const years = data.years || data.experience || '';
        
        let skillClass = 'skill-tag';
        if (proficiency) {
            skillClass += ` skill-${proficiency.toLowerCase()}`;
        }
        
        let skillText = skillName;
        if (years) {
            skillText += ` (${years}y)`;
        }
        if (proficiency && proficiency !== skillName) {
            skillText += ` - ${proficiency}`;
        }
        
        return `<span class="${skillClass}" title="${data.description || ''}">${skillText}</span>`;
    }

    renderProjectItem(data, filename) {
        // Handle both traditional and tabular format
        const title = data.title || data['project-title'] || data.projecttitle || 'Project';
        const description = data.description || '';
        const status = data.status || '';
        const startDate = data.startDate || data.startdate || '';
        const endDate = data.endDate || data.enddate || '';
        
        // Handle technologies - could be array or string
        let techTags = '';
        let technologies = data.technologies || data.tech || [];
        
        if (typeof technologies === 'string') {
            // If it's a string, split by common separators
            technologies = technologies.split(/[,;|]/).map(t => t.trim()).filter(t => t);
        }
        
        if (Array.isArray(technologies) && technologies.length > 0) {
            techTags = technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
        }
        
        // Format dates
        let dateRange = '';
        if (startDate || endDate) {
            const formatDate = (dateStr) => {
                if (!dateStr) return '';
                try {
                    const date = new Date(dateStr);
                    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                } catch {
                    return dateStr;
                }
            };
            
            const start = formatDate(startDate);
            const end = formatDate(endDate);
            
            if (start && end) {
                dateRange = `<div class="project-dates">${start} - ${end}</div>`;
            } else if (start) {
                dateRange = `<div class="project-dates">Started: ${start}</div>`;
            }
        }
        
        return `
            <div class="project-card">
                <h3>${title}</h3>
                <p>${description}</p>
                ${dateRange}
                ${status ? `<div class="project-status"><span class="status-badge status-${status.toLowerCase()}">${status}</span></div>` : ''}
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

    renderPublicationItem(data, filename) {
        return `
            <div class="content-card">
                <h3>${data.title || 'Publication'}</h3>
                <p class="content-meta">${data.journal || data.publication || ''} • ${data.year || ''}</p>
                <p class="content-authors">By: ${data.authors || data.author || ''}</p>
                <p>${data.description || data.abstract || ''}</p>
                ${data.url ? `<a href="${data.url}" class="content-link" target="_blank">Read Paper</a>` : ''}
            </div>
        `;
    }

    renderPodcastItem(data, filename) {
        let tags = '';
        if (data.tags && Array.isArray(data.tags)) {
            tags = data.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        }
        
        return `
            <div class="content-card">
                <h3>${data.title || 'Podcast'}</h3>
                <p class="content-meta">Episode ${data.episode || ''} • ${data.duration || ''}</p>
                <p>${data.description || ''}</p>
                <div class="content-tags">${tags}</div>
                ${data.url ? `<a href="${data.url}" class="content-link" target="_blank">Listen Now</a>` : ''}
            </div>
        `;
    }

    renderVideoItem(data, filename) {
        let tags = '';
        if (data.tags && Array.isArray(data.tags)) {
            tags = data.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        }
        
        return `
            <div class="content-card">
                <h3>${data.title || 'Video'}</h3>
                <p class="content-meta">${data.type || 'Video'} • ${data.duration || ''}</p>
                <p>${data.description || ''}</p>
                <div class="content-tags">${tags}</div>
                ${data.url ? `<a href="${data.url}" class="content-link" target="_blank">Watch Video</a>` : ''}
            </div>
        `;
    }

    renderAwardItem(data, filename) {
        return `
            <div class="content-card">
                <h3>${data.title || data.award || 'Award'}</h3>
                <p class="content-meta">${data.organization || data.issuer || ''} • ${data.year || data.date || ''}</p>
                <p>${data.description || ''}</p>
                <div class="award-badge">${data.badge || data.level || '🏆'}</div>
            </div>
        `;
    }
}

// Export for use
window.NetlifyCMSCollectionLoader = NetlifyCMSCollectionLoader;
