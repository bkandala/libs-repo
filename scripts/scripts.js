/**
 * This repo's own page-bootstrap.
 * Runs on pages WITHIN this libs repo (e.g. demo pages, docs).
 * It points libsUrl at itself (local /libs path).
 */
import { loadPage } from '../libs/scripts/scripts.js';

const LIBS = '/libs';

loadPage({
  libsUrl: LIBS,
  codeRoot: '/',
});
(async function loadDa() {
  if (!new URL(window.location.href).searchParams.get('dapreview')) return;
  // eslint-disable-next-line import/no-unresolved
  import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
}());
