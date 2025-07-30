// Multi-Format Content Parser for Netlify CMS
// Handles both markdown frontmatter AND tabular/CSV formats

class MultiFormatContentParser {
    static parseContent(text) {
        // Try to detect the format
        if (this.isTabularFormat(text)) {
            return this.parseTabularFormat(text);
        } else if (this.isMarkdownFrontmatter(text)) {
            return this.parseMarkdownFrontmatter(text);
        } else if (this.isCSVFormat(text)) {
            return this.parseCSVFormat(text);
        } else {
            // Try to extract any structured data
            return this.parseGeneric(text);
        }
    }

    static isTabularFormat(text) {
        // Check if it contains tab-separated values or table headers
        const lines = text.trim().split('\n');
        if (lines.length < 2) return false;
        
        const firstLine = lines[0];
        return (firstLine.includes('\t') || 
               (firstLine.includes('degree') && firstLine.includes('institution')) ||
               (firstLine.includes('title') && firstLine.includes('description')));
    }

    static isMarkdownFrontmatter(text) {
        return text.trim().startsWith('---') && text.includes('---', 3);
    }

    static isCSVFormat(text) {
        const lines = text.trim().split('\n');
        return lines[0].includes(',') && lines.length > 1;
    }

    static parseTabularFormat(text) {
        console.log('📊 Parsing tabular format content');
        const lines = text.trim().split('\n');
        if (lines.length < 2) return {};

        // Get headers from first line
        const headers = lines[0].split('\t').map(h => h.trim());
        console.log('Headers found:', headers);

        // Get data from second line (or find the data line)
        let dataLine = null;
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() && !lines[i].startsWith('---')) {
                dataLine = lines[i];
                break;
            }
        }

        if (!dataLine) return {};

        const values = dataLine.split('\t').map(v => v.trim());
        console.log('Values found:', values);

        const data = {};
        headers.forEach((header, index) => {
            if (values[index]) {
                // Clean up the header name
                const cleanHeader = header.toLowerCase()
                    .replace(/[^a-z0-9]/g, '')
                    .replace('projectdegree', 'degree')
                    .replace('project', 'title');
                
                let value = values[index];
                
                // Parse dates
                if (header.toLowerCase().includes('date') || header.toLowerCase().includes('time')) {
                    if (value.includes('UTC')) {
                        value = new Date(value).toISOString().split('T')[0]; // Convert to YYYY-MM-DD
                    }
                }
                
                data[cleanHeader] = value;
            }
        });

        console.log('Parsed tabular data:', data);
        return data;
    }

    static parseCSVFormat(text) {
        console.log('📋 Parsing CSV format content');
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        if (lines.length < 2) return {};
        
        const values = lines[1].split(',').map(v => v.trim().replace(/"/g, ''));
        const data = {};
        
        headers.forEach((header, index) => {
            if (values[index]) {
                data[header.toLowerCase().replace(/[^a-z0-9]/g, '')] = values[index];
            }
        });

        return data;
    }

    static parseMarkdownFrontmatter(text) {
        console.log('📝 Parsing markdown frontmatter');
        const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
        const match = text.match(frontmatterRegex);
        
        if (!match) return {};
        
        const frontmatter = match[1];
        const data = {};
        
        // Enhanced YAML parser
        const lines = frontmatter.split('\n');
        let currentKey = null;
        let currentValue = '';
        let inMultiline = false;
        let inArray = false;
        let arrayItems = [];
        
        for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.includes('|') && !inMultiline) {
                currentKey = line.split(':')[0].trim();
                inMultiline = true;
                currentValue = '';
            } else if (inMultiline) {
                if (line.startsWith('  ')) {
                    currentValue += (currentValue ? '\n' : '') + line.substring(2);
                } else {
                    data[currentKey] = currentValue.trim();
                    inMultiline = false;
                    
                    if (line.includes(':')) {
                        const [key, value] = line.split(':').map(s => s.trim());
                        data[key] = value.replace(/^["']|["']$/g, '');
                    }
                }
            } else if (line.trim().startsWith('- ')) {
                if (!inArray) {
                    inArray = true;
                    arrayItems = [];
                }
                arrayItems.push(line.trim().substring(2).trim());
            } else if (line.includes(':') && !line.trim().startsWith('- ')) {
                if (inArray && currentKey) {
                    data[currentKey] = arrayItems;
                    inArray = false;
                }
                
                const [key, value] = line.split(':').map(s => s.trim());
                currentKey = key;
                
                if (value) {
                    data[key] = value.replace(/^["']|["']$/g, '');
                } else {
                    inArray = true;
                    arrayItems = [];
                }
            }
        }
        
        if (inMultiline && currentKey) {
            data[currentKey] = currentValue.trim();
        }
        if (inArray && currentKey) {
            data[currentKey] = arrayItems;
        }
        
        return data;
    }

    static parseGeneric(text) {
        console.log('🔍 Attempting generic parsing');
        const data = {};
        const lines = text.split('\n');
        
        // Try to find key-value pairs in any format
        lines.forEach(line => {
            if (line.includes(':')) {
                const [key, ...valueParts] = line.split(':');
                const value = valueParts.join(':').trim();
                if (key && value) {
                    data[key.trim().toLowerCase().replace(/[^a-z0-9]/g, '')] = value;
                }
            }
        });

        return data;
    }

    // Helper method to normalize field names for consistency
    static normalizeFieldName(fieldName) {
        const normalizations = {
            'projectdegree': 'degree',
            'project': 'title',
            'startdate': 'startDate',
            'enddate': 'endDate'
        };

        const normalized = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '');
        return normalizations[normalized] || normalized;
    }
}

// Export for global use
window.MultiFormatContentParser = MultiFormatContentParser;
