"use strict";
// Alias the Matter.js modules. You can think of this like `using` statements in
// C++. This just lets us avoid using `Matter.ModuleName` everywhere
const Engine          = Matter.Engine;
const Render          = Matter.Render;
const Runner          = Matter.Runner;
const Bodies          = Matter.Bodies;
const Composite       = Matter.Composite;
const Events          = Matter.Events;
const Collision       = Matter.Collision;
const MouseConstraint = Matter.MouseConstraint;

/*******************************************************************************
        Init constants
*******************************************************************************/
const WIDTH  = 900;
const HEIGHT = 1000;

/*******************************************************************************
        Init global vars
*******************************************************************************/
let diskIsActive = false;
let score = 0;
let hoverDisk;
let remainingDisks = 5;

/*******************************************************************************
        Engine Setup
*******************************************************************************/
// create an engine
const engine = Engine.create();

// create a renderer
const render = Render.create({
    element: document.getElementById("game"),
    engine: engine,
    options: {
      width: WIDTH,
      height: HEIGHT,
      wireframes: false
    }
});


/*******************************************************************************
        Draw the Board
*******************************************************************************/

/*******************************************************************************
        Start it
*******************************************************************************/
const runner = Runner.create();
Runner.start(runner, engine);
Render.run(render);


/*******************************************************************************
        Events
*******************************************************************************/


/*******************************************************************************
        Utils
*******************************************************************************/
function addText (text, width, fontSize, center=false) {
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = fontSize; 

    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#fff";
    ctx.font = `${fontSize}pt sans-serif`;
    
    let x = 0;

    if (center) {
        const textWidth = ctx.measureText(text).width;
        x = width/2 - textWidth/2;
    }

    ctx.fillText(text, x, fontSize);

    return canvas.toDataURL("image/png");
};

function toRadians (degrees) {
    return degrees * Math.PI / 180;
}

// https://stackoverflow.com/a/2450976
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}
