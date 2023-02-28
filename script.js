const POINT_X_RANGE = 60,
POINT_Y_RANGE = 30;

const points = [
{ x: 50, y: 450 },
{ x: 60, y: 80 },
{ x: 210, y: 210 },
{ x: 380, y: 130 },
{ x: 550, y: 20 },
{ x: 720, y: 160 },
{ x: 750, y: 470 },
{ x: 370, y: 290 }];


// Init
const app = new PIXI.Application({
  width: 800,
  height: 500,
  antialias: true,
  transparent: true });

document.body.appendChild(app.view);

/**
 * Creates a Graphic with a circle drawn
 *
 * @param	r		radius
 * @param x		x position for the Graphic
 * @param y		y position for the Graphic
 * @param c		color
 */
const createStageDot = (r, x, y, c) => {
  let dot = new PIXI.Graphics();
  dot.lineStyle(1, c);
  dot.drawCircle(0, 0, r);
  dot.x = x;
  dot.y = y;
  app.stage.addChild(dot);
  return dot;
};

// The graphics for the drawn line
const path = new PIXI.Graphics();
app.stage.addChild(path);

// The graphics for the drawn blob
const blob = new PIXI.Graphics();
app.stage.addChild(blob);

// Populate points with extra data and add dots to stage
points.forEach((p, i) => {
  // origin for calculation purpose
  p.origin = { x: p.x, y: p.y };
  // phase for use in sine and cosine
  p.phase = 0;
  // speed at which phase increases
  p.phaseSpeed = 0.003 + Math.random() * 0.02;
  // phase offset as opposed to 0 (all same phase)
  p.phaseOffset = {
    x: Math.random() * 2 * Math.PI,
    y: Math.random() * 2 * Math.PI };

  // create the point, which will act as control point
  p.dot = createStageDot(6, p.x, p.y, 0xffffff);
  // create the end point (which will also be the starting point for the next)
  p.m2_dot = createStageDot(4, p.x, p.y, 0xffff00);
});

// Tick
app.ticker.add(delta => {
  // Draw base spline
  path.clear();
  path.lineStyle(1, 0xffffff, 0.2);
  points.forEach((p, i) => {
    if (i === 0) {
      path.moveTo(p.x, p.y);
    } else {
      path.lineTo(p.x, p.y);
    }
  });
  path.lineTo(points[0].x, points[0].y);

  // Points loop
  points.forEach((p, i) => {
    p.phase += p.phaseSpeed * delta;
    p.x = p.origin.x + Math.sin(p.phase + p.phaseOffset.x) * POINT_X_RANGE;
    p.y = p.origin.y + Math.cos(p.phase + p.phaseOffset.y) * POINT_Y_RANGE;

    // position dot
    p.dot.x = p.x;
    p.dot.y = p.y;

    // calc p1
    if (i === 0) {
      p.p1 = {
        x: p.x + 0.5 * (points[points.length - 1].x - p.x),
        y: p.y + 0.5 * (points[points.length - 1].y - p.y) };

    } else {
      p.p1 = points[i - 1].p2;
    }

    // calc p2
    let pi = i < points.length - 1 ? i + 1 : 0;
    p.p2 = {
      x: p.x + 0.5 * (points[pi].x - p.x),
      y: p.y + 0.5 * (points[pi].y - p.y) };


    // position start~ and endpoints
    p.m2_dot.x = p.p2.x;
    p.m2_dot.y = p.p2.y;
  });

  // Draw blob
  blob.clear();
  blob.lineStyle(2, 0x009933);
  blob.beginFill(0x009933, 0.2);
  points.forEach((p, i) => {
    if (i === 0) {
      blob.moveTo(p.p1.x, p.p1.y);
      blob.quadraticCurveTo(p.x, p.y, p.p2.x, p.p2.y);
    } else {
      blob.quadraticCurveTo(p.x, p.y, p.p2.x, p.p2.y);
    }
  });
  blob.endFill();
});