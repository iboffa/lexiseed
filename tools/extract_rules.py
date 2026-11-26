#!/usr/bin/env python3
"""Draft a generator's rule set from a table of annotated examples. Pure standard library.

The output is a *draft* domain brief: every rule comes with the counts behind it, so the user can confirm, edit or
reject it. Nothing here is a fact about the domain until the user confirms it; few examples produce many
coincidences, so the script reports support and a confidence lower bound for each candidate.

Input: JSON (a list of objects) or CSV. One row per example. Recognised keys:
  id        example name (optional)          source   provenance: file, URL, catalogue page (recommended)
  style     the family/style/class (optional, enables per-style analysis)
  steps     (JSON only) an ordered list of step names, for precedence mining
  anything else: a categorical field (strings, booleans) or a numeric field (numbers).
  A list value (JSON) is a multi-valued field: each element counts as present.

Usage:
  python3 extract_rules.py examples.json [--min-support 3] [--out brief_draft.md] [--json rules.json]
  python3 extract_rules.py --demo
"""
import csv
import json
import math
import sys
from collections import Counter, defaultdict
from itertools import combinations

RESERVED = {"id", "source", "style", "steps"}


def load(path):
    if path.endswith(".json"):
        rows = json.load(open(path))
    else:
        rows = []
        for r in csv.DictReader(open(path, newline="")):
            rows.append({k: _num(v) for k, v in r.items() if v not in ("", None)})
    return rows


def _num(v):
    try:
        f = float(v)
        return int(f) if f.is_integer() and "." not in str(v) else f
    except (TypeError, ValueError):
        return v


def wilson_lower(k, n, z=1.96):
    """Lower bound of the 95% Wilson interval for k successes in n trials (0 if n == 0)."""
    if n == 0:
        return 0.0
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    r = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return max(0.0, (c - r) / d)


def quantile(xs, q):
    s = sorted(xs)
    if not s:
        return None
    i = q * (len(s) - 1)
    lo, hi = int(math.floor(i)), int(math.ceil(i))
    return s[lo] + (s[hi] - s[lo]) * (i - lo)


def spearman(a, b):
    def ranks(v):
        order = sorted(range(len(v)), key=lambda i: v[i])
        r = [0.0] * len(v)
        i = 0
        while i < len(v):
            j = i
            while j + 1 < len(v) and v[order[j + 1]] == v[order[i]]:
                j += 1
            for k in range(i, j + 1):
                r[order[k]] = (i + j) / 2.0
            i = j + 1
        return r
    if len(a) < 3:
        return None
    ra, rb = ranks(a), ranks(b)
    ma, mb = sum(ra) / len(ra), sum(rb) / len(rb)
    num = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    den = math.sqrt(sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb))
    return num / den if den else None


def items(row):
    """The categorical facts of a row as 'field=value' strings."""
    out = set()
    for k, v in row.items():
        if k in RESERVED or isinstance(v, (int, float)) and not isinstance(v, bool):
            continue
        for x in (v if isinstance(v, list) else [v]):
            out.add("%s=%s" % (k, x))
    return out


