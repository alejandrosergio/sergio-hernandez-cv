import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { transform } from 'esbuild';
import { parseHTML } from 'linkedom';

const source = await readFile(new URL('../src/cursor.js', import.meta.url), 'utf8');
const {code} = await transform(source, {format:'iife', globalName:'CursorDetail'});

function fixture({fine = true, motion = false, forced = false, disabled = false} = {}) {
  const {document, window:dom} = parseHTML('<!doctype html><html><body><button>Control</button></body></html>');
  const media = new Map();
  const frames = new Map();
  const windowEvents = new Map();
  let nextFrame = 0;
  let blocked = disabled;
  let visibility = 'visible';
  Object.defineProperty(document, 'visibilityState', {get:() => visibility});
  const matchMedia = query => {
    if (!media.has(query)) {
      const listeners = [];
      const matches = query.includes('forced-colors') ? forced : query.includes('reduced-motion') ? motion : fine;
      media.set(query, {matches, addEventListener:(_, listener) => listeners.push(listener), set(value) {
        this.matches = value;
        listeners.forEach(listener => listener({matches:value}));
      }});
    }
    return media.get(query);
  };
  const window = {addEventListener:(type, listener) => windowEvents.set(type, [...(windowEvents.get(type) || []), listener])};
  const context = vm.createContext({document, window, matchMedia,
    requestAnimationFrame:callback => {const id = ++nextFrame; frames.set(id, callback); return id;},
    cancelAnimationFrame:id => frames.delete(id)
  });
  vm.runInContext(code, context);
  const motionMedia = matchMedia('(prefers-reduced-motion: reduce)');
  const controller = context.CursorDetail.createCursorDetail({motionMedia, isDisabled:() => blocked});
  const emit = (type, properties = {}) => {
    const event = new dom.Event(type);
    Object.assign(event, properties);
    document.dispatchEvent(event);
  };
  return {
    document, media, frames,
    halo:() => document.querySelector('.cursor-halo'),
    move:(x = 100, y = 120, pointerType = 'mouse') => emit('pointermove', {clientX:x, clientY:y, pointerType}),
    emit,
    emitWindow:type => (windowEvents.get(type) || []).forEach(listener => listener()),
    flush:() => {const scheduled = [...frames.values()]; frames.clear(); scheduled.forEach(callback => callback());},
    disable:value => {blocked = value; controller.refresh();},
    visibility:value => {visibility = value; emit('visibilitychange');}
  };
}

// La decoración no aparece en táctil, con reducción de movimiento ni con alto contraste.
for (const options of [{fine:false}, {motion:true}, {forced:true}, {disabled:true}]) {
  const page = fixture(options);
  page.move();
  page.flush();
  assert.equal(page.halo(), null);
  assert.equal(page.frames.size, 0);
}

const page = fixture();
assert.equal(page.halo(), null, 'No halo antes de mover el ratón');
page.move(100, 120);
page.move(150, 170);
assert.equal(page.frames.size, 1, 'Los eventos rápidos comparten un solo fotograma');
page.flush();
assert.equal(page.halo().getAttribute('aria-hidden'), 'true');
assert.equal(page.halo().hidden, false);
assert.equal(page.halo().style.transform, 'translate3d(139px,159px,0)');
assert.equal(page.frames.size, 0, 'No hay animación permanente después del movimiento');

for (const stop of [
  () => page.emit('keydown', {key:'Tab'}),
  () => page.emit('pointerout', {relatedTarget:null}),
  () => page.emit('pointercancel'),
  () => page.emitWindow('blur'),
  () => page.move(20, 30, 'touch'),
  () => page.move(20, 30, 'pen')
]) {
  page.move(); page.flush(); stop();
  assert.equal(page.halo().hidden, true);
  assert.equal(page.frames.size, 0);
}
page.move();
page.emit('pointerout', {relatedTarget:null});
page.flush();
assert.equal(page.halo().hidden, true, 'Salir cancela también una actualización pendiente');

// La conexión de un ratón y los cambios de preferencias se aplican sin recargar.
for (const query of ['(hover: hover) and (pointer: fine)', '(prefers-reduced-motion: reduce)', '(forced-colors: active)']) {
  const media = page.media.get(query);
  const enabledValue = query.includes('pointer');
  page.move(); page.flush();
  media.set(!enabledValue);
  assert.equal(page.halo().hidden, true);
  page.move(); page.flush();
  assert.equal(page.halo().hidden, true);
  media.set(enabledValue);
  assert.equal(page.halo().hidden, true, 'Reactivar espera el siguiente movimiento');
  page.move(); page.flush();
  assert.equal(page.halo().hidden, false);
}
page.disable(true);
assert.equal(page.halo().hidden, true);
page.move(); page.flush();
assert.equal(page.halo().hidden, true);
page.disable(false);
page.move(); page.flush();
assert.equal(page.halo().hidden, false);
page.visibility('hidden');
page.move(); page.flush();
assert.equal(page.halo().hidden, true);
page.visibility('visible');
assert.equal(page.halo().hidden, true);
page.move(); page.flush();
assert.equal(page.halo().hidden, false);
page.emitWindow('beforeprint');
page.move(); page.flush();
assert.equal(page.halo().hidden, true);
page.emitWindow('afterprint');
assert.equal(page.halo().hidden, true);
page.move(); page.flush();
assert.equal(page.halo().hidden, false);
assert.equal(page.document.querySelectorAll('.cursor-halo').length, 1);
console.log('Passed: subtle mouse detail, event coalescing, keyboard, touch, print and accessibility preferences.');
