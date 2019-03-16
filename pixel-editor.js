/**
 * Pixel art editor in under 1K (when properly minimized).
 * Author: Rubén López (@el_ryu on Twitter)
 *
 * License: GPLv3
 *
 * See README.md for more details.
 */

/** The standard CGA color palette. */
const CGA_PALETTE = [
  '#000',
  '#555',
  '#00a',
  '#55f',
  '#0a0',
  '#5f5',
  '#0aa',
  '#5ff',
  '#a00',
  '#f55',
  '#a0a',
  '#f5f',
  '#a50',
  '#ff5',
  '#aaa',
  '#fff',
];
// Compresses better than using CGA_PALETTE.length
const PALETTE_LENGTH = 16;

/**
 * Helper functions that will be inlined by the closure compiler and make the
 * code more readable while using js1k provided small variables.
 *
 * Kept as non-arrow functions to distinguish from the arrow ones that will not
 * be inlined, and should use less bytes.
 */
function getCanvas() {
  return a;
}

function setFillStyle(style) {
  c.fillStyle = style
}

function setStrokeStyle(style) {
  c.strokeStyle = style;
}

function setLineWidth(w) {
  c.lineWidth = w;
}

function setFont(f) {
  c.font = f;
}

function canvasFillRect(x1, x2, x3, x4) {
  c.fillRect(x1, x2, x3, x4);
}

function canvasStrokeRect(x1, x2, x3, x4) {
  c.strokeRect(x1 + .5, x2 + .5, x3, x4);
}

function canvasFillText(text, x, y) {
  c.fillText(text, x, y);
}

/** Width/height of each pixel in the drawable area. */
const PIXEL_SIDE = 16;
const PIXEL_SIDE_POW2 = 4;  // To enable bit shifts for integer division, which
                            // avoids a floor operation.

/** Width/height of each pixel in the preview image. */
const PREVIEW_PIXEL_SIDE = 2;

/** The area where the user can paint. */
const DRAWABLE_AREA_X = 64;
const DRAWABLE_AREA_Y = 64;
const DRAWABLE_AREA_W = 32 * PIXEL_SIDE;
const DRAWABLE_AREA_H = 32 * PIXEL_SIDE;

/** X coordinate where the preview image starts. */
const PREVIEW_IMAGE_X = DRAWABLE_AREA_X + 32 * PIXEL_SIDE + 32;

/** The area where the user can pick colors. */
const PALETTE_X = 10;
const PALETTE_Y = 64;
const PALETTE_W = 32;
const PALETTE_H = PALETTE_LENGTH * 32;

/** Toolbox constants */
const TOOL_COUNT = 5;
const TOOLBOX_X = 64;
const TOOLBOX_Y = 10;
const TOOLBOX_W = 32 * TOOL_COUNT;
const TOOLBOX_H = 32;

/** Mode constants */
const MODE_PAINT = 0;
const MODE_FILL = 1;
const MODE_RECT = 2;

/** Current mode of operation. */
let mode = MODE_PAINT;

/** Rectangle coordinates for the MODE_RECT tool. */
let rectangleStartX = 32;
let rectangleStartY = 0;
let rectangleEndX;
let rectangleEndY;

/** The currently selected color from the palette. */
let currentColor = 7;

/** The matrix with the pixels. */
let DRAWING = Array(32 * 32).fill(0);

/** The stacks for undo/redo. */
let UNDO_STACK = [];
let REDO_STACK = [];

/**
 * Boolean clarifying if the user is painting (the left mouse button is
 * pressed). Using a number for better compression.
 */
let painting = 0;

/**
 * Whether the given pixel is contained in the given area.
 *
 * Using >= and <= would have been more accurate, but we give up that one pixel
 * precision for smaller binary size.
 */
const contained = (x, y, areaX, areaY, areaW, areaH) => {
  return x > areaX && y > areaY && x < areaX + areaW && y < areaY + areaH;
};

/** Paint the DRAWING matrix in the given coords with the given pixel size. */
const paintImage = (left, top, pixelSide) => {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      if (x < rectangleStartX || x > rectangleEndX || y < rectangleStartY ||
          y > rectangleEndY) {
        setFillStyle(CGA_PALETTE[getPixel(x, y)]);
      } else {
        setFillStyle(CGA_PALETTE[currentColor]);
      }
      canvasFillRect(
          left + x * pixelSide, top + y * pixelSide, pixelSide, pixelSide);
    }
  }
};

/**
 * Paints the whole app state.
 */
