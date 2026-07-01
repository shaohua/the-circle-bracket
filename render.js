/*
 * ============================================================================
 *  WORLD CUP BRACKET — RENDERER
 * ============================================================================
 *  Reads window.BRACKET_CONFIG and draws a radial 32-team knockout bracket
 *  into an <svg>. Pure vanilla JS, no dependencies, no build step.
 *
 *  Geometry: 32 team slots equally spaced around a circle (11.25 deg apart),
 *  centred symmetrically about the top. Match winners collapse inward through
 *  four rings of nodes (R32 -> R16 -> QF -> SF) to the trophy at the centre.
 * ============================================================================
 */
(function () {
  "use strict";

  var SVG_NS = "http://www.w3.org/2000/svg";
  var CFG = window.BRACKET_CONFIG;

  // ---- canvas geometry -----------------------------------------------------
  var SIZE = 1000;
  var CX = SIZE / 2;
  var CY = SIZE / 2;

  var BADGE_R = 472;   // federation crest ring (outermost)
  var FLAG_R = 416;    // circular flag ring
  var FLAG_RADIUS = 31;
  var BADGE_SIZE = 46;
  var ADV_FLAG_R = 26; // winners' flags that advance to inner rings

  // Each round is a concentric RING. `radius` is where that round's connecting
  // arcs sit AND where the winner's flag advances to. Rings are spaced with
  // room for a flag at every level; they shrink toward the trophy.
  var ROUNDS = [
    { key: "r32", count: 16, radius: 344 },
    { key: "r16", count: 8, radius: 274 },
    { key: "qf", count: 4, radius: 204 },
    { key: "sf", count: 2, radius: 134 },
    { key: "final", count: 1, radius: 68 },
  ];
  var CENTER_R = 22; // where the champion's final spoke meets the trophy

  var SLOT_COUNT = 32;
  var STEP = 360 / SLOT_COUNT;           // 11.25 deg
  // Phase so the seam between the two 16-team halves (slot 31 | slot 0) sits at
  // the very top, and the other seam (slot 15 | 16) at the bottom. This makes
  // every round nest symmetrically about the vertical axis, so the bracket web
  // is left-right mirror-symmetric and the centre resolves to a clean hub.
  function slotAngle(i) {
    return -90 + (i + 0.5) * STEP;
  }
  function toXY(angleDeg, radius) {
    var a = (angleDeg * Math.PI) / 180;
    return { x: CX + radius * Math.cos(a), y: CY + radius * Math.sin(a) };
  }

  // ---- small DOM helpers ---------------------------------------------------
  function el(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    if (attrs) {
      for (var k in attrs) {
        if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    return node;
  }
  function accentOf(teamKey) {
    if (!teamKey) return CFG.accent;
    var t = CFG.teams[teamKey];
    return (t && t.accent) || CFG.accent;
  }

  // ==========================================================================
  //  Build the match tree from config
  // ==========================================================================
  // Leaves: one per seed slot. Each carries the team occupying it.
  var leaves = [];
  for (var i = 0; i < SLOT_COUNT; i++) {
    var teamKey = CFG.seeds[i];
    var ang = slotAngle(i);
    leaves.push({
      team: teamKey,
      winner: teamKey, // a leaf "advances" its own team
      angle: ang,
      // output point of a leaf = the flag position
      out: toXY(ang, FLAG_R),
      slot: i,
    });
  }

  // Match nodes per round. children are the two nodes feeding this match.
  var levels = []; // levels[r] = array of match nodes for ROUNDS[r]
  var prev = leaves;
  for (var r = 0; r < ROUNDS.length; r++) {
    var round = ROUNDS[r];
    // `final` is a single value (key or null); other rounds are arrays.
    var winners = CFG.results ? CFG.results[round.key] : null;
    var nodes = [];
    for (var j = 0; j < round.count; j++) {
      var c0 = prev[2 * j];
      var c1 = prev[2 * j + 1];
      var angle = (c0.angle + c1.angle) / 2;
      var pos = toXY(angle, round.radius); // arc-midpoint = this match's output point
      var w = round.key === "final" ? winners : (Array.isArray(winners) ? winners[j] : null);
      w = w == null ? null : w;
      nodes.push({
        key: round.key,
        index: j,
        children: [c0, c1],
        angle: angle,
        pos: pos,
        out: pos,
        winner: w,
      });
    }
    levels.push(nodes);
    prev = nodes;
  }

  // ---- validate winners & derive eliminated set ----------------------------
  var eliminated = {};
  var problems = [];
  function participants(node) {
    // the set of team keys that can win this match = winners of its children
    return [node.children[0].winner, node.children[1].winner];
  }
  levels.forEach(function (nodes) {
    nodes.forEach(function (node) {
      if (node.winner == null) return;
      var p = participants(node);
      if (p.indexOf(node.winner) === -1) {
        problems.push(
          node.key + "[" + node.index + "] winner '" + node.winner +
          "' is not one of (" + p.join(", ") + ")"
        );
      }
      // the child whose team lost is eliminated
      node.children.forEach(function (c) {
        if (c.winner != null && c.winner !== node.winner) {
          eliminated[c.winner] = true;
        }
      });
    });
  });
  if (problems.length) {
    console.warn("[bracket] result problems:\n" + problems.join("\n"));
  }

  // ==========================================================================
  //  Render
  // ==========================================================================
  var svg = el("svg", {
    viewBox: "0 0 " + SIZE + " " + SIZE,
    preserveAspectRatio: "xMidYMid meet",
    class: "bracket-svg",
  });

  // ---- defs: glow filters + clip paths -------------------------------------
  var defs = el("defs");

  // warm centre glow
  var glow = el("radialGradient", { id: "centerGlow", cx: "50%", cy: "50%", r: "50%" });
  [["0%", "#ffcf7a", "0.95"], ["18%", "#f0a13c", "0.55"], ["42%", "#7a4a12", "0.18"], ["70%", "#000000", "0"]].forEach(function (s) {
    glow.appendChild(el("stop", { offset: s[0], "stop-color": s[1], "stop-opacity": s[2] }));
  });
  defs.appendChild(glow);

  // soft glow for lit nodes
  var f = el("filter", { id: "softGlow", x: "-120%", y: "-120%", width: "340%", height: "340%" });
  f.appendChild(el("feGaussianBlur", { stdDeviation: "3", result: "b" }));
  var merge = el("feMerge");
  merge.appendChild(el("feMergeNode", { in: "b" }));
  merge.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
  f.appendChild(merge);
  defs.appendChild(f);

  svg.appendChild(defs);

  // groups (draw order: glow -> edges -> nodes -> advancing flags -> teams -> centre)
  var gGlow = el("g");
  var gEdges = el("g", { class: "edges" });
  var gNodes = el("g", { class: "nodes" });
  var gAdvance = el("g", { class: "advance" });
  var gTeams = el("g", { class: "teams" });
  var gCenter = el("g", { class: "center" });
  [gGlow, gEdges, gNodes, gAdvance, gTeams, gCenter].forEach(function (g) { svg.appendChild(g); });

  // ---- reusable circular flag ----------------------------------------------
  var XLINK = "http://www.w3.org/1999/xlink";
  var clipSeq = 0;
  function flagCircle(parent, cx, cy, r, iso, isOut, name, ringColor) {
    var g = el("g", {
      class: "team" + (isOut ? " team--out" : ""),
      "data-team-name": name || "",
      "aria-label": name || "",
      role: name ? "img" : null,
      tabindex: name ? "0" : null,
    });
    var clipId = "fc-" + (clipSeq++);
    var clip = el("clipPath", { id: clipId });
    clip.appendChild(el("circle", { cx: cx, cy: cy, r: r }));
    defs.appendChild(clip);
    var href = "assets/flags/" + iso + ".png";
    var img = el("image", {
      x: cx - r, y: cy - r, width: r * 2, height: r * 2,
      preserveAspectRatio: "xMidYMid slice",
      "clip-path": "url(#" + clipId + ")", class: "flag-img",
    });
    img.setAttribute("href", href);
    img.setAttributeNS(XLINK, "href", href);
    g.appendChild(img);
    var ring = el("circle", { cx: cx, cy: cy, r: r, class: "flag-ring" });
    if (ringColor) ring.style.stroke = ringColor;
    g.appendChild(ring);
    parent.appendChild(g);
    return g;
  }

  // centre glow disc
  gGlow.appendChild(el("circle", { cx: CX, cy: CY, r: 300, fill: "url(#centerGlow)" }));

  // ---- drawing helpers (polar bracket) -------------------------------------
  // A radial spoke at a fixed angle, from rOuter in to rInner.
  function spoke(angle, rOuter, rInner, color) {
    var p0 = toXY(angle, rOuter), p1 = toXY(angle, rInner);
    var line = el("line", {
      x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y,
      class: "edge" + (color ? " edge--lit" : ""),
    });
    if (color) { line.style.stroke = color; line.style.color = color; }
    gEdges.appendChild(line);
  }
  // An arc segment of the ring at `radius`, from angle a0 to a1 (the short way).
  function arc(radius, a0, a1, color) {
    var p0 = toXY(a0, radius), p1 = toXY(a1, radius);
    var large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    var sweep = a1 > a0 ? 1 : 0;
    var d = "M " + p0.x + " " + p0.y + " A " + radius + " " + radius +
            " 0 " + large + " " + sweep + " " + p1.x + " " + p1.y;
    var path = el("path", { d: d, fill: "none", class: "edge" + (color ? " edge--lit" : "") });
    if (color) { path.style.stroke = color; path.style.color = color; }
    gEdges.appendChild(path);
  }
  var dotJobs = []; // collect so dots draw on top of the lines
  function dot(angle, radius, color) {
    var p = toXY(angle, radius);
    dotJobs.push({ x: p.x, y: p.y, color: color });
  }

  // ---- edges: spokes + gapped arcs, one match at a time --------------------
  // Inner edge of the flag = where a Round-of-32 spoke begins.
  var LEAF_SOURCE_R = FLAG_R - FLAG_RADIUS - 1;
  var finalR = ROUNDS[ROUNDS.length - 1].radius;
  levels.forEach(function (nodes, r) {
    var B = ROUNDS[r].radius;
    var childR = r === 0 ? LEAF_SOURCE_R : ROUNDS[r - 1].radius; // where children feed in
    nodes.forEach(function (node) {
      var c0 = node.children[0], c1 = node.children[1];
      // radial spokes: each child feeds this ring at the child's angle
      [c0, c1].forEach(function (c) {
        var spokeWinner = null;
        if (node.winner != null && c.winner === node.winner) {
          spokeWinner = node.winner;
        } else if (c.key && c.winner != null) {
          spokeWinner = c.winner;
        }
        spoke(c.angle, childR, B, spokeWinner ? accentOf(spokeWinner) : null);
        dot(c.angle, B, null); // junction where the spoke meets this arc
      });
      // connecting arc along the ring, split at the midpoint so only the
      // winner's half is lit. The final round is drawn as the central hub
      // (below) rather than a semicircle.
      if (node.key !== "final") {
        if (node.winner == null) {
          arc(B, c0.angle, c1.angle, null);
        } else {
          var win = c0.winner === node.winner ? c0 : c1;
          var lose = win === c0 ? c1 : c0;
          arc(B, lose.angle, node.angle, null);
          arc(B, win.angle, node.angle, accentOf(node.winner));
        }
      }
      dot(node.angle, B, node.winner != null ? accentOf(node.winner) : null); // output junction
    });
  });

  // champion's spoke into the trophy — only once a champion exists
  var finalNode = levels[ROUNDS.length - 1][0];
  if (finalNode.winner) {
    spoke(finalNode.angle, finalR, CENTER_R, accentOf(finalNode.winner));
    dot(finalNode.angle, CENTER_R, accentOf(finalNode.winner));
  }

  // ---- junction dots (drawn above the lines) -------------------------------
  dotJobs.forEach(function (j) {
    var lit = !!j.color;
    var d = el("circle", {
      cx: j.x, cy: j.y, r: lit ? 3.4 : 2.4,
      class: "node" + (lit ? " node--lit" : ""),
      filter: lit ? "url(#softGlow)" : null,
    });
    if (lit) d.style.fill = j.color;
    gNodes.appendChild(d);
  });

  // ---- advancing flags: a winner's flag hops inward to where it plays next -
  // The winner of a round-r match advances to the NEXT ring in (ROUNDS[r+1]),
  // i.e. the ring where its following match's arc sits. These flags mark a
  // completed winning step, so they stay in colour even if that team is later
  // eliminated; the next match's grey connector shows where the run ended.
  // The champion is represented by the trophy, so the final round advances no flag.
  levels.forEach(function (nodes, r) {
    if (r + 1 >= ROUNDS.length) return;
    var flagR = ROUNDS[r + 1].radius;
    nodes.forEach(function (node) {
      if (node.winner == null) return;
      var team = CFG.teams[node.winner];
      if (!team) return;
      var pos = toXY(node.angle, flagR);
      flagCircle(gAdvance, pos.x, pos.y, ADV_FLAG_R, team.iso, false,
                 team.name, accentOf(node.winner));
    });
  });

  // ---- outer ring: flag + federation badge for every seeded team -----------
  leaves.forEach(function (leaf, idx) {
    var teamKey = leaf.team;
    var team = CFG.teams[teamKey];
    if (!team) {
      console.warn("[bracket] seed slot " + idx + " references unknown team '" + teamKey + "'");
      return;
    }
    var isOut = !!eliminated[teamKey];
    var flagPos = toXY(leaf.angle, FLAG_R);
    var badgePos = toXY(leaf.angle, BADGE_R);

    var g = flagCircle(gTeams, flagPos.x, flagPos.y, FLAG_RADIUS, team.iso, isOut, team.name);

    // federation badge (crest), outermost
    if (team.badge) {
      var badge = el("image", {
        x: badgePos.x - BADGE_SIZE / 2,
        y: badgePos.y - BADGE_SIZE / 2,
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        preserveAspectRatio: "xMidYMid meet",
        class: "badge-img",
      });
      badge.setAttribute("href", "assets/badges/" + team.badge);
      badge.setAttributeNS(XLINK, "href", "assets/badges/" + team.badge);
      g.appendChild(badge);
    }
  });

  // ---- centre: trophy ------------------------------------------------------
  var trophy = el("image", {
    x: CX - 50, y: CY - 60, width: 100, height: 120,
    href: "assets/trophy.svg",
    preserveAspectRatio: "xMidYMid meet",
    class: "trophy",
  });
  trophy.setAttributeNS("http://www.w3.org/1999/xlink", "href", "assets/trophy.svg");
  gCenter.appendChild(trophy);

  // ---- mount ---------------------------------------------------------------
  var mount = document.getElementById("bracket");
  mount.innerHTML = "";
  mount.appendChild(svg);

  // optional title
  var titleEl = document.getElementById("bracket-title");
  if (titleEl && CFG.title) titleEl.textContent = CFG.title;

  // ---- team hover tooltip --------------------------------------------------
  var tooltip = document.getElementById("team-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "team-tooltip";
    tooltip.className = "team-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tooltip);
  }
  if (tooltip) {
    var activeTeam = null;

    function teamFromTarget(target) {
      return target && target.closest ? target.closest(".team[data-team-name]") : null;
    }
    function moveTooltip(clientX, clientY) {
      var pad = 14;
      var x = clientX + pad;
      var y = clientY + pad;
      var rect = tooltip.getBoundingClientRect();
      if (x + rect.width > window.innerWidth - 8) x = clientX - rect.width - pad;
      if (y + rect.height > window.innerHeight - 8) y = clientY - rect.height - pad;
      tooltip.style.left = Math.max(8, x) + "px";
      tooltip.style.top = Math.max(8, y) + "px";
    }
    function showTooltip(team, clientX, clientY) {
      var name = team.getAttribute("data-team-name");
      if (!name) return;
      activeTeam = team;
      tooltip.textContent = name;
      tooltip.setAttribute("aria-hidden", "false");
      tooltip.classList.add("team-tooltip--visible");
      moveTooltip(clientX, clientY);
    }
    function hideTooltip() {
      activeTeam = null;
      tooltip.setAttribute("aria-hidden", "true");
      tooltip.classList.remove("team-tooltip--visible");
    }

    function onTeamOver(event) {
      var team = teamFromTarget(event.target);
      if (team && team !== activeTeam) showTooltip(team, event.clientX, event.clientY);
    }
    function onTeamMove(event) {
      if (activeTeam) moveTooltip(event.clientX, event.clientY);
    }
    function onTeamOut(event) {
      var team = teamFromTarget(event.target);
      if (team && (!event.relatedTarget || !team.contains(event.relatedTarget))) hideTooltip();
    }
    function onTeamFocus(event) {
      var team = teamFromTarget(event.target);
      if (!team) return;
      var box = team.getBoundingClientRect();
      showTooltip(team, box.left + box.width / 2, box.top + box.height / 2);
    }

    mount.addEventListener("mouseover", onTeamOver);
    mount.addEventListener("mousemove", onTeamMove);
    mount.addEventListener("mouseout", onTeamOut);
    mount.addEventListener("focusin", onTeamFocus);
    mount.addEventListener("focusout", hideTooltip);
  }
})();
