const path = require('path');
const fs = require('fs');

const CopyWebpackPlugin = require('copy-webpack-plugin');

const rootExport = require.resolve('govuk-frontend');
const root = path.resolve(rootExport, '..');
const sass = path.resolve(root, 'all.scss');
const javascript = path.resolve(root, 'all.js');
const components = path.resolve(root, 'components');
const assets = path.resolve(root, 'assets');
const images = path.resolve(assets, 'images');
const fonts = path.resolve(assets, 'fonts');
const macros = path.resolve(root, 'macros');
const rebrand = path.resolve(assets, 'rebrand');

const patterns = [
  { from: images, to: 'assets/images' },
  { from: fonts, to: 'assets/fonts' },
  { from: `${root}/template.njk`, to: '../views/govuk' },
  { from: `${root}/components`, to: '../views/govuk/components' },
];

// Add macros folder if it exists (govuk-frontend 4.10.0+)
if (fs.existsSync(macros)) {
  patterns.push({ from: macros, to: '../views/govuk/macros' });
}

// Add rebrand assets if they exist (govuk-frontend 4.10.0+)
if (fs.existsSync(rebrand)) {
  patterns.push({ from: rebrand, to: 'assets/rebrand' });
}

const copyGovukTemplateAssets = new CopyWebpackPlugin({
  patterns,
});

module.exports = {
  paths: { template: root, components, sass, javascript, assets },
  plugins: [copyGovukTemplateAssets],
};
