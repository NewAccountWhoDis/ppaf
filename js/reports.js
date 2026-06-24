/* PPAF — Reports loader.
   Reads reports/index.json (managed by board members via Decap CMS at /admin).
   Renders either a list of report cards or a single article (?slug=...). */
(function () {
  "use strict";

  var DATA_URL = "reports/index.json";
  var listEl = document.getElementById("report-list");
  var articleEl = document.getElementById("report-article");
  var previewEl = document.getElementById("report-preview"); // homepage: latest 3
  if (!listEl && !articleEl && !previewEl) return;

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fmtDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d)) return esc(iso);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function mediaHtml(report, variantFallback) {
    if (report.cover) {
      return '<div class="photo report-card__media"><img src="' + esc(report.cover) +
        '" alt="' + esc(report.coverAlt || report.title) + '" loading="lazy"></div>';
    }
    return '<div class="report-card__media report-card__fallback" aria-hidden="true">' +
      '<span class="report-card__sun"></span></div>';
  }

  var VARIANTS = ["", "warm", "clay"];

  /* ---------- tiny markdown -> html (safe) ---------- */
  function markdown(src) {
    if (!src) return "";
    var lines = String(src).replace(/\r\n/g, "\n").split("\n");
    var html = "", inList = false, inPara = false;

    function closePara() { if (inPara) { html += "</p>"; inPara = false; } }
    function closeList() { if (inList) { html += "</ul>"; inList = false; } }

    function inline(t) {
      t = esc(t);
      t = t.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>');
      t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      t = t.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
      return t;
    }

    lines.forEach(function (raw) {
      var line = raw.trimEnd();
      if (!line.trim()) { closePara(); closeList(); return; }
      var h = line.match(/^(#{2,3})\s+(.*)$/);
      if (h) {
        closePara(); closeList();
        html += "<h" + h[1].length + ">" + inline(h[2]) + "</h" + h[1].length + ">";
        return;
      }
      if (/^[-*]\s+/.test(line)) {
        closePara();
        if (!inList) { html += "<ul>"; inList = true; }
        html += "<li>" + inline(line.replace(/^[-*]\s+/, "")) + "</li>";
        return;
      }
      closeList();
      if (!inPara) { html += "<p>"; inPara = true; } else { html += " "; }
      html += inline(line);
    });
    closePara(); closeList();
    return html;
  }

  /* ---------- renderers ---------- */
  function cardHtml(r, i) {
    var v = VARIANTS[i % VARIANTS.length];
    return '<article class="report-card reveal">' +
      '<a href="reports.html?slug=' + encodeURIComponent(r.slug) + '" aria-label="Read: ' + esc(r.title) + '">' +
        mediaHtml(r, v) + "</a>" +
      '<div class="report-card__body">' +
        '<div class="report-card__meta">' +
          '<span class="tag">' + esc(r.category || "Field Report") + "</span>" +
          "<span>" + fmtDate(r.date) + "</span>" +
        "</div>" +
        '<h3><a href="reports.html?slug=' + encodeURIComponent(r.slug) + '">' + esc(r.title) + "</a></h3>" +
        "<p>" + esc(r.summary || "") + "</p>" +
        '<a class="link-arrow" href="reports.html?slug=' + encodeURIComponent(r.slug) +
          '">Read report <span class="arrow" aria-hidden="true">&rarr;</span></a>' +
      "</div></article>";
  }

  function renderList(reports) {
    if (!reports.length) {
      listEl.innerHTML = '<div class="state"><h3>Field reports are being prepared</h3>' +
        "<p>We are organizing PPAF updates and photographs for publication here. " +
        "In the meantime, explore how the program works or contact the team directly.</p>" +
        '<a class="btn btn--primary" href="our-work.html">Explore our work</a></div>';
      return;
    }
    listEl.innerHTML = '<div class="report-grid">' +
      reports.map(cardHtml).join("") + "</div>";
    revealNew(listEl);
  }

  function renderPreview(reports) {
    if (!reports.length) { previewEl.closest("section").style.display = "none"; return; }
    previewEl.innerHTML = '<div class="report-grid">' +
      reports.slice(0, 3).map(cardHtml).join("") + "</div>";
    revealNew(previewEl);
  }

  function renderArticle(reports) {
    var slug = param("slug");
    var r = reports.filter(function (x) { return x.slug === slug; })[0];

    if (!r) {
      articleEl.innerHTML = '<section class="section"><div class="container">' +
        '<div class="state"><h3>Report not found</h3>' +
        "<p>This report may have been moved or removed.</p>" +
        '<a class="btn btn--primary" href="reports.html">Back to all reports</a></div></div></section>';
      return;
    }
    document.title = r.title + " · PPAF Reports";

    var cover = r.cover
      ? '<div class="article__cover photo"><img src="' + esc(r.cover) + '" alt="' +
          esc(r.coverAlt || r.title) + '"></div>'
      : '<div class="article__cover report-card__fallback" aria-hidden="true">' +
          '<span class="report-card__sun"></span></div>';

    var gallery = "";
    if (r.gallery && r.gallery.length) {
      gallery = '<div class="article__gallery">' + r.gallery.map(function (g) {
        var src = typeof g === "string" ? g : g.image;
        var alt = typeof g === "string" ? r.title : (g.alt || r.title);
        return '<div class="photo"><img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy"></div>';
      }).join("") + "</div>";
    }

    articleEl.innerHTML =
      '<section class="section"><div class="container"><article class="article">' +
        '<div class="breadcrumb"><a href="index.html">Home</a> / ' +
          '<a href="reports.html">Reports</a> / ' + esc(r.title) + "</div>" +
        '<header class="article__head">' +
          '<span class="eyebrow">' + esc(r.category || "Field Report") + "</span>" +
          "<h1>" + esc(r.title) + "</h1>" +
          '<div class="article__meta">' +
            (r.author ? "<span>By " + esc(r.author) + "</span>" : "") +
            "<span>" + fmtDate(r.date) + "</span>" +
            (r.location ? "<span>" + esc(r.location) + "</span>" : "") +
          "</div>" +
        "</header>" +
        cover +
        '<div class="article__body">' + markdown(r.body) + gallery + "</div>" +
        '<p class="mt-2"><a class="link-arrow" href="reports.html">' +
          '<span class="arrow" aria-hidden="true">&larr;</span> All reports</a></p>' +
      "</article></div></section>";
    window.scrollTo(0, 0);
  }

  function revealNew(scope) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scope.querySelectorAll(".reveal").forEach(function (el) {
      if (reduce) { el.classList.add("is-visible"); return; }
      requestAnimationFrame(function () { el.classList.add("is-visible"); });
    });
  }

  function sortByDate(reports) {
    return reports.slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
  }

  function showError(target) {
    target.innerHTML = '<div class="state"><h3>Reports are loading elsewhere</h3>' +
      "<p>If you are previewing this file directly from your computer, your browser blocks " +
      "loading the reports data. View the site through a local server or the live Netlify URL " +
      "to see published reports.</p>" +
      '<a class="btn btn--ghost" href="reports.html">Reload</a></div>';
  }

  /* ---------- boot ---------- */
  var target = articleEl || listEl || previewEl;

  fetch(DATA_URL, { cache: "no-cache" })
    .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then(function (data) {
      var reports = sortByDate((data && data.reports) || []);
      if (articleEl && param("slug")) return renderArticle(reports);
      if (listEl) renderList(reports);
      if (previewEl) renderPreview(reports);
    })
    .catch(function () { showError(target); });
})();
