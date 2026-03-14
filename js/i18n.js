(function () {
  var STORAGE_KEY = 'site_lang';
  var MANUAL_KEY = 'site_lang_manual';
  var SUPPORTED = { zh: true, en: true };
  var CHINESE_REGIONS = { CN: true, HK: true, MO: true, TW: true };

  var I18N = {
    zh: {
      switch_label: 'EN',
      nav_home: '首页',
      nav_archives: '归档',
      nav_tags: '标签',
      nav_about: '关于',
      search_placeholder: 'Search',
      mood_title: '心情记录',
      categories_title: '文章分类',
      links_title: '友情链接',
      related_title: '相关推荐',
      toc_title: '文章目录',
      read_more: '阅读更多',
      prev_page: '上一页',
      next_page: '下一页',
      page_label: '第 {current}/{total} 页',
      category_page_title: '文章分类',
      page_title_category: '分类',
      archives_heading: '归档',
      tags_heading: '标签',
      viewing_tag_prefix: '正在查看',
      viewing_tag_suffix: '下的文章',
      no_records: '没有记录',
      views_label: '阅读量 ',
      comment_prompt: '有什么想法，留个评论吧：',
      powered_by: 'Powered by',
      rights: 'All Rights Reserved.',
      about_update_label: '📅 2023.08 更新：',
      about_update_text: '欢迎来到',
      about_homepage_link: '我的个人主页'
    },
    en: {
      switch_label: '中文',
      nav_home: 'Home',
      nav_archives: 'Archives',
      nav_tags: 'Tags',
      nav_about: 'About',
      search_placeholder: 'Search',
      mood_title: 'Mood Notes',
      categories_title: 'Categories',
      links_title: 'Links',
      related_title: 'Related Posts',
      toc_title: 'Contents',
      read_more: 'Read more',
      prev_page: 'Previous',
      next_page: 'Next',
      page_label: 'Page {current}/{total}',
      category_page_title: 'Categories',
      page_title_category: 'Categories',
      archives_heading: 'Archives',
      tags_heading: 'Tags',
      viewing_tag_prefix: 'Viewing posts under',
      viewing_tag_suffix: '',
      no_records: 'No records found',
      views_label: 'Views ',
      comment_prompt: 'Leave a comment:',
      powered_by: 'Powered by',
      rights: 'All Rights Reserved.',
      about_update_label: '📅 2023.08 Update:',
      about_update_text: 'Welcome to',
      about_homepage_link: 'My Personal Homepage'
    }
  };

  function normalizeLang(value) {
    if (!value) return null;
    var lowered = String(value).toLowerCase();
    if (lowered.indexOf('zh') === 0) return 'zh';
    if (lowered.indexOf('en') === 0) return 'en';
    return SUPPORTED[lowered] ? lowered : null;
  }

  function setStoredLang(lang, manual) {
    localStorage.setItem(STORAGE_KEY, lang);
    if (manual) localStorage.setItem(MANUAL_KEY, '1');
  }

  function getStoredLang() {
    return normalizeLang(localStorage.getItem(STORAGE_KEY));
  }

  function hasManualPreference() {
    return localStorage.getItem(MANUAL_KEY) === '1';
  }

  function detectFromBrowser() {
    return normalizeLang(navigator.language) || 'en';
  }

  function detectFromIP() {
    var timeoutMs = 1800;

    function withTimeout(promise) {
      return Promise.race([
        promise,
        new Promise(function (_, reject) {
          setTimeout(function () {
            reject(new Error('timeout'));
          }, timeoutMs);
        })
      ]);
    }

    var providers = [
      function () {
        return fetch('https://ipapi.co/json/', { cache: 'no-store' })
          .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('ipapi')); })
          .then(function (data) { return data && data.country_code; });
      },
      function () {
        return fetch('https://ipwho.is/', { cache: 'no-store' })
          .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error('ipwhois')); })
          .then(function (data) { return data && data.success !== false ? data.country_code : null; });
      }
    ];

    return providers.reduce(function (chain, provider) {
      return chain.catch(function () {
        return withTimeout(provider());
      });
    }, Promise.reject(new Error('start')))
      .then(function (countryCode) {
        var cc = String(countryCode || '').toUpperCase();
        return CHINESE_REGIONS[cc] ? 'zh' : 'en';
      });
  }

  function applyDataI18n(lang) {
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      if (key === 'page_label') {
        var cur = nodes[i].getAttribute('data-current') || '';
        var total = nodes[i].getAttribute('data-total') || '';
        nodes[i].textContent = I18N[lang].page_label
          .replace('{current}', cur)
          .replace('{total}', total);
        continue;
      }
      if (I18N[lang][key] !== undefined) {
        nodes[i].textContent = I18N[lang][key];
      }
    }
  }

  function applyNav(lang) {
    var nav = document.querySelectorAll('#nav-menu a i');
    var keys = ['nav_home', 'nav_archives', 'nav_tags', 'nav_about'];
    for (var i = 0; i < nav.length && i < keys.length; i++) {
      var iconClass = (nav[i].className || '').split(' ')[0] || '';
      nav[i].className = iconClass;
      nav[i].textContent = ' ' + I18N[lang][keys[i]];
    }
  }

  function applyLangBlocks(lang) {
    var zhBlocks = document.querySelectorAll('[data-lang-block="zh"]');
    var enBlocks = document.querySelectorAll('[data-lang-block="en"]');
    for (var i = 0; i < zhBlocks.length; i++) {
      zhBlocks[i].style.display = lang === 'zh' ? '' : 'none';
    }
    for (var j = 0; j < enBlocks.length; j++) {
      enBlocks[j].style.display = lang === 'en' ? '' : 'none';
    }
  }

  function applyPageTitle(lang) {
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (path === '') path = '/';
    var currentTitle = document.title || '';
    var suffixMatch = currentTitle.match(/\s\|\s.*$/);
    var suffix = suffixMatch ? suffixMatch[0] : '';

    if (path === '/category' || path === '/category/index.html') {
      document.title = I18N[lang].page_title_category + suffix;
    } else if (path === '/archives' || path === '/archives/index.html') {
      document.title = I18N[lang].archives_heading + suffix;
    }
  }

  function applyLang(lang) {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.body.setAttribute('data-lang', lang);

    var switchBtn = document.getElementById('lang-switch-btn');
    if (switchBtn) {
      switchBtn.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
      switchBtn.setAttribute('data-lang-current', lang);
    }

    applyNav(lang);
    applyDataI18n(lang);
    applyLangBlocks(lang);
    applyPageTitle(lang);

    var searchInputs = document.querySelectorAll('.search-form-input[data-i18n-placeholder="search_placeholder"]');
    for (var i = 0; i < searchInputs.length; i++) {
      searchInputs[i].setAttribute('placeholder', I18N[lang].search_placeholder);
    }

    // Enable thumb animation only after initial language state is applied.
    if (!document.body.classList.contains('lang-ready')) {
      setTimeout(function () {
        document.body.classList.add('lang-ready');
      }, 0);
    }

    document.documentElement.classList.remove('i18n-loading');
  }

  function toggleLang() {
    var current = getStoredLang() || detectFromBrowser();
    var next = current === 'zh' ? 'en' : 'zh';
    setStoredLang(next, true);
    applyLang(next);
  }

  function initSwitcher() {
    var btn = document.getElementById('lang-switch-btn');
    if (!btn) return;
    btn.addEventListener('click', toggleLang);
  }

  function boot() {
    var stored = getStoredLang();
    if (stored) {
      applyLang(stored);
      return;
    }

    if (hasManualPreference()) {
      var fallback = detectFromBrowser();
      setStoredLang(fallback, true);
      applyLang(fallback);
      return;
    }

    detectFromIP()
      .then(function (lang) {
        setStoredLang(lang, false);
        applyLang(lang);
      })
      .catch(function () {
        var lang = detectFromBrowser();
        setStoredLang(lang, false);
        applyLang(lang);
      });
  }

  // Ensure the page is not stuck hidden if any unexpected error happens.
  setTimeout(function () {
    document.documentElement.classList.remove('i18n-loading');
  }, 2500);

  window.SiteI18n = {
    apply: applyLang,
    toggle: toggleLang
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initSwitcher();
      boot();
    });
  } else {
    initSwitcher();
    boot();
  }
})();
