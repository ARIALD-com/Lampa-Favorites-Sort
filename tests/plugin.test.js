'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const code = fs.readFileSync(path.join(__dirname, '..', 'lampa-favorites-sort.js'), 'utf8');

function launch(locale = 'ru', initialStorage = {}) {
  const raw = {
    book: [
      {id: 1, type: 'movie', title: 'Ёлки', release_date: '2010-12-16'},
      {id: 2, type: 'movie', title: 'Аватар', release_date: '2009-12-18'},
      {id: 3, type: 'movie', title: '12 обезьян', release_date: '1995-12-29'}
    ],
    like: [{id: 2, type: 'movie', title: 'Аватар', release_date: '2009-12-18'}, {id: 4, type: 'tv', name: 'Офис', first_air_date: '2005-03-24'}],
    history: [{id: 9, title: 'История'}],
    custom: [{id: 7, title: 'Custom'}]
  };
  const oldSnapshot = JSON.stringify(raw);
  const storage = {language: locale, ariald_favsort_book: 'za', ...initialStorage}; // existing v1.0 preference
  const params = [];
  const components = [];
  const manifests = [];
  const translations = [];
  const menuButtons = [];
  let refreshes = 0;
  let lastOpen = null;
  const active = {component:'favorite', activity:{refresh: () => {refreshes += 1;}}};
  const Lampa = {
    Favorite: {
      get: ({type}) => raw[type] ? raw[type].slice() : [],
      all: () => Object.fromEntries(Object.entries(raw).map(([key, items]) => [key, items.slice()]))
    },
    Storage: {field: (key) => storage[key], get: (key, fallback) => key in storage ? storage[key] : fallback, set: (key, value) => {storage[key] = value;}},
    SettingsApi: {addComponent: c => components.push(c), addParam: p => params.push(p)},
    Manifest: {set plugins(x) {manifests.push(x);}},
    Lang: {add: o => translations.push(o)},
    Activity: {active: () => active, push: p => {lastOpen = p;}},
    Listener: {follow: () => {}},
    Menu: {addButton: (icon, title, onClick) => {
      const button = {icon, title, onClick, visible: true,
        toggle: function (on) {this.visible=on; return this;}};
      menuButtons.push(button);
      return button;
    }}
  };
  const sandbox = {window: {appready: true, Lampa}, Lampa, console, setTimeout: (fn) => {fn(); return 1;}, clearTimeout: () => {}, Intl, Object};
  vm.runInNewContext(code, sandbox);
  return {Lampa, raw, storage, params, components, manifests, translations,
    refreshes: () => refreshes, open: () => lastOpen, active, oldSnapshot, sandbox, menuButtons};
}

(function testRussianAndSorting() {
  const c = launch('ru');
  assert.strictEqual(c.components[0].name, 'Сортировка избранного');
  assert.strictEqual(c.manifests[0].name, 'Сортировка избранного');
  assert.strictEqual(c.manifests[0].version, '1.2.2');
  assert.strictEqual(c.manifests[0].author, 'ARIALD');
  assert.strictEqual(c.params.length, 13);
  assert.strictEqual(c.params.find(p=>p.param.name==='ariald_favsort_version_info').field.name, 'Версия: 1.2.2');
  assert.strictEqual(c.params.find(p=>p.param.name==='ariald_favsort_author_info').field.name, 'Автор: ARIALD');
  assert.strictEqual(c.Lampa.Favorite.get({type:'book'}).map(x=>x.title).join(','), 'Ёлки,Аватар,12 обезьян');
  c.storage.ariald_favsort_book = 'inherit';
  assert.strictEqual(c.Lampa.Favorite.get({type:'book'}).map(x=>x.title).join(','), '12 обезьян,Аватар,Ёлки');
  assert.strictEqual(c.Lampa.Favorite.get({type:'history'}).map(x=>x.title).join(','), 'История');
  assert.strictEqual(c.Lampa.Favorite.get({type:'custom'}).map(x=>x.title).join(','), 'Custom');
  assert.strictEqual(JSON.stringify(c.raw), c.oldSnapshot, 'Must not mutate favorites');
  const openAll = c.params.find(p=>p.param.name==='ariald_favsort_open');
  openAll.onChange();
  assert.strictEqual(c.open().component, 'favorite');
  assert.strictEqual(c.open().type, '__ariald_favorites_all__');
  assert.strictEqual(c.Lampa.Favorite.get({type:'__ariald_favorites_all__'}).length, 4, 'All view deduplication');
  c.storage.ariald_favsort_all='old';
  assert.strictEqual(c.Lampa.Favorite.get({type:'__ariald_favorites_all__'}).length, 4);
  assert.strictEqual(JSON.stringify(c.raw), c.oldSnapshot);
  console.log('PASS Russian localization, sort, storage, dedup, read-only');
})();