def analyse(rows, min_support=3, min_conf_lower=0.8):
    n = len(rows)
    res = {"n_examples": n, "sources": sorted({str(r.get("source")) for r in rows if r.get("source")}),
           "missing_source": sum(1 for r in rows if not r.get("source"))}
    styles = Counter(str(r["style"]) for r in rows if "style" in r)
    res["styles"] = dict(styles)
    # ---- vocabulary ----
    vocab = defaultdict(Counter)
    numeric = defaultdict(list)
    for r in rows:
        for k, v in r.items():
            if k in RESERVED:
                continue
            if isinstance(v, (int, float)) and not isinstance(v, bool):
                numeric[k].append((v, str(r.get("style", "")), r))
            else:
                for x in (v if isinstance(v, list) else [v]):
                    vocab[k][str(x)] += 1
    res["vocabulary"] = {k: dict(c.most_common()) for k, c in sorted(vocab.items())}
    res["seen_once"] = sorted("%s=%s" % (k, x) for k, c in vocab.items() for x, m in c.items() if m == 1)
    # ---- per-style values: which values only ever occur in one style (candidate tags) ----
    if styles:
        by_style = defaultdict(lambda: defaultdict(Counter))
        for r in rows:
            if "style" not in r:
                continue
            for it in items(r):
                f, x = it.split("=", 1)
                by_style[f][x][str(r["style"])] += 1
        tags = {}
        for f, vals in by_style.items():
            for x, sc in vals.items():
                if len(sc) == 1 and sum(sc.values()) >= min_support:
                    tags["%s=%s" % (f, x)] = next(iter(sc))
        res["style_only_values"] = tags
    # ---- numeric ranges and correlations ----
    ranges = {}
    for k, vals in sorted(numeric.items()):
        groups = {"all": [v for v, _, _ in vals]}
        if styles:
            for s in styles:
                g = [v for v, st, _ in vals if st == s]
                if g:
                    groups[s] = g
        ranges[k] = {g: {"n": len(xs), "min": min(xs), "p10": quantile(xs, .1), "median": quantile(xs, .5),
                         "p90": quantile(xs, .9), "max": max(xs)} for g, xs in groups.items()}
    res["numeric_ranges"] = ranges
    corr = []
    keys = sorted(numeric)
    for a, b in combinations(keys, 2):
        pairs = [(r[a], r[b]) for r in rows if isinstance(r.get(a), (int, float)) and isinstance(r.get(b), (int, float))]
        rho = spearman([p[0] for p in pairs], [p[1] for p in pairs])
        if rho is not None:
            crit = 1.96 / math.sqrt(len(pairs) - 1)   # approx. two-tailed 5% critical value for a rank correlation
            corr.append({"a": a, "b": b, "spearman": round(rho, 3), "n": len(pairs), "critical": round(crit, 2),
                         "significant": abs(rho) > crit})
    res["correlations"] = sorted(corr, key=lambda c: -abs(c["spearman"]))
    # ---- association rules: requires / excludes candidates ----
    sets = [items(r) for r in rows]
    cnt = Counter(i for s in sets for i in s)
    req, exc = [], []
    for a, b in combinations(sorted(cnt), 2):
        if a.split("=", 1)[0] == b.split("=", 1)[0]:
            continue   # two values of one single-valued field never co-occur by construction
        ab = sum(1 for s in sets if a in s and b in s)
        for x, y in ((a, b), (b, a)):
            if cnt[x] >= min_support and ab == cnt[x] and cnt[y] < n:
                lo = wilson_lower(ab, cnt[x])
                req.append({"if": x, "then": y, "support": cnt[x], "confidence": 1.0,
                            "confidence_lower95": round(lo, 3), "lift": round(ab * n / (cnt[x] * cnt[y]), 2),
                            "strong": lo >= min_conf_lower})
        expected = cnt[a] * cnt[b] / n
        if ab == 0 and expected >= min_support:
            exc.append({"a": a, "b": b, "count_a": cnt[a], "count_b": cnt[b], "expected_together": round(expected, 1)})
    res["requires_candidates"] = sorted(req, key=lambda r: (-r["confidence_lower95"], -r["support"]))
    res["excludes_candidates"] = sorted(exc, key=lambda r: -r["expected_together"])
    # ---- precedence among steps ----
    seqs = [r["steps"] for r in rows if isinstance(r.get("steps"), list)]
    if seqs:
        before, both = Counter(), Counter()
        for s in seqs:
            pos = {}
            for i, x in enumerate(s):
                pos.setdefault(x, i)
            for x, y in combinations(sorted(pos), 2):
                both[(x, y)] += 1
                if pos[x] < pos[y]:
                    before[(x, y)] += 1
        prec = []
        for (x, y), m in both.items():
            if m >= min_support and before[(x, y)] in (0, m):
                first, second = (x, y) if before[(x, y)] == m else (y, x)
                prec.append({"before": first, "after": second, "co_occurrences": m})
        res["precedence_candidates"] = sorted(prec, key=lambda p: -p["co_occurrences"])
    return res


