/**
 * CSS matrix3d that maps a w x h box (transform-origin 0 0) onto an arbitrary
 * quad [TL, TR, BR, BL] in px: used to pin DOM content onto a surface in video.
 */
export function quadMatrix(w: number, h: number, q: [number, number][]) {
  const src = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  // Solve the 8 unknowns of the homography (h22 = 1).
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = q[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const hm = solve(A, b);
  const [a, bb, c, d, e, f, g, hh] = hm;
  // column-major for CSS matrix3d
  const m = [a, d, 0, g, bb, e, 0, hh, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((x) => x.toFixed(10)).join(',')})`;
}

function solve(A: number[][], b: number[]) {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  return M.map((r, i) => r[n] / r[i]);
}