(function testRefresh() {
  const c = launch('en');
  assert.strictEqual(c.components[0].name, 'Favorites Sort');
  const param = c.params.find(p=>p.param.name==='ariald_favsort_all');
  c.storage.ariald_favsort_all='za';
  param.onChange();
  assert.strictEqual(c.refreshes(), 1, 'Refreshes underlying favorites screen immediately');
  c.active.component='bookmarks';
  param.onChange();
  assert.strictEqual(c.refreshes(), 2, 'Refreshes bookmark views');
  c.active.component='player';
  param.onChange();
  assert.strictEqual(c.refreshes(), 2, 'Does not refresh unrelated components');
  console.log('PASS automatic refresh, relevant activities only');
})();

(function testLanguages() {
  const languages = {uk:'Сортування обраного', en:'Favorites Sort', de:'Favoriten sortieren',
    fr:'Trier les favoris', pl:'Sortowanie ulubionych', es:'Ordenar favoritos', it:'Favorites Sort'};
  for (const [lang, expected] of Object.entries(languages)) {
    const c=launch(lang);
    assert.strictEqual(c.manifests[0].name, expected, 'Incorrect language: ' + lang);
    assert.ok(c.translations[0].ariald_favsort_plugin[lang] || lang === 'it');
  }
  const titles = {ru:'Всё избранное', uk:'Усе обране', en:'All Favorites', de:'Alle Favoriten', fr:'Tous les favoris', pl:'Wszystkie ulubione', es:'Todos los favoritos'};
  for (const [lang, title] of Object.entries(titles)) {
    const c=launch(lang);
    const open=c.params.find(p=>p.param.name==='ariald_favsort_open');
    open.onChange();
    assert.strictEqual(c.open().title, title, 'Short all-favorites heading: ' + lang);
    assert.strictEqual(c.menuButtons[0].title, title, 'Short menu label: ' + lang);
    assert.ok(c.params.find(p=>p.param.name==='ariald_favsort_version_info').field.name.includes('1.2.2'));
    assert.ok(c.params.find(p=>p.param.name==='ariald_favsort_author_info').field.name.includes('ARIALD'));
  }
  console.log('PASS seven languages, short title, localized about lines and English fallback');
})();


(function testDefaultLanguageIsEnglish() {
  // A missing/empty application language defaults to English.
  const noLocale = launch(null);
  assert.strictEqual(noLocale.components[0].name, 'Favorites Sort', 'No locale -> English');
  const emptyLocale = launch('');
  assert.strictEqual(emptyLocale.components[0].name, 'Favorites Sort', 'Empty locale -> English');
  const unsupported = launch('pt-BR');
  assert.strictEqual(unsupported.components[0].name, 'Favorites Sort', 'Unsupported locale -> English');
  const usEnglish = launch('en-US');
  assert.strictEqual(usEnglish.components[0].name, 'Favorites Sort', 'Language variants use English');
  const ukrainian = launch('uk-UA');
  assert.strictEqual(ukrainian.components[0].name, 'Сортування обраного', 'Supported locales remain localized');
  console.log('PASS default English, unsupported locales and regional variants');
})();

