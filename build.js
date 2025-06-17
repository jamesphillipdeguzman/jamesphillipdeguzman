const fs = require('fs');
const path = require('path');

// Read template files
const headerTemplate = fs.readFileSync(path.join(__dirname, 'src/public/partials/header.html'), 'utf8');
const footerTemplate = fs.readFileSync(path.join(__dirname, 'src/public/partials/footer.html'), 'utf8');

// Function to process HTML files
function processHtmlFile(filePath) {
    console.log(`Processing ${filePath}...`);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace header placeholder
    if (content.includes('<header id="header-container">')) {
        content = content.replace(
            /<header id="header-container">[\s\S]*?<\/header>/,
            `<header id="header-container">\n${headerTemplate}\n</header>`
        );
    }

    // Replace footer placeholder
    if (content.includes('<footer id="footer-container">')) {
        content = content.replace(
            /<footer id="footer-container">[\s\S]*?<\/footer>/,
            `<footer id="footer-container">\n${footerTemplate}\n</footer>`
        );
    }

    // Write the processed file
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
}

// Process all HTML files in the src directory
function processDirectory(directory) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.html')) {
            processHtmlFile(filePath);
        }
    });
}

// Start processing from src directory
console.log('Starting build process...');
processDirectory(path.join(__dirname, 'src'));
console.log('Build complete!'); 