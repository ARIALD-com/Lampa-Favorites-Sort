/*!
 * Lampa Favorites Sort v1.2.2
 * Copyright (c) 2026 ARIALD
 * MIT License: https://opensource.org/licenses/MIT
 *
 * Non-destructive client-side sorting for the Lampa favorites interface.
 * No dependencies, network requests, or writes to favorite records.
 */
(function () {
  'use strict';

  // Keep this guard compatible with v1.0: update the existing URL, then restart Lampa.
  if (window.__ariald_favorites_sort) return;

  var VERSION = '1.2.2';
  var COMPONENT = 'ariald_favsort';
  var ALL_TYPE = '__ariald_favorites_all__';
  var CATEGORIES = [
    ['book', 'cat_book'], ['like', 'cat_like'], ['wath', 'cat_wath'],
    ['look', 'cat_look'], ['viewed', 'cat_viewed'],
    ['scheduled', 'cat_scheduled'], ['continued', 'cat_continued'],
    ['thrown', 'cat_thrown']
  ];
  var ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h13M3 12h9M3 18h5M18 4v16m-4-4 4 4 4-4"/></svg>';

  // The official Lampa language system accepts the same keys via Lang.add().
  // t() provides a predictable English fallback for unsupported locales.
  var TEXT = {
    plugin: {ru:'Сортировка избранного',uk:'Сортування обраного',en:'Favorites Sort',de:'Favoriten sortieren',fr:'Trier les favoris',pl:'Sortowanie ulubionych',es:'Ordenar favoritos'},
    description: {ru:'Сортировка фильмов и сериалов вместе или по категориям',uk:'Сортування фільмів і серіалів разом або за категоріями',en:'Sort movies and series together or by category',de:'Filme und Serien zusammen oder nach Kategorie sortieren',fr:'Trier les films et séries ensemble ou par catégorie',pl:'Sortuj filmy i seriale razem lub według kategorii',es:'Ordena películas y series juntas o por categoría'},
    all_title: {ru:'Всё избранное',uk:'Усе обране',en:'All Favorites',de:'Alle Favoriten',fr:'Tous les favoris',pl:'Wszystkie ulubione',es:'Todos los favoritos'},
    open_all: {ru:'Открыть всё избранное',uk:'Відкрити все обране',en:'Open All Favorites',de:'Alle Favoriten öffnen',fr:'Ouvrir tous les favoris',pl:'Otwórz wszystkie ulubione',es:'Abrir todos los favoritos'},
    open_all_desc: {ru:'Все категории вместе, без повторов',uk:'Усі категорії разом, без повторів',en:'All categories combined, without duplicates',de:'Alle Kategorien zusammen, ohne Duplikate',fr:'Toutes les catégories réunies, sans doublons',pl:'Wszystkie kategorie razem, bez duplikatów',es:'Todas las categorías, sin duplicados'},
    global_order: {ru:'Общий порядок',uk:'Загальний порядок',en:'Default sort order',de:'Allgemeine Sortierung',fr:'Tri général',pl:'Sortowanie domyślne',es:'Orden general'},
    global_desc: {ru:'Для общего списка и категорий без отдельной настройки',uk:'Для загального списку та категорій без окремого налаштування',en:'Used for All Favorites and categories with no override',de:'Für alle Favoriten und Kategorien ohne eigene Sortierung',fr:'Pour tous les favoris et les catégories sans tri spécifique',pl:'Dla wszystkich ulubionych i kategorii bez własnych ustawień',es:'Para todos los favoritos y categorías sin orden propio'},
    category_desc: {ru:'Отдельный порядок для этой категории',uk:'Окремий порядок для цієї категорії',en:'Override the sort order for this category',de:'Eigene Sortierung für diese Kategorie',fr:'Tri spécifique pour cette catégorie',pl:'Osobne sortowanie tej kategorii',es:'Orden independiente para esta categoría'},
    inherit: {ru:'Как для всех',uk:'Як для всіх',en:'Use default',de:'Standard verwenden',fr:'Utiliser le tri général',pl:'Użyj domyślnego',es:'Usar predeterminado'},
    az: {ru:'По названию А-Я',uk:'За назвою А-Я',en:'Title A-Z',de:'Titel A-Z',fr:'Titre A-Z',pl:'Tytuł A-Z',es:'Título A-Z'},
    za: {ru:'По названию Я-А',uk:'За назвою Я-А',en:'Title Z-A',de:'Titel Z-A',fr:'Titre Z-A',pl:'Tytuł Z-A',es:'Título Z-A'},
    year_asc: {ru:'По году: сначала старые',uk:'За роком: спочатку старі',en:'Release year: oldest first',de:'Erscheinungsjahr: älteste zuerst',fr:'Année de sortie : anciennes d’abord',pl:'Rok wydania: od najstarszych',es:'Año de estreno: más antiguos primero'},
    year_desc: {ru:'По году: сначала новые',uk:'За роком: спочатку нові',en:'Release year: newest first',de:'Erscheinungsjahr: neueste zuerst',fr:'Année de sortie : récentes d’abord',pl:'Rok wydania: od najnowszych',es:'Año de estreno: más recientes primero'},
    show_menu: {ru:'Показывать «Всё избранное» в меню',uk:'Показувати «Усе обране» в меню',en:'Show All Favorites in menu',de:'Alle Favoriten im Menü anzeigen',fr:'Afficher Tous les favoris dans le menu',pl:'Pokaż Wszystkie ulubione w menu',es:'Mostrar Todos los favoritos en el menú'},
    show_menu_desc: {ru:'Скрывает только пункт бокового меню, само избранное остаётся доступным',uk:'Приховує лише пункт бічного меню, обране залишається доступним',en:'Hides only the sidebar shortcut; your favorites remain available',de:'Blendet nur den Menüeintrag aus; Favoriten bleiben verfügbar',fr:'Masque uniquement le raccourci du menu; les favoris restent accessibles',pl:'Ukrywa tylko pozycję menu; ulubione pozostają dostępne',es:'Oculta solo el acceso del menú; tus favoritos siguen disponibles'},
    menu_visible: {ru:'Показывать',uk:'Показувати',en:'Show',de:'Anzeigen',fr:'Afficher',pl:'Pokaż',es:'Mostrar'},
    menu_hidden: {ru:'Скрыть',uk:'Приховати',en:'Hide',de:'Ausblenden',fr:'Masquer',pl:'Ukryj',es:'Ocultar'},
    recent: {ru:'Порядок Lampa',uk:'Порядок Lampa',en:'Lampa order',de:'Lampa-Reihenfolge',fr:'Ordre Lampa',pl:'Kolejność Lampa',es:'Orden Lampa'},
    old: {ru:'Обратный порядок Lampa',uk:'Зворотний порядок Lampa',en:'Reverse Lampa order',de:'Umgekehrte Lampa-Reihenfolge',fr:'Ordre Lampa inversé',pl:'Odwrotna kolejność Lampa',es:'Orden inverso de Lampa'},
    original: {ru:'Без сортировки',uk:'Без сортування',en:'No sorting',de:'Keine Sortierung',fr:'Sans tri',pl:'Bez sortowania',es:'Sin ordenar'},
    version_label: {ru:'Версия',uk:'Версія',en:'Version',de:'Version',fr:'Version',pl:'Wersja',es:'Versión'},
    author_label: {ru:'Автор',uk:'Автор',en:'Author',de:'Autor',fr:'Auteur',pl:'Autor',es:'Autor'},
    cat_book: {ru:'Закладки',uk:'Закладки',en:'Bookmarks',de:'Lesezeichen',fr:'Signets',pl:'Zakładki',es:'Marcadores'},
    cat_like: {ru:'Нравится',uk:'Подобається',en:'Liked',de:'Gefällt mir',fr:'J’aime',pl:'Polubione',es:'Me gusta'},
    cat_wath: {ru:'Позже',uk:'Пізніше',en:'Watch later',de:'Später ansehen',fr:'À voir plus tard',pl:'Obejrzyj później',es:'Ver más tarde'},
    cat_look: {ru:'Смотрю',uk:'Дивлюся',en:'Watching',de:'Ich sehe gerade',fr:'En cours',pl:'Oglądam',es:'Viendo'},
    cat_viewed: {ru:'Просмотрено',uk:'Переглянуто',en:'Watched',de:'Gesehen',fr:'Vu',pl:'Obejrzane',es:'Visto'},
    cat_scheduled: {ru:'Запланировано',uk:'Заплановано',en:'Planned',de:'Geplant',fr:'Prévu',pl:'Zaplanowane',es:'Planificado'},
    cat_continued: {ru:'Продолжение следует',uk:'Продовження буде',en:'Continuing',de:'Fortsetzung folgt',fr:'À suivre',pl:'Do kontynuowania',es:'Continuará'},
    cat_thrown: {ru:'Брошено',uk:'Покинуто',en:'Dropped',de:'Abgebrochen',fr:'Abandonné',pl:'Porzucone',es:'Abandonado'}
  };

  function language() {
    // English is the default when Lampa has no language configured or uses
    // a locale without a translation. Follow the Lampa UI language otherwise.
    var value = 'en';
    try {
      value = Lampa.Storage.field('language') || Lampa.Storage.get('language', 'en') || 'en';
    } catch (_) { /* Storage may not be ready yet. */ }
    var code = String(value).trim().toLowerCase().split(/[-_]/)[0];
    if (code === 'ua') code = 'uk';
    return Object.prototype.hasOwnProperty.call(TEXT.plugin, code) ? code : 'en';
  }
  function t(key) {
    var entry = TEXT[key];
    return entry ? (entry[language()] || entry.en) : key;
  }
  function values(withInherit) {
    var out = {};
    if (withInherit) out.inherit = t('inherit');
    ['az', 'za', 'year_asc', 'year_desc', 'recent', 'old', 'original'].forEach(function (key) { out[key] = t(key); });
    return out;
  }

  function init() {
    if (window.__ariald_favorites_sort) return;
    if (!window.Lampa || !Lampa.Favorite || typeof Lampa.Favorite.get !== 'function' ||
        typeof Lampa.Favorite.all !== 'function' || !Lampa.SettingsApi || !Lampa.Storage) return;

    var originalGet = Lampa.Favorite.get;
    var originalAll = Lampa.Favorite.all;
    var sortTypes = Object.create(null);
    CATEGORIES.forEach(function (entry) { sortTypes[entry[0]] = true; });
    var collators = Object.create(null);
    var pendingRefresh = null;
    var menuButton = null;

    function collator() {
      var code = language();
      if (!collators[code]) {
        try { collators[code] = new Intl.Collator(code, {sensitivity:'base', numeric:true}); }
        catch (_) { collators[code] = new Intl.Collator('en', {sensitivity:'base', numeric:true}); }
      }
      return collators[code];
    }
    function orderFor(type) {
      var globalOrder = Lampa.Storage.get('ariald_favsort_all', 'az');
      if (type === ALL_TYPE) return globalOrder;
      var localOrder = Lampa.Storage.get('ariald_favsort_' + type, 'inherit');
      return localOrder === 'inherit' ? globalOrder : localOrder;
    }
    function displayName(card) {
      return String((card && (card.title || card.name || card.original_title || card.original_name)) || '');
    }
    function releaseYear(card) {
      if (!card || typeof card !== 'object') return null;
      // For a TV series, first_air_date is the PREMIERE year of the series,
      // not the year of the latest season. Do not fetch metadata from the network.
      var candidates = [card.release_date, card.first_air_date,
        card.release_year, card.year, card.air_date];
      for (var i = 0; i < candidates.length; i++) {
        var value = candidates[i];
        if (value === null || value === undefined || value === '') continue;
        var match = String(value).match(/^(\d{4})(?:$|[-/])/);
        if (!match) continue;
        var year = Number(match[1]);
        if (year >= 1800 && year <= 2100) return year;
      }
      return null;
    }
    function sortItems(items, order) {
      if (!Array.isArray(items)) return items;
      var out = items.slice();
      if (order === 'old') return out.reverse();
      if (order === 'year_asc' || order === 'year_desc') {
        return out.map(function (item, index) {
          return {item:item, index:index, year:releaseYear(item)};
        }).sort(function (a, b) {
          // Unknown/missing year always goes last, regardless of direction.
          if (a.year === null && b.year !== null) return 1;
          if (b.year === null && a.year !== null) return -1;
          if (a.year !== null && b.year !== null && a.year !== b.year)
            return order === 'year_desc' ? b.year - a.year : a.year - b.year;
          return a.index - b.index;
        }).map(function (record) { return record.item; });
      }
      if (order === 'az' || order === 'za') {
        var compare = collator();
        out = out.map(function (item, index) { return {item:item, index:index}; });
        out.sort(function (a, b) {
          var delta = compare.compare(displayName(a.item), displayName(b.item));
          return delta ? (order === 'za' ? -delta : delta) : a.index - b.index;
        });
        return out.map(function (record) { return record.item; });
      }
      // Both 'recent' and 'original' preserve the native list order.
      // It is NOT guaranteed to be a timestamp-based chronology (especially with CUB).
      return out;
    }
    function mergeAll() {
      var seen = Object.create(null);
      var items = [];
      CATEGORIES.forEach(function (entry) {
        var list = originalGet.call(Lampa.Favorite, {type:entry[0]});
        if (!Array.isArray(list)) return;
        list.forEach(function (card) {
          if (!card || card.id == null) return;
          var media = card.type || (card.first_air_date || card.number_of_seasons || card.name ? 'tv' : 'movie');
          var key = [card.source || 'tmdb', media, card.id].join(':');
          if (seen[key]) return;
          seen[key] = true;
          items.push(card);
        });
      });
      return items;
    }

    // Leave history and all unrelated Favorite.get() calls untouched.
    Lampa.Favorite.get = function (params) {
      if (params && params.type === ALL_TYPE) return sortItems(mergeAll(), orderFor(ALL_TYPE));
      var list = originalGet.apply(this, arguments);
      if (!params || !sortTypes[params.type]) return list;
      return sortItems(list, orderFor(params.type));
    };
    Lampa.Favorite.all = function () {
      var lists = originalAll.apply(this, arguments);
      if (!lists || typeof lists !== 'object') return lists;
      var out = {};
      Object.keys(lists).forEach(function (type) {
        out[type] = sortTypes[type] ? sortItems(lists[type], orderFor(type)) : lists[type];
      });
      return out;
    };

    function refreshCurrentFavorites() {
      // Settings opens as an overlay; the favorite activity remains active underneath.
      // Refresh immediately after SettingsApi commits the new value.
      if (pendingRefresh) clearTimeout(pendingRefresh);
      pendingRefresh = setTimeout(function () {
        pendingRefresh = null;
        try {
          var current = Lampa.Activity && typeof Lampa.Activity.active === 'function' && Lampa.Activity.active();
          if (!current || (current.component !== 'favorite' && current.component !== 'bookmarks')) return;
          if (current.activity && typeof current.activity.refresh === 'function') {
            current.activity.refresh();
          } else if (typeof Lampa.Activity.refresh === 'function') {
            Lampa.Activity.refresh();
          }
        } catch (error) { console.warn('[Favorites Sort] Refresh failed:', error); }
      }, 50);
    }

    function openAll() {
      Lampa.Activity.push({component:'favorite', type:ALL_TYPE, title:t('all_title'), page:1, url:''});
    }

    function menuVisible() {
      return Lampa.Storage.get('ariald_favsort_menu', 'show') !== 'hide';
    }
    function updateMenuVisibility(selectedValue) {
      var visible = selectedValue === 'show' ? true : selectedValue === 'hide' ? false : menuVisible();
      // In Lampa builds where addButton returns a jQuery element, hide/show the
      // same button rather than removing it. This preserves remote navigation
      // and lets the user re-enable the shortcut without reloading Lampa.
      if (!menuButton && visible && Lampa.Menu && typeof Lampa.Menu.addButton === 'function') {
        try { menuButton = Lampa.Menu.addButton(ICON, t('all_title'), openAll); }
        catch (error) { console.warn('[Favorites Sort] Menu registration failed:', error); }
      }
      if (!menuButton) return;
      if (typeof menuButton.toggle === 'function') menuButton.toggle(visible);
      else if (typeof menuButton.hide === 'function' && typeof menuButton.show === 'function') {
        if (visible) menuButton.show(); else menuButton.hide();
      } else {
        var node = menuButton.nodeType === 1 ? menuButton : menuButton[0];
        if (node && node.style) node.style.display = visible ? '' : 'none';
      }
    }

    // Register Lampa translations, the extension metadata, and settings.
    if (Lampa.Lang && typeof Lampa.Lang.add === 'function') {
      var translations = {};
      Object.keys(TEXT).forEach(function (key) { translations['ariald_favsort_' + key] = TEXT[key]; });
      Lampa.Lang.add(translations);
    }

    if (Lampa.Manifest) {
      try {
        Lampa.Manifest.plugins = {
          type: 'other',
          name: t('plugin'),
          description: t('description'),
          version: VERSION,
          author: 'ARIALD',
          component: COMPONENT
        };
      } catch (error) { console.warn('[Favorites Sort] Plugin metadata unavailable:', error); }
    }

    Lampa.SettingsApi.addComponent({component:COMPONENT, name:t('plugin'), icon:ICON});
    Lampa.SettingsApi.addParam({
      component:COMPONENT,
      param:{name:'ariald_favsort_open', type:'button'},
      field:{name:t('open_all'), description:t('open_all_desc')},
      onChange:openAll
    });
    Lampa.SettingsApi.addParam({
      component:COMPONENT,
      param:{name:'ariald_favsort_menu', type:'select',
        values:{show:t('menu_visible'), hide:t('menu_hidden')}, default:'show'},
      field:{name:t('show_menu'), description:t('show_menu_desc')},
      onChange:updateMenuVisibility
    });
    Lampa.SettingsApi.addParam({
      component:COMPONENT,
      param:{name:'ariald_favsort_all', type:'select', values:values(false), default:'az'},
      field:{name:t('global_order'), description:t('global_desc')},
      onChange:refreshCurrentFavorites
    });
    CATEGORIES.forEach(function (category) {
      Lampa.SettingsApi.addParam({
        component:COMPONENT,
        param:{name:'ariald_favsort_' + category[0], type:'select', values:values(true), default:'inherit'},
        field:{name:t(category[1]), description:t('category_desc')},
        onChange:refreshCurrentFavorites
      });
    });

    // Read-only metadata in the plugin's own Settings screen. Lampa's external
    // plugin-list card name is separate and may still require renaming in Lampa.
    Lampa.SettingsApi.addParam({
      component:COMPONENT,
      param:{name:'ariald_favsort_version_info', type:'static'},
      field:{name:t('version_label') + ': ' + VERSION}
    });
    Lampa.SettingsApi.addParam({
      component:COMPONENT,
      param:{name:'ariald_favsort_author_info', type:'static'},
      field:{name:t('author_label') + ': ARIALD'}
    });

    // Best effort: some Lampa builds don't expose this menu API or return a
    // menu element. The "Open All Favorites" action remains in settings.
    updateMenuVisibility();

    window.__ariald_favorites_sort = {version:VERSION, refresh:refreshCurrentFavorites,
      releaseYear:releaseYear, updateMenuVisibility:updateMenuVisibility};
    console.log('[Favorites Sort] v' + VERSION + ' registered.');
  }

  if (window.appready) init();
  else if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
    Lampa.Listener.follow('app', function (event) { if (event.type === 'ready') init(); });
  }
})();
