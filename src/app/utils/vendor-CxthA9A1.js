/**
 * Source: https://app.podscribe.com/assets/vendor-CxthA9A1.js
 *
 * This file is used to compress and decompress data.
 * It is used in the app.podscribe.com website.
 *
 * It is a modified version of the original file, use tree-shaking to remove the unused code.
 *
 * The original file is not available in the public domain.
 *
 */

var F_ = {},
  GD = {},
  _2 = {},
  xFe;
function jvt() {
  if (xFe) return _2;
  (xFe = 1),
    Object.defineProperty(_2, "__esModule", {
      value: !0,
    });
  function e(r) {
    return Object.prototype.toString.call(r);
  }
  _2.getType = e;
  function t(r) {
    throw new TypeError("unsupported data type: " + e(r));
  }
  return (_2.throwUnknownDataType = t), _2;
}
var Gb = {},
  Yb = {},
  SFe;
function zvt() {
  if (SFe) return Yb;
  (SFe = 1),
    Object.defineProperty(Yb, "__esModule", {
      value: !0,
    });
  let e = "";
  for (let d = 0; d < 10; d++) {
    const h = String.fromCharCode(48 + d);
    e += h;
  }
  for (let d = 0; d < 26; d++) {
    const h = String.fromCharCode(65 + d);
    e += h;
  }
  for (let d = 0; d < 26; d++) {
    const h = String.fromCharCode(97 + d);
    e += h;
  }
  const t = e.length,
    r = {};
  for (let d = 0; d < t; d++) {
    const h = e[d];
    r[h] = d;
  }
  function n(d) {
    let h = 0,
      p = 1;
    for (let g = d.length - 1; g >= 0; g--) {
      const m = d[g];
      let b = r[m];
      (b *= p), (h += b), (p *= t);
    }
    return h;
  }
  Yb.s_to_int = n;
  function i(d) {
    let h = BigInt(0),
      p = BigInt(1);
    const g = BigInt(t);
    for (let m = d.length - 1; m >= 0; m--) {
      const b = d[m];
      let y = BigInt(r[b]);
      (y *= p), (h += y), (p *= g);
    }
    return h;
  }
  Yb.s_to_big_int = i;
  function o(d) {
    if (d === 0) return e[0];
    const h = [];
    for (; d !== 0; ) {
      const p = d % t,
        g = e[p];
      h.push(g), (d -= p), (d /= t);
    }
    return h.reverse().join("");
  }
  Yb.int_to_s = o;
  function a(d) {
    const h = BigInt(0),
      p = BigInt(t);
    if (d === h) return e[0];
    const g = [];
    for (; d !== h; ) {
      const m = d % p,
        b = e[Number(m)];
      g.push(b), (d -= m), (d /= p);
    }
    return g.reverse().join("");
  }
  Yb.big_int_to_s = a;
  function s(d) {
    return d.split("").reverse().join("");
  }
  function u(d) {
    if (d < 0) return "-" + u(-d);
    let [h, p] = d.toString().split(".");
    if (!p) return o(d);
    let g;
    p && ([p, g] = p.split("e")), (h = l(h)), (p = s(p)), (p = l(p));
    let m = h + "." + p;
    if (g) {
      switch (((m += "."), g[0])) {
        case "+":
          g = g.slice(1);
          break;
        case "-":
          (m += "-"), (g = g.slice(1));
          break;
      }
      (g = s(g)), (g = l(g)), (m += g);
    }
    return m;
  }
  Yb.num_to_s = u;
  function l(d) {
    const h = +d;
    return h.toString() === d ? o(h) : ":" + a(BigInt(d));
  }
  Yb.int_str_to_s = l;
  function c(d) {
    return d[0] === ":" ? i(d.substring(1)).toString() : n(d).toString();
  }
  function f(d) {
    if (d[0] === "-") return -f(d.substr(1));
    let [h, p, g] = d.split(".");
    if (!p) return n(h);
    (h = c(h)), (p = c(p)), (p = s(p));
    let m = h + "." + p;
    if (g) {
      m += "e";
      let b = !1;
      g[0] === "-" && ((b = !0), (g = g.slice(1))),
        (g = c(g)),
        (g = s(g)),
        (m += b ? -g : +g);
    }
    return +m;
  }
  return (Yb.s_to_num = f), Yb;
}
var wFe;
function Uvt() {
  if (wFe) return Gb;
  (wFe = 1),
    Object.defineProperty(Gb, "__esModule", {
      value: !0,
    });
  const e = zvt();
  function t(u) {
    return "n|" + e.num_to_s(u);
  }
  Gb.encodeNum = t;
  function r(u) {
    return (u = u.replace("n|", "")), e.s_to_num(u);
  }
  Gb.decodeNum = r;
  function n(u) {
    return typeof u == "number" ? u : e.s_to_int(u);
  }
  Gb.decodeKey = n;
  function i(u) {
    return u ? "b|T" : "b|F";
  }
  Gb.encodeBool = i;
  function o(u) {
    switch (u) {
      case "b|T":
        return !0;
      case "b|F":
        return !1;
    }
    return !!u;
  }
  Gb.decodeBool = o;
  function a(u) {
    switch (u[0] + u[1]) {
      case "b|":
      case "o|":
      case "n|":
      case "a|":
      case "s|":
        u = "s|" + u;
    }
    return u;
  }
  Gb.encodeStr = a;
  function s(u) {
    return u[0] + u[1] === "s|" ? u.substr(2) : u;
  }
  return (Gb.decodeStr = s), Gb;
}
var $S = {},
  ij = {},
  CFe;
