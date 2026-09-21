// Sella los archivos con una versión para que un despliegue llegue de
// verdad al navegador. GitHub Pages manda cache-control: max-age=600 y,
// sin esto, alguien puede quedarse con el index.html nuevo y el app.js
// viejo (o al revés) durante minutos, o mucho más si añadió la app a la
// pantalla de inicio.
import fs from 'fs';

const version = process.argv[2] ||
  new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);

const sello = (txt, patron, sustituto) => {
  const antes = txt;
  txt = txt.replace(patron, sustituto);
  if (txt === antes) throw new Error('no se pudo sellar: ' + patron);
  return txt;
};

let html = fs.readFileSync('index.html', 'utf8');
html = sello(html, /href="css\/styles\.css(\?v=[^"]*)?"/, `href="css/styles.css?v=${version}"`);
html = sello(html, /src="js\/app\.js(\?v=[^"]*)?"/,       `src="js/app.js?v=${version}"`);
fs.writeFileSync('index.html', html);

let app = fs.readFileSync('js/app.js', 'utf8');
app = sello(app, /from '\.\/rutina\.js(\?v=[^']*)?'/, `from './rutina.js?v=${version}'`);
app = sello(app, /from '\.\/util\.js(\?v=[^']*)?'/, `from './util.js?v=${version}'`);
fs.writeFileSync('js/app.js', app);

console.log('sellado con la versión', version);
