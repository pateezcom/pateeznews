
const fs = require('fs');
const path = require('path');

const trPath = '/Users/pateez/Desktop/buzz-haber-en-son/lib/locales/tr.ts';
const enPath = '/Users/pateez/Desktop/buzz-haber-en-son/lib/locales/en.ts';
const arPath = '/Users/pateez/Desktop/buzz-haber-en-son/lib/locales/ar.ts';
const componentKeysPath = '/Users/pateez/Desktop/buzz-haber-en-son/component_keys.txt';

function parseLocale(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const result = {};
    lines.forEach(line => {
        const match = line.match(/^\s*"([^"]+)"\s*:\s*"(.+)",?$/);
        if (match) {
            result[match[1]] = match[2];
        }
    });
    return result;
}

const tr = parseLocale(trPath);
const en = parseLocale(enPath);
const ar = parseLocale(arPath);

const componentKeys = fs.readFileSync(componentKeysPath, 'utf8')
    .split('\n')
    .map(k => k.trim())
    .filter(k => k.includes('.') && !k.startsWith('.'));

const report = componentKeys.map(key => ({
    key,
    tr: tr[key] || 'MISSING',
    en: en[key] || 'MISSING',
    ar: ar[key] || 'MISSING'
}));

console.log(JSON.stringify(report, null, 2));
