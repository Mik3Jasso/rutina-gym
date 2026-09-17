# Rutina Gym

App web para seguir una rutina de gimnasio de 5 días, registrando peso,
repeticiones reales e historial por ejercicio. Cada persona tiene su
propia cuenta y **sólo ve sus propios registros**.

## Cómo funciona

- **Frontend:** HTML, CSS y JavaScript sin framework ni paso de compilación.
  GitHub Pages sirve los archivos tal cual.
- **Backend:** Supabase (proyecto `RutinaGym`) para autenticación y datos.
- **Privacidad:** Row Level Security en Postgres. Cada consulta queda
  restringida a las filas del usuario autenticado; la separación la impone
  la base de datos, no la interfaz.

La llave `sb_publishable_...` en `js/app.js` es pública por diseño y está
pensada para ir en el navegador. Lo que protege los datos es RLS.

## Estructura

    index.html              Estructura de las pantallas
    css/styles.css          Estilos, primero para celular
    js/rutina.js            La rutina: ejercicios, ilustraciones SVG y técnica
    js/app.js               Autenticación, registro de series, historial, temporizador

## Base de datos

| Tabla | Para qué |
|---|---|
| `profiles` | Nombre de cada usuario, creado automáticamente al registrarse |
| `rutinas_usuario` | Qué rutinas tiene cada persona en su catálogo y cuál usa ahora |
| `sesiones` | Un entrenamiento: rutina, día, fecha y si se hizo el cardio |
| `series_log` | Peso, repeticiones y check de cada serie |
| `ultimo_registro` | Vista: último peso usado en cada ejercicio y serie |

## Base de datos de ejercicios

`js/rutina.js` contiene 88 ejercicios. Cada uno lleva, además de su nombre,
ilustración y notas de técnica:

| Campo | Para qué |
|---|---|
| `tipo` | Zona del cuerpo: `tronco-superior`, `pierna`, `brazo` u `hombro` |
| `grupos` | Músculos que trabaja, en detalle |
| `patron` | Patrón de movimiento (`empuje-horizontal`, `bisagra`, `zancada`…) |
| `equipo` | Qué hace falta: `ninguno`, `mancuernas`, `barra`, `polea`, `maquina`… |
| `unilateral` | Si se trabaja una extremidad a la vez |
| `equivalentes` | Ejercicios que lo pueden sustituir |

36 ejercicios forman la rutina del entrenador; los otros 52 existen sólo
como alternativas para cuando un aparato está ocupado o no se tiene el
equipo que pide el ejercicio. La lista se cruzó con
[free-exercise-db](https://github.com/yuhonas/free-exercise-db) (dominio
público, 876 ejercicios) para no dejar fuera nada común ni inventarse
nombres, pero la selección es curada a mano: el criterio automático
proponía rarezas como *Kettlebell Pirate Ships* o *Cable Judo Flip*.

Cubre abdomen, pantorrilla y trapecio, que la rutina del entrenador no
entrena pero forman parte de cualquier gimnasio.

Las listas de `equivalentes` se generaron uniendo los ejercicios que
comparten patrón de movimiento y músculo, más algunos enlaces a mano
donde el mismo patrón sólo existe en máquina. Son recíprocas: si A
sustituye a B, B sustituye a A.

El orden responde a una pregunta concreta: *la máquina está ocupada,
¿qué puedo hacer ahora mismo?* Por eso no ordena por "cuánto equipo
pide" sino por qué tan seguro es encontrarlo libre en un gimnasio:

| | |
|---|---|
| Tu propio peso | siempre |
| Barra, mancuernas, disco, banco, barra Z | zona de peso libre, siempre hay |
| Polea, barra fija, barras paralelas | hay, pero pocas estaciones |
| Máquina, Smith, banda, cajón | estación concreta, o no todos los gyms la tienen |

Una barra cuenta como más disponible que una máquina: en un gimnasio
siempre hay barras, y la máquina concreta que buscas es justo lo que
puede estar ocupado.

Tres patrones existen **sólo** en máquina y no tienen sustituto directo:
extensión de rodilla, flexión de rodilla y aducción. Llevan enlace a
mano hacia ejercicios que trabajan el mismo músculo con otro patrón.

## Agregar una rutina nueva

Las rutinas se definen en `js/rutina.js`, en el array `RUTINAS`. Cada una
lleva su `id`, su `nombre`, la fecha en que se creó y sus días; los
ejercicios se toman de `EJERCICIOS` y los que falten se dibujan en el
mismo archivo. Una rutina con `porDefecto: true` aparece sola en el
catálogo de cualquiera que entre.

Para dársela sólo a ciertas personas, se deja `porDefecto: false` y se
insertan las filas correspondientes en `rutinas_usuario`.

## La rutina

4 series por ejercicio — 15 / 12 / 10 / 8 repeticiones, subiendo el peso
en cada serie. Los ejercicios van en superserie por parejas. Cardio de
20 a 30 minutos después de las pesas.

1. **Pecho** — banco inclinado/pull over · banco horizontal/cross over · cristos/fondos abiertos
2. **Cuádriceps** — sentadilla/extensiones · prensa/aductor · extensión unilateral/desplante en Smith
3. **Brazo** — barra de pie/martillos · predicador/concentrado en polea · press francés/jalón a una mano supino · cuerda/patada de mula
4. **Espalda y hombro** — jalón frontal abierto/posterior con mancuerna · jalón frontal cerrado/laterales con cable · remo sentado/press Arnold · remo con mancuerna/levantamiento frontal con disco
5. **Femoral y glúteo** — femoral acostado/peso muerto · femoral de pie/abductor · desplante caminando/patada en máquina · femoral sentado/sentadilla china

## Desarrollo local

    python3 -m http.server 8000

Y abrir http://localhost:8000
