if exists('g:loaded_neocursorline')
  finish
endif

let g:loaded_neocursorline = 1

let s:cpo_save = &cpo
set cpo&vim

function! neocursorline#install()
  call system('npm install')
  UpdateRemotePlugins
endfunction

augroup neocursorline
  autocmd ColorScheme * :call NeoCursorLine()
augroup END

let &cpo = s:cpo_save
unlet s:cpo_save
