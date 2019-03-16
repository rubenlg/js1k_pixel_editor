# Pixel art editor for the js1k competition in 2019

## Controls

 - Click on the palette to switch color.
 - Click on the toolbar items to switch tool or undo/redo.
 - Keyboard: 1,2,3 activates paint, fill, rectangle.
 - Keyboard: 0 cycles through the palette.

## Other features

 - CGA Color palette
 - Preview mini-image
 - Infinite undo/redo.

 ## Notes

 - Uses hacks to reduce the final crushed size. Most of the hacks are documented
   directly in the code.
 - I didn't try to be smarter than the closure compiler. It does an excellent
   job, and all I did is helping it a bit.
 - The coding style is not consistent. Sometimes using a function reduces binary
   size, and sometimes inlining the code wins. This is because the code runs
   through regpack which is good at reducing code size in presence of
   duplication.

 ## Minimizing

1. Replace const and let with var.
2. Run Closure compiler with the following flags: `-O advanced --rewrite_polyfills=false --language_out ES6 --charset UTF-8 --strict_mode_input=false`.
3. Run after-closure.js
4. Run regpack with the following flags: `--crushGainFactor 1 --crushLengthFactor 0 --crushCopiesFactor 0`

These are the minimizers and flags that worked well for this particular code. I aways ran multiple minimizers on every build (including uglify-es and jscrush) and picked the combination that produced the smallest result.

## License

GPL v3

### What can you use this code for.

By default, whatever the GPL v3 allows. If you need to use it for something not
allowed by GPL v3, please contact me.
