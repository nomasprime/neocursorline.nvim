const convert = require('color-convert');

async function getLuminance(plugin) {
  const {background} = await plugin.nvim.getHighlightByName('Normal');
  const normalBackground = convert.hex.hsl(background.toString(16));

  return (normalBackground[2] < 50 ? 'dark' : 'light');
}

async function updateHighlight(plugin, highlights, dim, pop, luminance) {
  if (highlights.target == undefined) throw new TypeError('Missing target highlight');
  highlights.source = highlights.source || highlights.target;

  const {background} = await plugin.nvim.getHighlightByName(highlights.source);
  const highlightBackground = convert.hex.hsl(background.toString(16));

  let updateHighlight = `highlight ${highlights.target} `;

  if (pop) {
    updateHighlight += 'gui=bold ';
  }

  let dimmedBackground = Object.create(highlightBackground);

  if (luminance == 'dark') {
    dimmedBackground[2] = dimmedBackground[2] - dim;
    dimmedBackground[2] = dimmedBackground[2] < 0 ? 0 : dimmedBackground[2];
  } else if (luminance == 'light') {
    dimmedBackground[2] = dimmedBackground[2] + dim;
    dimmedBackground[2] = dimmedBackground[2] > 100 ? 100 : dimmedBackground[2];
  } else {
    throw new TypeError('Invalid luminance');
  }

  dimmedBackground = convert.hsl.hex(dimmedBackground);
  updateHighlight += 'guibg=#' + dimmedBackground;

  await plugin.nvim.command(updateHighlight);
}

let dim, pop, visual;

module.exports = plugin => {
  plugin.registerFunction('NeoCursorLine', async (args) => {
    args = args[0]

    try {
      const dim = args['dim'] === undefined ? 6 : parseInt(args['dim']);
      const cursorColumnDim = args['cursor_column_dim'] === undefined ? dim : parseInt(args['cursor_column_dim']);
      const pop = args['pop'] === undefined ? true : args['pop'] == true;
      const visual = args['visual'] === undefined ? true : args['visual'] == true;

      const luminance = await getLuminance(plugin);

      updateHighlight(plugin, { source: 'Normal', target: 'Cursorline' }, dim, pop, luminance);
      updateHighlight(plugin, { source: 'Normal', target: 'CursorColumn' }, cursorColumnDim, false, luminance);

      if (visual) {
        updateHighlight(plugin, { target: 'Visual' }, dim, pop, luminance);
      }
    } catch(err) {
      console.log(err);
    }
  }, {sync: false})
};
