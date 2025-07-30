// Content discovery script for Netlify CMS
// This helps discover content files automatically

async function discoverContentFiles() {
    const collections = ['education', 'skills', 'projects', 'publications', 'podcasts', 'videos', 'awards'];
    const manifest = {};
    
    for (const collection of collections) {
        manifest[collection] = [];
        
        // Try to discover files by attempting to load common filenames
        const commonFiles = [
            'index.md',
            `${collection}.md`,
            `${collection.slice(0, -1)}.md`, // singular form
            'bachelor-degree.md', // education specific
            'portfolio-website.md', // project specific
            'javascript.md', 'react.md', 'nodejs.md', 'python.md', 'html5.md' // skills specific
        ];
        
        for (const file of commonFiles) {
            try {
                const response = await fetch(`./content/${collection}/${file}`);
                if (response.ok) {
                    manifest[collection].push(file);
                }
            } catch (error) {
                // File doesn't exist, continue
            }
        }
    }
    
    return manifest;
}

// Auto-update manifest
async function updateManifest() {
    try {
        const discoveredManifest = await discoverContentFiles();
        console.log('📋 Discovered content:', discoveredManifest);
        return discoveredManifest;
    } catch (error) {
        console.log('⚠️ Could not discover content files:', error);
        return null;
    }
}

window.updateManifest = updateManifest;