def brief(res, min_support):
    L = ["# Draft rules extracted from examples (CANDIDATES: confirm each with the user)", "",
         "%d examples; %d without a recorded source. Styles: %s." % (
             res["n_examples"], res["missing_source"], res["styles"] or "none given"),
         "Rules need support >= %d; \"strong\" needs a 95%% lower bound >= 0.8, i.e. about 16+ consistent cases."
         " Everything here is a candidate until the user confirms it; \"never together\" in n examples still allows"
         " a rate up to about 3/n." % min_support, "",
         "## Vocabulary (field: value x count)"]
    for f, vals in res["vocabulary"].items():
        L.append("- **%s**: %s" % (f, ", ".join("%s x%d" % (v, c) for v, c in vals.items())))
    if res["seen_once"]:
        L += ["", "Seen once (too rare to generalise; ask whether they are typical): " + ", ".join(res["seen_once"])]
    if res.get("style_only_values"):
        L += ["", "## Values seen in only one style (candidate style tags)"]
        L += ["- %s -> only in **%s**" % (k, v) for k, v in sorted(res["style_only_values"].items())]
    if res["numeric_ranges"]:
        L += ["", "## Numeric ranges (min / p10 / median / p90 / max, n)"]
        for k, g in res["numeric_ranges"].items():
            for name, r in g.items():
                L.append("- %s [%s]: %s / %s / %s / %s / %s (n=%d)" % (
                    k, name, *(_fmt(r[x]) for x in ("min", "p10", "median", "p90", "max")), r["n"]))
    if res["correlations"]:
        L += ["", "## Correlations (Spearman; below the critical value it is indistinguishable from noise)"]
        L += ["- %s ~ %s: %+.2f (n=%d, critical %.2f)%s" % (
            c["a"], c["b"], c["spearman"], c["n"], c["critical"], "" if c["significant"] else "  [noise]")
              for c in res["correlations"][:15]]
    L += ["", "## Candidate hard rules: A requires B (B present whenever A is)"]
    L += ["- %s -> %s (support %d, conf. lower bound %.2f, lift %.2f)%s" % (
        r["if"], r["then"], r["support"], r["confidence_lower95"], r["lift"], "" if r["strong"] else "  [weak]")
          for r in res["requires_candidates"][:30]] or ["- none at this support"]
    L += ["", "## Candidate hard rules: A excludes B (never together, though expected)"]
    L += ["- %s x %s (counts %d / %d, expected together %.1f)" % (
        e["a"], e["b"], e["count_a"], e["count_b"], e["expected_together"]) for e in res["excludes_candidates"][:30]] \
        or ["- none at this support"]
    if res.get("precedence_candidates"):
        L += ["", "## Candidate step orders (always in this order when both occur)"]
        L += ["- %s before %s (%d examples)" % (p["before"], p["after"], p["co_occurrences"])
              for p in res["precedence_candidates"][:30]]
    L += ["", "Next: for each candidate, the user marks it RULE (hard), PREFERENCE (soft cost), or COINCIDENCE (drop)."]
    return "\n".join(L) + "\n"


def _fmt(x):
    return "%.3g" % x if isinstance(x, float) else str(x)


DEMO = [  # synthetic, for the demo only: not domain data
    {"id": "a", "source": "demo", "style": "plain", "door": "panel", "window": "sash", "roof": "cornice", "bays": 3, "height": 9.1},
    {"id": "b", "source": "demo", "style": "plain", "door": "panel", "window": "sash", "roof": "parapet", "bays": 2, "height": 8.0},
    {"id": "c", "source": "demo", "style": "plain", "door": "panel", "window": "casement", "roof": "cornice", "bays": 3, "height": 9.4},
    {"id": "d", "source": "demo", "style": "plain", "door": "double", "window": "sash", "roof": "cornice", "bays": 4, "height": 10.2},
    {"id": "e", "source": "demo", "style": "glass", "door": "glazed", "window": "plate", "roof": "flat", "bays": 2, "height": 7.1},
    {"id": "f", "source": "demo", "style": "glass", "door": "glazed", "window": "plate", "roof": "flat", "bays": 3, "height": 7.9},
    {"id": "g", "source": "demo", "style": "glass", "door": "glazed", "window": "plate", "roof": "parapet", "bays": 4, "height": 8.8},
    {"id": "h", "style": "glass", "door": "double", "window": "plate", "roof": "flat", "bays": 3, "height": 8.2},
]

if __name__ == "__main__":
    args = sys.argv[1:]
    ms = int(args[args.index("--min-support") + 1]) if "--min-support" in args else 3
    rows = DEMO if "--demo" in args else load(args[0])
    res = analyse(rows, ms)
    text = brief(res, ms)
    if "--out" in args:
        open(args[args.index("--out") + 1], "w").write(text)
    if "--json" in args:
        json.dump(res, open(args[args.index("--json") + 1], "w"), indent=2, default=str)
    print(text)
