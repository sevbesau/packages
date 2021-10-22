const fs = require('fs');
const path = require('path');

// initialize global mailjet variable
let mailjet;

// templates class
const templates = {
  /**
   * Adds a single template to the templates
   * @param {String} id the id of the template
   * @param {String} template the template itself
   */
  add(id, template) {
    if (!!templates[id]) throw new Error(`Duplicate template: '${id}'`);
    if (!template.body) throw new Error('Template has no body');
    if (!template.subject) throw new Error('Template has no subject');
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
      const body = fs.readFileSync(path.join(scanPath, file)).toString();
      // base the subject on the filename
      // TODO better subject system (parse from template file!!)
      const subject = id
        .split('_')
        .map(el => el[0] = el[0].toUpperCase() + el.substring(1))
        .join(' ');
      this.add(id, { subject, body });
    });
  },
  /**
   * Replace all keys in the template with the suplied data
   * @param {String} id the id of the template
   * @param {Object} data key value pairs to replace in the template
   * @returns {String} the resolved template
   */
  replace(id, data = {}) {
    if (!this[id]) throw new Error(`Template not found: '${id}'`);
    const template = { ...this[id] };
    Object.keys(data).forEach(key => {
      const re = new RegExp(`{{ *${key} *}}`, 'gi');
      if (!re.test(template.body)) throw new Error(`Invalid template key: "${key}"`);
      template.body = template.body.replace(re, data[key]);
    });
    if (/{{.*}}/.test(template.body)) throw new Error(`Unresolved data in template!`)
    return template;
  },
};

/**
 * Connect to mailjet using our keys
 * @param {String} apikey_pub public mailjet api key
 * @param {String} apikey_priv private mailjet api key
 */
const connect = (apikey_pub, apikey_priv) => {
  mailjet = require('node-mailjet').connect(apikey_pub, apikey_priv)
}

/**
 * Send a custom template email 
 * @param {String} to email of the recipient
 * @param {String} templateId id of the template
 * @param {Object} data template data
 * @param {Object} options extra options
 * @returns {Boolean} indicates succes
 */
const send = async (from, to, templateId, data, options = {}) => {
  if (!mailjet) throw new Error('Mailjet connection failed');
  const template = templates.replace(templateId, data);
  const res = await mailjet
    .post("send", { 'version': 'v3.1' })
    .request({
      Messages: [
        {
          From: { Email: from },
          To: [{ Email: to }],
          Subject: template.subject,
          HTMLPart: template.body,
        }
      ]
    })
  return res.body.Messages[0].Status === 'success';
}

module.exports = {
  connect,
  templates,
  send,
};
