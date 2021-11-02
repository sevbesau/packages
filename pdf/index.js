const fs = require('fs');
const ejs = require('ejs')
const path = require('path');
const html_to_pdf = require('html-pdf-node');
const id = require('@siliconminds/id');

const templates = {
  /**
   * Adds a single template to the templates
   * @param {String} id the id of the template
   * @param {String} template the template itself
   */
  add(id, template) {
    if (!!templates[id]) throw new Error(`Duplicate template: '${id}'`);
    templates[id] = template;
  },
  /**
   * Scan a directory for html template files
   * @param {String} scanPath path to scan for templates
   */
  scanDir(scanPath) {
    fs.readdirSync(scanPath).forEach((file) => {
      if (!/\.html$/.test(file) || file === 'index.js') return;
      const id = file.replace('.html', '');
      const template = fs.readFileSync(path.join(scanPath, file)).toString();
      this.add(id, template);
    });
  },
  /**
   * Render the ejs template into html
   * @param {String} id id of the template
   * @param {Object} data key value pairs to replace
   * @returns {String} the generated html
   */
  render(id, data = {}) {
    const template = templates[id];
    if (!template) throw new Error(`Invalid template: "${id}"`);
    const html = ejs.render(template, data);
    if (/<%.*%>/.test(html)) throw new Error(`Unresolved data in template!`)
    return html;
  }
};

/**
 * Generate a pdf based on a template and given data
 * @param {String} templateId id of the template
 * @param {Object} data key value pairs to fill in
 * @param {String} filepath path for the generated pdf
 * @returns {String} the id of the generated pdf
 */
const generate = async (templateId, data, filepath) => {
  // fill in the template
  const html = templates.render(templateId, data);
  // generate random id for the pdf
  const pdfId = id.generate();
  // generate a pdf based on the html
  await html_to_pdf.generatePdf(
    { content: html },
    {  // generation options
      format: 'A4', 
      margin: { top: '30px', bottom: '30px' }, 
      path: path.join(filepath, `${pdfId}.pdf`), 
      printBackground: true 
    }
  );
  // return the pdf id
  return pdfId;
}

module.exports = {
  generate,
  templates,
};