(function testReleaseYearsAndUnknownDates() {
  const c = launch('en');
  const originalBook = c.Lampa.Favorite.get({type:'book'}).map(x=>x.id).join(',');
  c.storage.ariald_favsort_book='year_asc';
  assert.strictEqual(c.Lampa.Favorite.get({type:'book'}).map(x=>x.id).join(','), '3,2,1');
  c.storage.ariald_favsort_book='year_desc';
  assert.strictEqual(c.Lampa.Favorite.get({type:'book'}).map(x=>x.id).join(','), '1,2,3');
  c.storage.ariald_favsort_all='year_asc';
  assert.strictEqual(c.Lampa.Favorite.get({type:'__ariald_favorites_all__'}).map(x=>x.id).join(','), '3,4,2,1');
  c.storage.ariald_favsort_all='year_desc';
  assert.strictEqual(c.Lampa.Favorite.get({type:'__ariald_favorites_all__'}).map(x=>x.id).join(','), '1,2,4,3');
  c.raw.book.push({id:5, type:'movie', title:'Unknown'});
  c.raw.book.push({id:6, type:'movie', title:'Invalid', release_date:'not-a-date'});
  c.raw.book.push({id:7, type:'movie', title:'Only year', year: 2017});
  c.raw.book.push({id:8, type:'movie', title:'Tied', release_year: 2009});
  c.storage.ariald_favsort_book='year_asc';
  assert.strictEqual(c.Lampa.Favorite.get({type:'book'}).map(x=>x.id).join(','), '3,2,8,1,7,5,6');
  c.storage.ariald_favsort_book='year_desc';
  assert.strictEqual(c.Lampa.Favorite.get({type:'book'}).map(x=>x.id).join(','), '7,1,2,8,3,5,6');
  assert.notStrictEqual(originalBook, '', 'The original list was non-empty');
  assert.strictEqual(c.raw.book[0].id, 1, 'Read-only: original array order unchanged');
  assert.strictEqual(c.raw.book[3].id, 5, 'Unknown year remains in original stored position');
  console.log('PASS release year sort, missing dates last, TV premiere, stable ties, read-only');
})();

(function testMenuVisibilityAndLegacySettings() {
  const c=launch('ru');
  assert.strictEqual(c.menuButtons.length, 1, 'Menu shortcut appears by default');
  assert.strictEqual(c.menuButtons[0].visible, true);
  const menuParam=c.params.find(p=>p.param.name==='ariald_favsort_menu');
  assert.strictEqual(menuParam.param.default,'show');
  c.storage.ariald_favsort_menu='hide';
  menuParam.onChange('hide');
  assert.strictEqual(c.menuButtons[0].visible,false, 'Hides shortcut immediately');
  assert.strictEqual(c.params.some(p=>p.param.name==='ariald_favsort_open'), true, 'Settings shortcut remains');
  c.storage.ariald_favsort_menu='show';
  menuParam.onChange('show');
  assert.strictEqual(c.menuButtons[0].visible,true, 'Shows shortcut immediately without duplication');
  assert.strictEqual(c.menuButtons.length,1);
  c.menuButtons[0].onClick();
  assert.strictEqual(c.open().type,'__ariald_favorites_all__');
  console.log('PASS menu show/hide, reversible without reinstall, settings fallback');
})();

(function testMenuHiddenOnLaunch() {
  const c=launch('en', {ariald_favsort_menu:'hide'});
  assert.strictEqual(c.menuButtons.length,0, 'Do not add sidebar shortcut when hidden at startup');
  c.storage.ariald_favsort_menu='show';
  c.sandbox.window.__ariald_favorites_sort.updateMenuVisibility();
  assert.strictEqual(c.menuButtons.length,1, 'Re-enable without restarting the app');
  assert.strictEqual(c.menuButtons[0].visible,true);
  c.storage.ariald_favsort_menu='hide';
  c.sandbox.window.__ariald_favorites_sort.updateMenuVisibility();
  assert.strictEqual(c.menuButtons[0].visible,false);
  console.log('PASS menu persistence across plugin reloads and dynamic re-enable');
})();
