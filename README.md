# plinko-matterjs

You can access demos for each step at https://redwolves.dev/plinko/1

## Environment File

Example `.env`:
```
PORT=8000
DB="plinko.db"
```

Open `package.json` and change the port number used in the `start-dev` script to match the port number you set in your `.env` file. I defaulted it to `8000`.

`"start-dev": "nodemon app.js & browser-sync start --proxy 'localhost:8000' --files 'public'"`

I've added `browser-sync` to this project. If you recall from class that `nodemon` will automatically restart your server when you edit your code. Well, `browser-sync` will reload the browser too when save edits to your code. This will save you from having to remember to refresh every time you want to test something.

I've included starter code and you'll only be editing `plinko.js`.

## Final directory structure
```
.
├── README.md
├── app.js
├── package.json
└── public
    ├── css
    │   └── plinko-style.css
    ├── index.html
    └── js
        ├── matter.min.js
        └── plinko.js
```


## Step 1: Spawning the disk

First let's just spawn a disk at the top of the game. Matter.js has a `Bodies.circle` function that will create a circle. It takes four parameters:

- the `x` coordinate
- the `y` coordinate
- the radius
- a configuration object
  
We'll be setting two options in the config object. Set `isStatic` to `false`. This will apply physics to the disk (gravity/fraction/collisions/etc). Set `restitution` to `0.8` this is how "bouncy" the circle will be when it collides with other objects. 

Use the following code:
```js
// In "Draw the Board"
let disk = Bodies.circle(100, 50, DISK_RADIUS, { isStatic: false, restitution: 0.8 });

// In "Start It"
Composite.add(engine.world, [disk]);
```

The `Composite.add()` function allows you to dynamically add bodies to the game world.

Now you can test your code and make sure it runs like the demo.


## Step 2: Spawning on click

We want the player to be able to spawn the disk by clicking on the screen. We can implement this functionality by using Matter.js `MouseConstraint` class. Use the code below.

```js
let disk; // we don't spawn the disk until the user clicks

// Allow mouse controls
const mouseConstraint = MouseConstraint.create(engine, {element: document.querySelector("canvas")});
mouseConstraint.collisionFilter.mask = 0; // prevent dragging elements
```

Remove this line of code:
```js
Composite.add(engine.world, [disk]);
```


Now you can handle the mouse click events:

```js
/*******************************************************************************
        Events
*******************************************************************************/
Events.on(mouseConstraint, "mousedown", handleMouse);
```

Now we can implement the logic in the `handleMouse` function. The `event` object contains information on the event type and data from the mouse click. We will need this data for this feature.

Complete the following code:
```js
function handleMouse (event) {
    let {x, y} = event.mouse.position;

    if (event.name == "mousedown") {
        disk = /* spawn the circle at x, y */;
        Composite.add(engine.world, disk);
    }
}
```

## Step 3: One at a Time
Currently, we can spawn an unlimited amount of disks; however, this game should only allow the user to spawn one disk at a time. We can fix this by adding a boolean flag so we only spawn disks when there is not an active disk.

1. Create a global variable named `diskIsActive` and set it to `false`.

