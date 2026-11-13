/* キット型の部品（2026-11-12）
   section.tool を数えて「進み具合のバー」「目次」「全部クリア」を自動で作る。
   各 section の .done-btn を押すと「できた」になり、このブラウザの中だけに覚える（どこにも送らない）。 */
(function () {
  var tools = Array.prototype.slice.call(document.querySelectorAll('section.tool'));
  if (!tools.length) return;
  var key = 'kit:' + location.pathname;
  var done = {};
  try { done = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (e) { done = {}; }
  function save() { try { localStorage.setItem(key, JSON.stringify(done)); } catch (e) {} }

  var hero = document.querySelector('.hero');
  var wrap = document.querySelector('.wrap');

  // 進み具合のバー
  var bar = document.createElement('div');
  bar.className = 'kit-bar';
  bar.innerHTML = '<div class="kit-bar-row"><span class="kit-bar-label">進み具合</span><span class="kit-bar-count" aria-live="polite"></span></div><div class="kit-track"><div class="kit-fill"></div></div>';
  wrap.insertBefore(bar, wrap.firstChild);

  // 目次
  var toc = document.createElement('nav');
  toc.className = 'kit-toc';
  toc.setAttribute('aria-label', '目次');
  var list = '<p class="kit-toc-title">この順番で進めてね（押すと飛べます）</p><ol>';
  tools.forEach(function (sec, i) {
    var id = 'kit-' + (i + 1);
    sec.id = sec.id || id;
    var h = sec.querySelector('h2');
    var name = h ? h.childNodes[0].textContent.trim() : ('ステップ' + (i + 1));
    var note = h && h.querySelector('.heading-note') ? h.querySelector('.heading-note').textContent.replace(/[（）()]/g, '') : '';
    list += '<li data-i="' + i + '"><a href="#' + sec.id + '"><span class="kit-mark">' + (i + 1) + '</span><span><b class="inline">' + name + '</b>　' + note + '</span></a></li>';
  });
  list += '</ol>';
  toc.innerHTML = list;
  hero.parentNode.insertBefore(toc, hero.nextSibling);

  // 全部クリア
  var clear = document.createElement('div');
  clear.className = 'kit-clear';
  clear.setAttribute('role', 'status');
  clear.innerHTML = '<p class="kit-clear-big">🎉 全部クリア！</p><p>' + tools.length + 'つとも使えるようになりました。<br>あとは毎日の作業で、思い出したときに使ってみてね。</p>';
  var last = tools[tools.length - 1];
  last.parentNode.insertBefore(clear, last.nextSibling);

  function render() {
    var n = 0;
    tools.forEach(function (sec, i) {
      var on = !!done[i];
      if (on) n++;
      sec.classList.toggle('is-done', on);
      var btn = sec.querySelector('.done-btn');
      if (btn) { btn.textContent = on ? '✓ できた！' : 'できた！'; btn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
      var li = toc.querySelector('li[data-i="' + i + '"]');
      if (li) { li.classList.toggle('is-done', on); li.querySelector('.kit-mark').textContent = on ? '✓' : String(i + 1); }
    });
    bar.querySelector('.kit-bar-count').textContent = n + ' / ' + tools.length + ' クリア';
    bar.querySelector('.kit-fill').style.width = (n / tools.length * 100) + '%';
    clear.classList.toggle('on', n === tools.length);
  }

  tools.forEach(function (sec, i) {
    var btn = sec.querySelector('.done-btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      done[i] = !done[i];
      save(); render();
      if (done[i]) {
        var next = tools[i + 1];
        if (next && !done[i + 1]) setTimeout(function () { next.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); }, 450);
      }
    });
  });
  render();
})();
