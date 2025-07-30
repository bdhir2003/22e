const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const { content, filename } = JSON.parse(event.body);
        
        // Validate inputs
        if (!content || !filename) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Content and filename are required' }),
            };
        }

        // Only allow saving to portfolio-data.js for security
        if (filename !== 'portfolio-data.js') {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'Only portfolio-data.js can be updated' }),
            };
        }

        // In a real deployment, you would:
        // 1. Use GitHub API to update the file
        // 2. Or write to a database
        // 3. Or use Netlify's Git Gateway
        
        // For now, we'll return success but the file won't actually be updated
        // This is because Netlify functions can't write to the deployed files directly
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Portfolio data received. Note: Auto-save is in development mode.',
                fallback: true
            }),
        };
        
    } catch (error) {
        console.error('Error in save-portfolio function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