function ihr() {
  return (
    CFe ||
      ((CFe = 1),
      Object.defineProperty(ij, "__esModule", {
        value: !0,
      }),
      (ij.config = {
        sort_key: !1,
      })),
    ij
  );
}
var EFe;
function Hvt() {
  if (EFe) return $S;
  (EFe = 1),
    Object.defineProperty($S, "__esModule", {
      value: !0,
    });
  const e = ihr(),
    t = jvt(),
    r = Uvt(),
    n = zvt();
  function i(f) {
    return f.store.toArray();
  }
  $S.memToValues = i;
  function o() {
    const f = [];
    return {
      forEach(d) {
        for (let h = 0; h < f.length; h++) if (d(f[h]) === "break") return;
      },
      add(d) {
        f.push(d);
      },
      toArray() {
        return f;
      },
    };
  }
  $S.makeInMemoryStore = o;
  function a() {
    const f = Object.create(null),
      d = Object.create(null);
    return {
      getValue(h) {
        return f[h];
      },
      getSchema(h) {
        return d[h];
      },
      forEachValue(h) {
        for (const [p, g] of Object.entries(f)) if (h(p, g) === "break") return;
      },
      forEachSchema(h) {
        for (const [p, g] of Object.entries(d)) if (h(p, g) === "break") return;
      },
      setValue(h, p) {
        f[h] = p;
      },
      setSchema(h, p) {
        d[h] = p;
      },
      hasValue(h) {
        return h in f;
      },
      hasSchema(h) {
        return h in d;
      },
    };
  }
  $S.makeInMemoryCache = a;
  function s() {
    return {
      store: o(),
      cache: a(),
      keyCount: 0,
    };
  }
  $S.makeInMemoryMemory = s;
  function u(f, d) {
    if (f.cache.hasValue(d)) return f.cache.getValue(d);
    const h = f.keyCount++,
      p = n.num_to_s(h);
    return f.store.add(d), f.cache.setValue(d, p), p;
  }
  function l(f, d) {
    e.config.sort_key && d.sort();
    const h = d.join(",");
    if (f.cache.hasSchema(h)) return f.cache.getSchema(h);
    const p = c(f, d, void 0);
    return f.cache.setSchema(h, p), p;
  }
  function c(f, d, h) {
    if (d === null) return "";
    switch (typeof d) {
      case "undefined":
        if (Array.isArray(h)) return c(f, null, h);
        break;
      case "object":
        if (d === null) return u(f, null);
        if (Array.isArray(d)) {
          let p = "a";
          for (let g = 0; g < d.length; g++) {
            const m = d[g],
              b = m === null ? "_" : c(f, m, d);
            p += "|" + b;
          }
          return p === "a" && (p = "a|"), u(f, p);
        } else {
          const p = Object.keys(d);
          if (p.length === 0) return u(f, "o|");
          let g = "o";
          const m = l(f, p);
          g += "|" + m;
          for (const b of p) {
            const y = d[b],
              _ = c(f, y, d);
            g += "|" + _;
          }
          return u(f, g);
        }
      case "boolean":
        return u(f, r.encodeBool(d));
      case "number":
        return u(f, r.encodeNum(d));
      case "string":
        return u(f, r.encodeStr(d));
    }
    return t.throwUnknownDataType(d);
  }
  return ($S.addValue = c), $S;
}
var TFe;
function OFe() {
  if (TFe) return GD;
  (TFe = 1),
    Object.defineProperty(GD, "__esModule", {
      value: !0,
    });
  const e = jvt(),
    t = Uvt(),
    r = Hvt();
  function n(u) {
    const l = r.makeInMemoryMemory(),
      c = r.addValue(l, u, void 0);
    return [r.memToValues(l), c];
  }
  GD.compress = n;
  function i(u, l) {
    if (l === "o|") return {};
    const c = {},
      f = l.split("|"),
      d = f[1];
    let h = a(u, d);
    const p = f.length;
    p - 2 === 1 && !Array.isArray(h) && (h = [h]);
    for (let g = 2; g < p; g++) {
      const m = h[g - 2];
      let b = f[g];
      (b = a(u, b)), (c[m] = b);
    }
    return c;
  }
  function o(u, l) {
    if (l === "a|") return [];
    const c = l.split("|"),
      f = c.length - 1,
      d = new Array(f);
    for (let h = 0; h < f; h++) {
      let p = c[h + 1];
      (p = a(u, p)), (d[h] = p);
    }
    return d;
  }
  function a(u, l) {
    if (l === "" || l === "_") return null;
    const c = t.decodeKey(l),
      f = u[c];
    if (f === null) return f;
    switch (typeof f) {
      case "undefined":
        return f;
      case "number":
        return f;
      case "string":
        switch (f[0] + f[1]) {
          case "b|":
            return t.decodeBool(f);
          case "o|":
            return i(u, f);
          case "n|":
            return t.decodeNum(f);
          case "a|":
            return o(u, f);
          default:
            return t.decodeStr(f);
        }
    }
    return e.throwUnknownDataType(f);
  }
  GD.decode = a;
  function s(u) {
    const [l, c] = u;
    return a(l, c);
  }
  return (GD.decompress = s), GD;
}
var x2 = {},
  AFe;
function ohr() {
  if (AFe) return x2;
  (AFe = 1),
    Object.defineProperty(x2, "__esModule", {
      value: !0,
    });
  function e(n) {
    for (const i in n) n[i] === void 0 && delete n[i];
  }
  x2.trimUndefined = e;
  function t(n) {
    r(n, new Set());
  }
  x2.trimUndefinedRecursively = t;
  function r(n, i) {
    i.add(n);
    for (const o in n)
      if (n[o] === void 0) delete n[o];
      else {
        const a = n[o];
        a && typeof a == "object" && !i.has(a) && r(a, i);
      }
  }
  return x2;
}
var DFe;
function ahr() {
  if (DFe) return F_;
  (DFe = 1),
    Object.defineProperty(F_, "__esModule", {
      value: !0,
    });
  var e = OFe();
  (F_.compress = e.compress), (F_.decompress = e.decompress);
  var t = OFe();
  F_.decode = t.decode;
  var r = Hvt();
  F_.addValue = r.addValue;
  var n = ohr();
  return (
    (F_.trimUndefined = n.trimUndefined),
    (F_.trimUndefinedRecursively = n.trimUndefinedRecursively),
    F_
  );
}
var S7n = ahr();
export const decompress = S7n.decompress;
