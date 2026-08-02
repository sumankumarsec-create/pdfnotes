/*
 * PdfPreview — single shared module for opening a PDF inline, in a modal,
 * from any page on the site (note pages, and can be reused elsewhere).
 * One file, loaded by every page that needs to "open" a PDF, instead of
 * each page rebuilding its own modal markup/logic.
 *
 * Usage: give any link a `data-pdf-preview` attribute pointing at the PDF
 * (usually the same href the link already has) and an optional
 * `data-pdf-title`. This script intercepts the click and opens the PDF in
 * an inline modal instead of navigating away. If this script fails to load
 * or JS is disabled, the link still works as a normal link straight to the
 * PDF — nothing is lost, this is a progressive enhancement only.
 */
(function () {
  'use strict';

  var modal, overlay, frame, closeBtn, titleEl, downloadLink;
  var built = false;

  function buildModal() {
    if (built) return;
    built = true;

    overlay = document.createElement('div');
    overlay.className = 'pdfp-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'PDF preview');

    modal = document.createElement('div');
    modal.className = 'pdfp-modal';

    var header = document.createElement('div');
    header.className = 'pdfp-header';

    titleEl = document.createElement('span');
    titleEl.className = 'pdfp-title';

    var actions = document.createElement('div');
    actions.className = 'pdfp-actions';

    downloadLink = document.createElement('a');
    downloadLink.className = 'pdfp-download';
    downloadLink.textContent = 'Download';
    downloadLink.setAttribute('download', '');

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'pdfp-close';
    closeBtn.setAttribute('aria-label', 'Close preview');
    closeBtn.textContent = '✕';

    actions.appendChild(downloadLink);
    actions.appendChild(closeBtn);
    header.appendChild(titleEl);
    header.appendChild(actions);

    frame = document.createElement('iframe');
    frame.className = 'pdfp-frame';
    frame.title = 'PDF preview';

    modal.appendChild(header);
    modal.appendChild(frame);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    var style = document.createElement('style');
    style.textContent =
      '.pdfp-overlay{position:fixed;inset:0;background:rgba(10,10,10,.72);display:none;' +
      'align-items:center;justify-content:center;z-index:2000;padding:24px;}' +
      '.pdfp-overlay.pdfp-open{display:flex;}' +
      '.pdfp-modal{background:#fff;width:100%;max-width:960px;height:88vh;display:flex;' +
      'flex-direction:column;border:1.5px solid #0a0a0a;}' +
      '.pdfp-header{display:flex;align-items:center;justify-content:space-between;gap:16px;' +
      'padding:14px 18px;border-bottom:1.5px solid #0a0a0a;}' +
      '.pdfp-title{font-family:Fraunces,serif;font-weight:600;font-size:15px;color:#0a0a0a;' +
      'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
      '.pdfp-actions{display:flex;align-items:center;gap:14px;flex-shrink:0;}' +
      '.pdfp-download{font-family:"JetBrains Mono",monospace;font-size:11px;letter-spacing:.06em;' +
      'text-transform:uppercase;color:#0a0a0a;text-decoration:none;border-bottom:1px solid #0a0a0a;}' +
      '.pdfp-close{background:none;border:none;font-size:16px;line-height:1;cursor:pointer;' +
      'color:#0a0a0a;padding:4px;}' +
      '.pdfp-frame{flex:1;border:none;width:100%;}';
    document.head.appendChild(style);

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('pdfp-open')) close();
    });
  }

  function open(fileUrl, title) {
    buildModal();
    titleEl.textContent = title || 'Preview';
    downloadLink.href = fileUrl;
    frame.src = fileUrl;
    overlay.classList.add('pdfp-open');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('pdfp-open');
    frame.src = '';
    document.body.style.overflow = '';
  }

  function bindAll() {
    var links = document.querySelectorAll('[data-pdf-preview]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var fileUrl = link.getAttribute('data-pdf-preview') || link.getAttribute('href');
        var title = link.getAttribute('data-pdf-title') || document.title;
        if (!fileUrl) return;
        e.preventDefault();
        open(fileUrl, title);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAll);
  } else {
    bindAll();
  }

  window.PdfPreview = { open: open, close: close };
})();