2. Then in the `handleMouse` function add a [guard clause](https://wiki.c2.com/?GuardClause). If a disk is active then immediately `return` from the function.

3. Finally, in the `handleMouse` function after you spawn the disk set the `diskIsActive` flag to `true`.

Test your code. You should notice that you can only create one disk even after it falls past the screen! It's because the code never sets `diskIsActive` back to `false` so we can't spawn another one. That's actually what we want for now. Once we implement the scoring zones we'll be able to "de-spawn" the disk and set the flag to `false`. So for now just get used to spawning only one disk.

## Step 4: From the Top

Now the disk is spawning exactly where we click; however, this would defeat the point of the game since the disk should slide in from the top of the board. We should only use the mouse's `x` coordinate and hardcode the `y` coordinate so that the disk always spawns from the top of the board.

Update the `handleMouse` function so that it only uses the mouse's `x` coordinate. Then hardcode `y` to `50`.

## Step 5: Displaying disk outline on hover

Now let's add an outline of where the disk will spawn when the user hovers over the game board. So they know exactly where it will spawn.

Create a global variable `let hoverDisk;`. This will default to undefined since we don't want to create the disk outline until the user hovers their mouse.

Then add this line to your code so it can handle mouse movement".
```js
Events.on(mouseConstraint, 'mousemove', handleMouse);
```

Now update `handleMouse`:

```
if the disk is active
    return

if the hoverDisk is not undefined
    remove the hoverDisk
    set it to undefined

get x cooridinate of mouse click
set y to 50

if event.name is "mousemove"
    create the hoverDisk but set isStatic to `true` and don't use restitution
    add it to the engine
else if event.name is "mousedown"
    create the normal disk
    add it to the engine
    set diskIsActive to `true`
```

You can remove a body with with `Composite.remove(engine.world, hoverDisk);`

## Step 6: Drawing the pegs

This game board will have five rows with eight pegs on each row. We'll need some constants to help calculate the `(x, y)` coordinates for each peg.

You'll need to calculate `playAreaWidth` and `leftPadding`. First, I'll explain the other constants.

```js
/*******************************************************************************
        Init constants
*******************************************************************************/
const WIDTH  = 900;
const HEIGHT = 1000;

const DISK_RADIUS = 35;
const PEG_RADIUS  = 10;
const NUM_PEGS    = 8;

const rowOffset    = 110;
const columnOffset = 100;

const topPadding = 125;

const playAreaWidth = /* */;
const leftPadding = /* */;
```

`PEG_RADIUS` is just the size of the pegs.
`NUM_PEGS` is the number of pegs in each row you'll need this for calculating `playAreaWidth`.

`rowOffset` is the space between each row.
`columnOffset` is the space between each peg in the same row.

`topPadding` is just to add some padding to the top row so there's room for the score and to spawn the disk.


### Calculating `playAreaWidth`

This is what the game board would look like without adding any special padding on the x-axis. There's no space on the left and a large amount of space on the right. However, the goal is to center the play area so there is equal space on the left and right side.

This image also contains a visual representation of some of the measurements we are using.

![./public/media/images/plinko-instructions/width.png](./public/media/images/plinko-instructions/width.png)

So we need to figure out how much padding to add on the left side of the play area. This calculation is simple enough. Just put half of the unused space on the left. But how many pixels are "unused"? Well that's just `WIDTH - playAreaWidth` and we know the `WIDTH` (`1000`) since it's a hardcoded constant. But we need to calculate the `playAreaWidth`.

So how wide is the play area and what do we need to know to calculate it? You'll need `columnOffset`, `PEG_RADIUS` and `NUM_PEGS`. Then `columnOffset` times the number of spaces between pegs in a row plus the `PEG_RADIUS` times the number of pegs and finally add the `PEG_RADIUS` again.

Why the last `PEG_RADIUS`? This accounts for the pegs at the start and end and gives us a little overhead.

`console.log()` your `playAreaWidth`, it should be `790`.

### Calculating `leftPadding`

Now that you know the playAreaWidth you can calculate `leftPadding`. Simply subtract the `playAreaWidth` from the `WIDTH` and divide by `2`.

You'll notice that `leftPadding` in this picture still seems smaller than the right side. That's because we preemptively took into account the stagger from the next step.

![./public/media/images/plinko-instructions/leftPadding.png](./public/media/images/plinko-instructions/leftPadding.png)


`console.log()` your `leftPadding`, it should be `55`.

### Actually drawing the pegs

Now that you have the correct constants defined you can draw the pegs. Add the following function to your code.

You will need to calculate the `yOffset` and `xOffset`.

Add this function to the `Utils` section of your code.
```js
function drawPegs () {
    // For each row
    for (let i = 0; i < 5; i++) {
        const yOffset = /* */;

        // Make 8 pegs
        for (let j = 0; j < NUM_PEGS; j++) {
            let xOffset = /* */;

            const peg = Bodies.circle(xOffset, yOffset, PEG_RADIUS, { 
                isStatic: true, 
                render: {
                    fillStyle: '#eb4034'
                } 
            });

            Composite.add(engine.world, peg);
        }
    }
}
```

### `yOffset`

The `yOffset` is the sum of the `topPadding`, `rowOffset` time the current row and the `PEG_RADIUS` since we need to account for drawing from the center of the circle.


### `xOffset`

The `xOffset` is the sum of the `leftpadding`, `PEG_RADIUS` (for the same reason above) and `columnOffset` times the current peg number.

Finally, call the `drawPegs()` function in the `Draw the Board` section of your code. Make sure your game board looks like the one in the demo for step 6.

## Step 7: Staggering the rows

The game board in step 6 is pretty terrible. The disk just falls straight through. We need to stagger alternating rows. We can do this easy by modifying `xOffset`.

Update `drawPegs()` so that even numbered rows have an extra `50` pixels added to the `xOffset`. don't add any extra pixels to the odd numbered rows.

Make sure your game board looks like the one in the demo for step 7.

## Step 8: Drawing the Walls

So the game has more variability but the disk can bounce out of the play area. We need to add walls to game world. I've included the code for the left wall below but you will need to calculate the x-coordinate for the right wall. Don't forget to take into account that Matter.js starts drawing from the center. 

`Bodies.rectangle()` takes 5 parameters:
1. x-coordinate
2. y-coordinate
3. width
4. height
5. options object

Add this code to the `Draw The Board` section of your code.

```js
const wallWidth = leftPadding;
const leftWall  = Bodies.rectangle(wallWidth/2, HEIGHT/2, wallWidth, HEIGHT, { isStatic: true, render: {fillStyle: "#000000"}  });
const rightWall = Bodies.rectangle(/* calculate the x */, HEIGHT/2, wallWidth, HEIGHT, { isStatic: true, render: {fillStyle: "#000000"}  });

Composite.add(engine.world, [leftWall, rightWall]); // Add the walls to the game world
```


Make sure your game board looks like the one in the demo for step 8.

## Step 9: Fixing the Disk Spawning and Hover Outline

The walls introduced a bug. We an spawn disks inside of the walls and the hover effect is inside of the walls too.

![./public/media/images/plinko-instructions/brokenHover.png](./public/media/images/plinko-instructions/brokenHover.png)

Update the `handleMouse()` function. You'll need to implement bounds for the `x` variable. You can do this easily by using the built-in `Math.min()` and `Math.max()` functions.

The x-coordinate should not be less than the left wall. The x-coordinate should not be greater than the right wall. Don't forget to take the `DISK_RADIUS` into account. 

<details>
  <summary>HINT</summary>
  
  You'll need to use `wallWidth`, `playAreaWidth` and `PEG_RADIUS`.
  
</details>

- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max
  
  
Make sure your game behaves like the demo for step 9.

## Step 10: Drawing the slopes

There's still a pretty big problem with this layout. There are three places where the disk can get stuck. We'll add some slopes to the board so the disk can bounce out of these areas.

![./public/media/images/plinko-instructions/stuck.png](./public/media/images/plinko-instructions/stuck.png)

You'll need to use radians to set the angle of the slopes. You can implement it yourself or just copy this function. Add this function to the `Utils` section of your code.

```js
function toRadians (degrees) {
    return degrees * Math.PI / 180;
}
```

Now you can draw the slopes. I've included code for the slope at the top left. 

`Bodies.rectangle()` takes 5 parameters:
1. x-coordinate
2. y-coordinate
3. width
4. height
5. options object

```js
const slopeLength = rowOffset;
const slopeThickness = 20;

const leftTopSlope = Bodies.rectangle(
    leftPadding,
    topPadding + slopeLength/2 + PEG_RADIUS,
    slopeLength,
    slopeThickness,
    {
        isStatic: true, 
        render: {
            fillStyle: "#000000"
        },
        angle: toRadians(60)
    }
);

// Add it to the game world
Composite.add(engine.world, leftTopSlope);
```

Now you can add the code for slopes in the other two positions shown in the image above. You can check your code against the demo for step 10.

## Step 11: Drawing the score zones

## Step 12: Detecting Collisions

## Step 13: Keeping Score

## Step 14: Randomizing the score zones

## Step 15: Limiting Disks

## Step 16: Resetting the Game