Color = require('lua-color')

if vim.g.loaded_neocursorline then
    return
end

function get_highlight_value(group, attr)
    local fn = vim.fn

    return fn.synIDattr(fn.synIDtrans(fn.hlID(group)), attr)
end

function get_lumiance()
    local background = get_highlight_value('Conceal', 'bg#')
    local _, _, l = Color(background):hsl()

    return l < 0.5 and 'dark' or 'light'
end

function round(number, dp)
    local mult = 10^(dp or 2)

    return math.floor(number * mult + 0.5) / mult
end

function update_highlight(highlight_groups, dim, pop, luminance)
    highlight_groups['source'] = highlight_groups['source'] or highlight_groups['target']
    local background = get_highlight_value(highlight_groups['source'], 'bg#')
    local h, s, l = Color(background):hsl()
    local update_highlight = 'highlight ' .. highlight_groups['target']

    if pop then
        update_highlight = update_highlight .. ' gui=bold'
    end

    h = round(h)
    s = round(s)
    l = round(l)

    if luminance == 'dark' then
        l = l - dim
        l = l < 0 and 0 or l
    elseif luminance == 'light' then
        l = l + dim
        l = l > 1 and 1 or l
    end

    highlight_background = Color { h = h, s = s, l = l }
    update_highlight = update_highlight .. ' guibg=' .. highlight_background:tostring()

    vim.cmd(update_highlight)
end

function neocursorline(args)
    local dim = args['dim'] or 0.06
    local cursor_column_dim = args['cursor_column_dim'] or dim
    local pop = args['pop'] or true
    local visual = args['visual'] or true
    local luminance = get_lumiance()

    update_highlight({ source = 'Conceal', target = 'Cursorline' }, dim, pop, luminance)
    update_highlight({ source = 'Conceal', target = 'CursorColumn' }, cursor_column_dim, false, luminance)

    if visual then
        update_highlight({ target = 'Visual' }, dim, pop, luminance)
    end
end

local augroup = vim.api.nvim_create_augroup('neocursorline', { clear = true })

vim.api.nvim_create_autocmd({ 'ColorScheme' }, {
    pattern = '*',
    group = augroup,
    callback = function() neocursorline{} end,
})

vim.g.loaded_neocursorline = true
