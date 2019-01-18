export default ({ body, title, initialState }) =>
  `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
      </head>

      <body>
        <div id="root">${body}</div>
      </body>

      <script>window.__APP_INITIAL_STATE__ = ${initialState}</script>
      <script src="/assets/bundle.js"></script>
    </html>
  `;
