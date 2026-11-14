/*
  Site code. Draws every page from the files in the content folder.
  You should not need to edit this file to change names, people or projects.

  Addresses:
    #home, #projects, #people, #profile, #contact
    #project-<id>   opens that note on the board
    #contact-<id>   opens the contact page with that project selected
*/
(function () {
  "use strict";

  var LAB = window.LAB || {};
  var PROJECTS = window.PROJECTS || [];
  var PEOPLE = window.PEOPLE || {};
  var PROFILE = window.PROFILE || {};
  var PI = LAB.pi || {};
  var CONTACT = LAB.contact || {};
  var FIRST = PI.firstName || PI.name || "us";
  var EMAIL = (CONTACT.emailUser || "") + "@" + (CONTACT.emailDomain || "");
  var EMAIL_IS_PLACEHOLDER = /@example\.(org|com)$/.test(EMAIL) || EMAIL === "@";

  var TINTS = ["yellow", "sky", "rose", "mint"];
  var TILTS = [-2.1, 1.3, -0.7, 2.2, -1.5, 0.8, 1.7, -1.1];

  var main = document.getElementById("main");
  var rail = document.getElementById("rail");
  var sheet = document.getElementById("sheet");
  var stageEl = document.getElementById("stage");

  /* ---------- small helpers ---------- */

  function h(tag, props) {
    var node = document.createElement(tag), k;
    if (props) {
      for (k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) { continue; }
        var v = props[k];
        if (v === null || v === undefined || v === false) { continue; }
        if (k === "class") { node.className = v; }
        else if (k.slice(0, 2) === "on") { node.addEventListener(k.slice(2), v); }
        else { node.setAttribute(k, v === true ? "" : v); }
      }
    }
    append(node, Array.prototype.slice.call(arguments, 2));
    return node;
  }
  function append(node, kids) {
    kids.forEach(function (kid) {
      if (kid === null || kid === undefined || kid === false) { return; }
      if (Array.isArray(kid)) { append(node, kid); }
      else { node.appendChild(kid.nodeType ? kid : document.createTextNode(String(kid))); }
    });
  }

  // Text with [[placeholders]] highlighted.
  function rich(text) {
    var frag = document.createDocumentFragment();
    String(text === undefined || text === null ? "" : text).split(/(\[\[.*?\]\])/g).forEach(function (part) {
      if (!part) { return; }
      if (part.slice(0, 2) === "[[" && part.slice(-2) === "]]") {
        frag.appendChild(h("mark", { "class": "todo", title: "Placeholder: replace this in the content folder" }, part.slice(2, -2)));
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });
    return frag;
  }
  function plain(text) { return String(text || "").replace(/\[\[|\]\]/g, ""); }

  // The mark: a line rising off the horizontal, with its angle. A slope.
  function mark() {
    var span = document.createElement("span");
    span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 19H21"/><path d="M3 19L20 8.5"/><path d="M11.5 19A8.5 8.5 0 0 0 10.23 14.53"/></svg>';
    return span.firstChild;
  }

  function emailNode() {
    return EMAIL_IS_PLACEHOLDER
      ? h("mark", { "class": "todo address", title: "Set your address in content/site.js" }, EMAIL)
      : h("span", { "class": "address" }, EMAIL);
  }

  function projectById(id) {
    for (var i = 0; i < PROJECTS.length; i++) { if (PROJECTS[i].id === id) { return PROJECTS[i]; } }
    return null;
  }
  function tintOf(p) { return p.color || TINTS[PROJECTS.indexOf(p) % TINTS.length]; }

  function copy(text, btn) {
    var label = btn.textContent;
    function done(ok) {
      btn.textContent = ok ? "Copied" : "Could not copy";
      setTimeout(function () { btn.textContent = label; }, 1800);
    }
    function fallback() {
      try {
        var ta = h("textarea", { style: "position:fixed;top:0;left:0;opacity:0", readonly: true });
        ta.value = text;
        (btn.parentNode || document.body).appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        ta.remove();
        done(ok);
      } catch (e) { done(false); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else { fallback(); }
  }

  /* ---------- email drafts ---------- */

  // Build the subject and body of an inquiry. `f` holds what the visitor typed
  // on the contact page; without it the body leaves blanks to fill in.
  function inquiry(project, f) {
    var title = project ? plain(project.title) : "";
    var subject = project ? "Project inquiry: " + title : "Inquiry for the " + LAB.name;
    var L = [CONTACT.greeting || "Hello,", ""];
    L.push(project
      ? "I am interested in the project “" + title + "” on the " + LAB.name + " project board."
      : "I would like to ask about working with the " + LAB.name + ".");
    if (f && f.message && f.message.trim()) { L.push("", f.message.trim()); }
    L.push("");
    L.push("Name: " + (f ? f.name.trim() : ""));
    L.push("Program and year: " + (f ? f.program.trim() : ""));
    if (!f) {
      L.push("Time I can give each week: ");
      L.push("Research experience so far: ");
    }
    L.push("", "Thank you,");
    if (f && f.name.trim()) { L.push(f.name.trim()); }
    return { subject: subject, body: L.join("\r\n") };
  }
  function enc(s) { return encodeURIComponent(s); }
  function mailtoLink(q) { return "mailto:" + EMAIL + "?subject=" + enc(q.subject) + "&body=" + enc(q.body); }
  function outlookLink(q) { return "https://outlook.office.com/mail/deeplink/compose?to=" + enc(EMAIL) + "&subject=" + enc(q.subject) + "&body=" + enc(q.body); }
  function gmailLink(q) { return "https://mail.google.com/mail/?view=cm&fs=1&to=" + enc(EMAIL) + "&su=" + enc(q.subject) + "&body=" + enc(q.body); }

  /* ---------- home page background ---------- */

  var Stage = (function () {
    var hero = LAB.hero || {};
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var mode = "none", video = null, placeholder = null;
    var active = false, wantPlay = !reduce;
    var api = { onchange: null };

    function changed() { if (api.onchange) { api.onchange(); } }

    function apply() {
      var run = active && wantPlay;
      if (mode === "video" && video) {
        if (run) {
          var p = video.play();
          if (p && p.catch) {
            p.catch(function (err) {
              // The browser refused to autoplay: show "Play". (A missing file is handled by the error event.)
              if (err && err.name === "NotAllowedError") { wantPlay = false; changed(); }
            });
          }
        }
        else { video.pause(); }
      }
      if (mode === "canvas" && placeholder) {
        if (run) { placeholder.start(); } else { placeholder.stop(); if (active) { placeholder.redraw(); } }
      }
      changed();
    }

    function usePlaceholder() {
      var c = document.createElement("canvas");
      stageEl.replaceChildren(c);
      mode = "canvas"; video = null;
      placeholder = window.HeroPlaceholder ? window.HeroPlaceholder(c) : null;
      apply();
    }
    function useImage() {
      if (!hero.image) { usePlaceholder(); return; }
      var img = new Image();
      img.alt = "";
      img.onload = function () { stageEl.replaceChildren(img); mode = "image"; video = null; apply(); };
      img.onerror = usePlaceholder;
      img.src = hero.image;
    }
    function useVideo() {
      if (!hero.video) { useImage(); return; }
      var v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.addEventListener("error", function () { if (video === v) { useImage(); } });
      if (hero.poster) { v.poster = hero.poster; }
      v.src = hero.video;
      stageEl.replaceChildren(v);
      mode = "video"; video = v;
      apply();
    }

    api.init = useVideo;
    api.setActive = function (on) { active = on; apply(); };
    api.canToggle = function () { return mode === "video" || mode === "canvas"; };
    api.playing = function () { return wantPlay; };
    api.toggle = function () { wantPlay = !wantPlay; apply(); };
    return api;
  })();

  /* ---------- rail ---------- */

  var NAV = [
    { view: "projects", label: "Projects" },
    // { view: "people", label: "People" },
    { view: "profile", label: PI.name || "Profile" },
    { view: "contact", label: "Contact" }
  ];

  function affiliationNodes() {
    var out = (LAB.affiliation || []).map(function (line) { return h("div", null, rich(line)); });
    if (LAB.disclaimer) { out.push(h("div", { "class": "disclaimer" }, rich(LAB.disclaimer))); }
    return out;
  }

  function buildRail() {
    rail.replaceChildren(
      h("a", { "class": "wordmark caps", href: "#home", "aria-label": plain(LAB.name) + ", home" }, mark(), h("span", null, rich(LAB.name))),
      LAB.expansion ? h("p", { "class": "expansion" }, rich(LAB.expansion)) : null,
      h("nav", { "class": "plumb", "aria-label": "Main" },
        h("ul", null, NAV.map(function (item) {
          return h("li", null, h("a", { "class": "caps", href: "#" + item.view, "data-view": item.view }, rich(item.label)));
        }))),
      h("div", { "class": "rail-foot" }, affiliationNodes())
    );
  }
  function markCurrent(view) {
    Array.prototype.forEach.call(rail.querySelectorAll("[data-view]"), function (a) {
      if (a.getAttribute("data-view") === view) { a.setAttribute("aria-current", "page"); }
      else { a.removeAttribute("aria-current"); }
    });
  }

  function pageFoot() { return h("footer", { "class": "page-foot" }, affiliationNodes()); }

  function portrait(src, name) {
    var box = h("div", { "class": "portrait" });
    if (src) {
      var img = h("img", { src: src, alt: "Portrait of " + plain(name), loading: "lazy" });
      img.addEventListener("error", function () { box.replaceChildren(mark()); });
      box.appendChild(img);
    } else {
      box.appendChild(mark());
    }
    return box;
  }

  /* ---------- pages ---------- */

  function viewHome() {
    var btn = h("button", { "class": "motion-toggle caps", type: "button" });
    function refresh() {
      btn.hidden = !Stage.canToggle();
      btn.textContent = Stage.playing() ? "Pause" : "Play";
      btn.setAttribute("aria-label", Stage.playing() ? "Pause the background" : "Play the background");
    }
    btn.addEventListener("click", function () { Stage.toggle(); });
    Stage.onchange = refresh;
    refresh();
    return [h("h1", { "class": "statement" }, rich(LAB.statement)), btn];
  }

  function noteFor(p) {
    var i = PROJECTS.indexOf(p);
    var filled = p.status === "filled";
    return h("a", {
        "class": "note " + tintOf(p) + (filled ? " filled" : ""),
        href: "#project-" + p.id,
        style: "--tilt:" + TILTS[i % TILTS.length] + "deg"
      },
      filled ? h("span", { "class": "stamp caps" }, "Taken") : null,
      h("h2", null, rich(p.title)),
      h("p", null, rich(p.blurb)),
      h("span", { "class": "note-foot caps" },
        h("span", null, rich(p.kind || "")),
        p.prospectus ? h("span", { title: "Two-page prospectus available" }, "PDF") : null)
    );
  }

  function viewProjects() {
    var areas = [];
    PROJECTS.forEach(function (p) { if (p.area && areas.indexOf(p.area) < 0) { areas.push(p.area); } });
    var active = "All";
    var board = h("div", { "class": "board" });
    var chips = [];

    function draw() {
      var shown = PROJECTS.filter(function (p) { return active === "All" || p.area === active; });
      board.replaceChildren.apply(board, shown.length
        ? shown.map(noteFor)
        : [h("p", { "class": "empty" }, "No projects are posted right now. Write to " + FIRST + " to propose one.")]);
      chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c.textContent === active)); });
    }
    if (areas.length > 1) {
      chips = ["All"].concat(areas).map(function (a) {
        return h("button", { "class": "chip", type: "button", onclick: function () { active = a; draw(); } }, a);
      });
    }
    draw();

    return [
      h("header", { "class": "page-head" },
        h("h1", null, "Projects looking for a student"),
        h("p", null, "Each note is a project you could take on. Open one to read the two-page prospectus or to write to " + FIRST + " about it.")),
      chips.length ? h("div", { "class": "filters", role: "group", "aria-label": "Filter projects by area" }, chips) : null,
      board,
      h("p", { "class": "board-after" }, "Have an idea that is not on the board? ", h("a", { href: "#contact" }, "Propose a project"), "."),
      pageFoot()
    ];
  }

  function openSheet(p) {
    var q = inquiry(p);
    var filled = p.status === "filled";
    sheet.style.setProperty("--tint", "var(--note-" + tintOf(p) + ")");
    var copyBtn = h("button", { "class": "linklike", type: "button" }, "Copy address");
    copyBtn.addEventListener("click", function () { copy(EMAIL, copyBtn); });

    sheet.replaceChildren(h("div", { "class": "sheet-body", tabindex: "-1", autofocus: true },
      h("div", { "class": "sheet-top" },
        h("span", { "class": "caps" }, [p.kind, p.area].filter(Boolean).join(", ")),
        h("button", { "class": "sheet-close caps", type: "button", onclick: function () { sheet.close(); } }, "Close")),
      h("h2", { id: "sheet-title" }, rich(p.title)),
      h("p", { "class": "lead" }, rich(p.blurb)),
      p.question ? [h("h3", { "class": "caps" }, "The question"), h("p", null, rich(p.question))] : null,
      p.details && p.details.length
        ? [h("h3", { "class": "caps" }, "What you would do"), h("ul", { "class": "plain" }, p.details.map(function (d) { return h("li", null, rich(d)); }))]
        : null,
      filled ? [h("h3", { "class": "caps" }, "Status"), h("p", null, "A student is already working on this. Write anyway if you would like to join or follow on.")] : null,
      h("div", { "class": "sheet-actions" },
        h("a", { "class": "btn primary", href: mailtoLink(q) }, "Email " + FIRST + " about this project"),
        p.prospectus ? h("a", { "class": "btn", href: p.prospectus, target: "_blank", rel: "noopener" }, "Read the prospectus (PDF)") : null),
      h("p", { "class": "sheet-help" },
        "The email button opens a draft in your mail app with this project already named. ",
        p.prospectus ? null : "The prospectus for this one is not posted yet, so ask for it in your email. ",
        "No mail app? Open the same draft in ",
        h("a", { href: outlookLink(q), target: "_blank", rel: "noopener" }, "Outlook on the web"), " or ",
        h("a", { href: gmailLink(q), target: "_blank", rel: "noopener" }, "Gmail"), ", use the ",
        h("a", { href: "#contact-" + p.id }, "contact page"), ", or write to ", emailNode(), ". ",
        copyBtn)
    ));
    if (!sheet.open) {
      if (sheet.showModal) { sheet.showModal(); } else { sheet.setAttribute("open", ""); }
    }
    sheet.scrollTop = 0;
  }
  function closeSheet() {
    if (sheet.open) { if (sheet.close) { sheet.close(); } else { sheet.removeAttribute("open"); } }
  }

  function viewPeople() {
    var students = PEOPLE.students || [], alumni = PEOPLE.alumni || [];
    return [
      h("header", { "class": "page-head" }, h("h1", null, "People")),
      h("div", { "class": "lead-person" },
        portrait(PROFILE.photo, PI.name),
        h("div", null,
          h("h2", null, rich(PI.name)),
          h("p", null, rich(PROFILE.title), PROFILE.department ? ", " : "", rich(PROFILE.department)),
          h("p", null, h("a", { href: "#profile" }, "Read " + FIRST + "’s profile")))),
      h("h2", { "class": "section-title caps" }, "Students"),
      students.length
        ? h("div", { "class": "people" }, students.map(function (s) {
            var links = (s.projects || []).map(projectById).filter(Boolean);
            var on = null;
            if (links.length) {
              on = h("p", { "class": "on" }, "Working on ");
              links.forEach(function (p, i) {
                if (i) { on.appendChild(document.createTextNode(i === links.length - 1 ? " and " : ", ")); }
                on.appendChild(h("a", { href: "#project-" + p.id }, rich(p.short || p.title)));
              });
            }
            return h("article", { "class": "person" },
              portrait(s.photo, s.name),
              h("h3", null, rich(s.name)),
              h("p", { "class": "role" }, rich(s.role)),
              h("p", { "class": "blurb" }, rich(s.blurb)),
              on);
          }))
        : h("p", { "class": "measure" }, "No students are listed yet."),
      alumni.length ? [
        h("h2", { "class": "section-title caps" }, "Alumni"),
        h("ul", { "class": "alumni" }, alumni.map(function (a) {
          return h("li", null, rich(a.name), a.note ? [h("span", null, ", "), h("span", null, rich(a.note))] : null);
        }))
      ] : null,
      h("p", { "class": "board-after" }, "Want to join? ", h("a", { href: "#projects" }, "See the projects looking for a student"), "."),
      pageFoot()
    ];
  }

  function viewProfile() {
    var links = (PROFILE.links || []).filter(function (l) { return l.href; });
    var work = PROFILE.work || [], interests = PROFILE.interests || [];
    return [
      h("div", { "class": "profile" },
        portrait(PROFILE.photo, PI.name),
        h("div", null,
          h("header", { "class": "page-head", style: "margin-bottom:0" },
            h("h1", null, rich(PI.name)),
            h("p", { "class": "titles" },
              rich(PROFILE.title), PROFILE.department ? h("br") : null, rich(PROFILE.department),
              (LAB.affiliation || []).length ? [h("br"), rich(LAB.affiliation[0])] : null)),
          h("div", { "class": "bio measure" }, (PROFILE.bio || []).map(function (para) { return h("p", null, rich(para)); })),
          interests.length ? [
            h("h2", { "class": "section-title caps" }, "Research interests"),
            h("ul", { "class": "plain" }, interests.map(function (t) { return h("li", null, rich(t)); }))
          ] : null,
          work.length ? [
            h("h2", { "class": "section-title caps" }, "Selected talks and papers"),
            h("ul", { "class": "work" }, work.map(function (w) {
              return h("li", null, h("span", { "class": "year" }, rich(w.year)),
                w.href ? h("a", { href: w.href, target: "_blank", rel: "noopener" }, rich(w.text)) : h("span", null, rich(w.text)));
            }))
          ] : null,
          h("div", { "class": "link-row" },
            links.map(function (l) { return h("a", { href: l.href, target: "_blank", rel: "noopener" }, rich(l.label)); }),
            h("a", { href: "#contact" }, "Write to " + FIRST))
        )),
      pageFoot()
    ];
  }

  function viewContact(route) {
    var name = h("input", { id: "c-name", type: "text", autocomplete: "name" });
    var program = h("input", { id: "c-program", type: "text", placeholder: "For example: MD candidate, second year" });
    var project = h("select", { id: "c-project" },
      h("option", { value: "" }, "No particular project"),
      PROJECTS.map(function (p) { return h("option", { value: p.id }, plain(p.short || p.title)); }));
    var message = h("textarea", { id: "c-message", placeholder: "How much time you have, any research experience, questions." });
    if (route.project && projectById(route.project)) { project.value = route.project; }

    var send = h("a", { "class": "btn primary", href: "#" }, "Open in my mail app");
    var viaOutlook = h("a", { "class": "btn", href: "#", target: "_blank", rel: "noopener" }, "Outlook on the web");
    var viaGmail = h("a", { "class": "btn", href: "#", target: "_blank", rel: "noopener" }, "Gmail");
    var copyMsg = h("button", { "class": "linklike", type: "button" }, "Copy the message");
    var copyAddr = h("button", { "class": "linklike", type: "button" }, "Copy address");
    var subj = h("dd"), body = h("pre");
    var current = { subject: "", body: "" };

    function update() {
      current = inquiry(projectById(project.value), { name: name.value, program: program.value, message: message.value });
      send.href = mailtoLink(current);
      viaOutlook.href = outlookLink(current);
      viaGmail.href = gmailLink(current);
      subj.textContent = current.subject;
      body.textContent = current.body.replace(/\r\n/g, "\n");
    }
    [name, program, project, message].forEach(function (el) {
      el.addEventListener("input", update); el.addEventListener("change", update);
    });
    copyMsg.addEventListener("click", function () {
      copy("To: " + EMAIL + "\nSubject: " + current.subject + "\n\n" + current.body.replace(/\r\n/g, "\n"), copyMsg);
    });
    copyAddr.addEventListener("click", function () { copy(EMAIL, copyAddr); });
    update();

    function field(label, control) { return h("label", { "class": "field", "for": control.id }, h("span", null, label), control); }

    return [
      h("header", { "class": "page-head" },
        h("h1", null, "Write to " + FIRST),
        h("p", null, "Fill in what you like and the email is drafted for you. It is sent from your own account, so you keep a copy and the reply comes straight to you.")),
      h("div", { "class": "contact" },
        h("form", { onsubmit: function (e) { e.preventDefault(); } },
          field("Your name", name),
          field("Program and year", program),
          field("Project", project),
          field("Anything you would like to add", message),
          h("div", { "class": "send-row" }, send, viaOutlook, viaGmail),
          h("p", { "class": "send-help" }, "Nothing is sent until you press send in your own mail. If none of the buttons suit you: ", copyMsg, ".")),
        h("aside", null,
          h("p", { "class": "draft-title caps" }, "Your draft"),
          h("div", { "class": "draft", "aria-live": "polite" },
            h("dl", null, h("dt", null, "To"), h("dd", null, emailNode()), h("dt", null, "Subject"), subj),
            body),
          h("p", { "class": "where" },
            h("strong", null, rich(PI.name)), h("br"),
            emailNode(), " ", copyAddr, h("br"),
            rich(CONTACT.office), CONTACT.office ? h("br") : null,
            rich((LAB.affiliation || []).join(", "))))),
      pageFoot()
    ];
  }

  /* ---------- routing ---------- */

  var VIEWS = {
    home: { title: "", build: viewHome },
    projects: { title: "Projects", build: viewProjects },
    people: { title: "People", build: viewPeople },
    profile: { title: PI.name || "Profile", build: viewProfile },
    contact: { title: "Contact", build: viewContact }
  };
  var currentView = null, currentArg = null, firstMount = true;

  function parse() {
    var raw = "";
    try { raw = decodeURIComponent(location.hash.replace(/^#/, "")); } catch (e) { raw = ""; }
    if (!raw || raw === "home") { return { view: "home" }; }
    if (VIEWS[raw]) { return { view: raw }; }
    if (raw.indexOf("project-") === 0) { return { view: "projects", project: raw.slice(8) }; }
    if (raw.indexOf("contact-") === 0) { return { view: "contact", project: raw.slice(8) }; }
    return null; // not one of ours (for example the skip link): leave the page alone
  }

  function sync() {
    var route = parse();
    if (!route) { if (currentView) { return; } route = { view: "home" }; }

    var remount = route.view !== currentView || (route.view === "contact" && route.project !== currentArg);
    if (remount) {
      if (route.view !== "projects") { closeSheet(); }
      currentView = route.view;
      currentArg = route.view === "contact" ? route.project : null;
      document.body.classList.toggle("is-home", route.view === "home");
      Stage.onchange = null;
      main.replaceChildren();
      append(main, VIEWS[route.view].build(route));
      Stage.setActive(route.view === "home");
      markCurrent(route.view);
      document.title = (VIEWS[route.view].title ? plain(VIEWS[route.view].title) + " | " : "") + plain(LAB.name);
      window.scrollTo(0, 0);
      if (!firstMount) { main.focus({ preventScroll: true }); }
      firstMount = false;
    }

    if (route.view === "projects") {
      var p = route.project ? projectById(route.project) : null;
      if (p) { openSheet(p); } else { closeSheet(); }
    }
  }

  sheet.addEventListener("close", function () {
    var route = parse();
    if (route && route.view === "projects" && route.project) { location.hash = "projects"; }
  });
  sheet.addEventListener("click", function (e) { if (e.target === sheet) { closeSheet(); } });

  document.getElementById("skip").addEventListener("click", function (e) {
    e.preventDefault(); main.focus();
  });

  buildRail();
  Stage.init();
  window.addEventListener("hashchange", sync);
  sync();
})();
