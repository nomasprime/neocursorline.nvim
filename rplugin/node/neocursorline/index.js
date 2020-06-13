const convert = require('color-convert');

async function updateHighlight(plugin, highlights, dim, pop) {
  if (highlights.target == undefined) throw new TypeError('Missing target highlight');
  highlights.source = highlights.source || highlights.target;

  const {background} = await plugin.nvim.getHighlightByName(highlights.source);
  const highlightBackground = convert.hex.hsl(background.toString(16));

  let updateHighlight = `highlight ${highlights.target} `;

  if (pop) {
    updateHighlight += 'gui=bold ';
  }

  let dimmedBackground = Object.create(highlightBackground);
  dimmedBackground[2] = dimmedBackground[2] * (1 - dim);
  dimmedBackground = convert.hsl.hex(dimmedBackground);
  updateHighlight += 'guibg=#' + dimmedBackground;

  await plugin.nvim.command(updateHighlight);
}

module.exports = plugin => {
  plugin.registerFunction('NeoCursorLine', async (args) => {
    try {
      const [dim, pop = false, visualDiff = false] = args;

      updateHighlight(plugin, { source: 'Normal', target: 'Cursorline' }, dim, pop);

      if (visualDiff) {
        updateHighlight(plugin, { target: 'Visual' }, dim * dim, pop);
      }
    } catch(err) {
      console.log(err);
    }
  }, {sync: false})
};