const paint = () => {
  setFillStyle('#333');
  canvasFillRect(0, 0, getCanvas().width, getCanvas().height);

  paintImage(DRAWABLE_AREA_X, DRAWABLE_AREA_Y, PIXEL_SIDE);
  paintImage(PREVIEW_IMAGE_X, DRAWABLE_AREA_Y, PREVIEW_PIXEL_SIDE);
  setLineWidth(1);
  setStrokeStyle('#333');
  for (let i = 0; i < 32; i++) {
    // DRY doesn't apply when your code runs through jscrush ;)
    canvasStrokeRect(
        DRAWABLE_AREA_X, DRAWABLE_AREA_Y + i * PIXEL_SIDE, 32 * PIXEL_SIDE,
        PIXEL_SIDE);
    canvasStrokeRect(
        DRAWABLE_AREA_X + i * PIXEL_SIDE, DRAWABLE_AREA_Y, PIXEL_SIDE,
        32 * PIXEL_SIDE);
  }

  // Palette
  setLineWidth(3);
  for (let i = 0; i < PALETTE_LENGTH; i++) {
    setFillStyle(CGA_PALETTE[i]);
    canvasFillRect(PALETTE_X, PALETTE_Y + i * 32, 32, 32);
  }
  setStrokeStyle(CGA_PALETTE[15]);
  canvasStrokeRect(PALETTE_X, PALETTE_Y + currentColor * 32, 32, 32);

  // Toolbar
  setFont('32px arial');
  const icons = '✑◍▭↶↷';
  const colors = [
    // Absolutely hacky arithmetic. Means if mode is 0, then 15, otherwise 14
    mode == 0 | 14,
    mode == 1 | 14,
    mode == 2 | 14,
    UNDO_STACK[0] ? 14 : 1,
    REDO_STACK[0] ? 14 : 1,
  ];
  for (let i = 0; i < 5; i++) {
    setFillStyle(CGA_PALETTE[colors[i]]);
    canvasFillText(icons[i], TOOLBOX_X + 32 * i, TOOLBOX_Y + 24);
  }
};
// Trigger the first paint right away.
paint();

// Inlined
function getPixel(xx, yy) {
  return DRAWING[yy * 32 + xx];
}

// Inlined
function putPixel(xx, yy) {
  DRAWING[yy * 32 + xx] = currentColor;
}

/**
 * Fills starting at the given coordinate with the given color.
 * The recursive algorithm compresses better than an iterative one.
 */
const floodFill = (x, y) => {
  const oldColor = getPixel(x, y);
  if (currentColor == oldColor) return;
  const rec = (x, y) => {
    // Instead of checking for bounds for Y, we use the fact that out of bounds
    // it's undefined.
    if (x >= 0 && x < 32 && getPixel(x, y) == oldColor) {
      putPixel(x, y);
      rec(x + 1, y);
      rec(x - 1, y);
      rec(x, y + 1);
      rec(x, y - 1);
    }
  };
  rec(x, y);
};

const paintFilledRect = () => {
  for (let y = rectangleStartY; y <= rectangleEndY; y++) {
    for (let x = rectangleStartX; x <= rectangleEndX; x++) {
      // Guard against tool being off. By having this if next to the putPixel
      // call, closure is able to replace it with &&.
      if (x < 32) {
        putPixel(x, y);
      }
    }
  }
};

// This is horrible, but not using window.onevent shaves a few bytes.
onmousedown = e => {
  const x = e.x;
  const y = e.y;
  // HACK: This signals that we are not drawing a rectangle.
  rectangleStartX = 32;
  const xx = (x - DRAWABLE_AREA_X) >> PIXEL_SIDE_POW2;
  const yy = (y - DRAWABLE_AREA_Y) >> PIXEL_SIDE_POW2;
  // Compacts better than checking xx and yy.
  if (contained(
          x, y, DRAWABLE_AREA_X, DRAWABLE_AREA_Y, DRAWABLE_AREA_W,
          DRAWABLE_AREA_H)) {
    // Save undo step
    UNDO_STACK.push([...DRAWING]);
    REDO_STACK = [];
    if (mode == MODE_PAINT) {
      painting = 1;
      putPixel(xx, yy);
    } else if (mode == MODE_FILL) {
      floodFill(xx, yy);
    } else {
      rectangleStartX = xx;
      rectangleStartY = yy;
    }
  } else if (
      x < PALETTE_X + PALETTE_W && y > PALETTE_Y &&
      y < PALETTE_Y + PALETTE_H) {  // No need to check for Left
    currentColor = yy >> 1;
  } else if (
      x > TOOLBOX_X && y > TOOLBOX_Y &&
      y < TOOLBOX_Y + TOOLBOX_H) {  // No need to check Right
    let tmpMode = (x - TOOLBOX_X) >> 5;
    if (tmpMode < 3) {
      mode = tmpMode;
    } else if (tmpMode == 3 && UNDO_STACK[0]) {
      REDO_STACK.push(DRAWING);
      DRAWING = UNDO_STACK.pop();
    } else if (tmpMode == 4 && REDO_STACK[0]) {
      UNDO_STACK.push(DRAWING);
      DRAWING = REDO_STACK.pop();
    }
  }
  paint();
};

onmouseup = () => {
  painting = 0;
  paintFilledRect();
  rectangleStartX = 32;
};

onmousemove = e => {
  const x = e.x;
  const y = e.y;
  const xx = (x - DRAWABLE_AREA_X) >> PIXEL_SIDE_POW2;
  const yy = (y - DRAWABLE_AREA_Y) >> PIXEL_SIDE_POW2;
  // Compacts better than checking xx and yy.
  if (contained(
          x, y, DRAWABLE_AREA_X, DRAWABLE_AREA_Y, DRAWABLE_AREA_W,
          DRAWABLE_AREA_H)) {
    painting && putPixel(xx, yy);
  }
  rectangleEndX = xx;
  rectangleEndY = yy;
  paint();
};

onkeydown = e => {
  const m = e.key - 1;
  if (m < 0) {
    currentColor = (currentColor + 1) % PALETTE_LENGTH;
  } else {
    mode = (m & 3) % 3;  // Limit to 0..2
  }
  paint();
};
