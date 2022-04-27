/*

Huge Heart

A game from Harperframe

Idea: concept is about kindness and big hearts
    - Goal: aid NPCs to grow in size; hurt NPCs to shrink in size
    - Use this mechanic to explore the map & discover things

    - Large Hugo - break trees
    - Small Hugo - go through small gaps.

Need to work on
 - Better movement and animation
 - Better collision detection 
 
 - Actual stuff - implement the jam's theme
    - NPCs
    - Heart
    - ui
*/

//kaboom

import kaboom from "kaboom";

//kaboom funcs

function grid(level, p) {

	return {

		id: "grid",
		gridPos: p.clone(),

		setGridPos(...args) {
			const p = vec2(...args);
			this.gridPos = p.clone();
			this.pos = vec2(
				level.offset().x + this.gridPos.x * level.gridWidth(),
				level.offset().y + this.gridPos.y * level.gridHeight()
			);
		},

		moveLeft() {
			this.setGridPos(this.gridPos.add(vec2(-1, 0)));
		},

		moveRight() {
			this.setGridPos(this.gridPos.add(vec2(1, 0)));
		},

		moveUp() {
			this.setGridPos(this.gridPos.add(vec2(0, -1)));
		},

		moveDown() {
			this.setGridPos(this.gridPos.add(vec2(0, 1)));
		},

	};

}

function addLevel(map, opt) {
	if (!opt.width || !opt.height) {
		throw new Error("Must provide level grid width & height.");
	}

	const objs = [];
	const offset = vec2(opt.pos || vec2(0));
	let longRow = 0;

	const level = {
        map: map,

		offset() {
			return offset.clone();
		},

		gridWidth() {
			return opt.width;
		},

		gridHeight() {
			return opt.height;
		},

		getPos(...args) {
			const p = vec2(...args);
			return vec2(
				offset.x + p.x * opt.width,
				offset.y + p.y * opt.height
			);
		},

		spawn(sym, ...args) {

			const p = vec2(...args);

			const comps = (() => {
				if (opt[sym]) {
					if (typeof opt[sym] !== "function") {
						throw new Error("level symbol def must be a function returning a component list");
					}
					return opt[sym](p);
				} else if (opt.any) {
					return opt.any(sym, p);
				}
			})();

			if (!comps) {
				return;
			}

			const posComp = vec2(
				offset.x + p.x * opt.width,
				offset.y + p.y * opt.height
			);

			for (const comp of comps) {
				if (comp.id === "pos") {
					posComp.x += comp.pos.x;
					posComp.y += comp.pos.y;
					break;
				}
			}

			comps.push(pos(posComp));
			comps.push(grid(this, p));

			const obj = add(comps);

			objs.push(obj);

			return obj;

		},

        replPos(vec, newTile) {
            this.map[vec.y][vec.x] = newTile;
        },

		width() {
			return longRow * opt.width;
		},

		height() {
			return map.length * opt.height;
		},

		destroy() {
			for (const obj of objs) {
				destroy(obj);
			}
		},

	};

	level.map.forEach((row, i) => {

		const syms = row;

		longRow = Math.max(syms.length, longRow);

		syms.forEach((sym, j) => {
			level.spawn(sym, vec2(j, i));
		});

	});

	return level;

}

// initialize context
kaboom({
    width: 450,
    height: 450,
});

// load logo
loadSprite("hugoLogo", "sprites/hugo logo.png");

// load assets
loadPedit("hugo", "sprites/hugo.pedit");
loadPedit("npc", "sprites/npc.pedit"); //npc
 
// load tiles
loadPedit("grass", "sprites/grass.pedit");
loadPedit("water", "sprites/water.pedit");
loadPedit("treebase", "sprites/treebase.pedit");
loadPedit("interaction", "sprites/interaction.pedit");
loadPedit("bridge", "sprites/bridge.pedit");	 

//load props
loadPedit("tree leaves", "sprites/tree leaves.pedit");
loadPedit("tree trunk", "sprites/tree trunk.pedit");
loadPedit("sign", "sprites/sign.pedit");
loadPedit("rock", "sprites/rock.pedit");
loadPedit("heart", "sprites/heart.pedit");
loadPedit("light", "sprites/light.pedit");

//load dialogbox
loadSprite("dialogbox", "sprites/dialogbox.png");

//load music
loadSound("maintheme", "sounds/Hugo - Main Theme.wav");
loadSound("slowdoze", "sounds/Hugo - Slow Doze.wav");
loadSound("walkinthepark", "sounds/Hugo - Walk in the Park.wav");
loadSound("drumdreams", "sounds/Hugo - Drum Dreams.wav");

var tileTypes = {
    grass: " ",
    water: "#",
    bridge: '-',
    tree: "$",
    rock: "&",
    spawn: "S",
    end: "e",
    interactables: [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
    ]
};

//helper function to calculate worldY
function calculateWorldY(screenY) {
    return Math.round(screenY/30);
}

//helper function to calculate worldX
function calculateWorldX(screenX) {
    return Math.round(screenX/50);
}

//create level
function createLevel(levelMap) {
    layers([
        "background", //background
        "ground", //ground tiles
        "world", //main layer w/ player, npcs, props etc.
        "overlay", //black overlay
        "ui", //ui elements        
    ])

    var background = add([
        "background",
        layer("background"),
        origin("topleft"),

        rect(450, 450),
        color(133, 241, 255),
    ]);

    var overlay = add([
        "overlay",
        layer("overlay"),
        origin("topleft"),

        rect(450, 450),
        color(0, 0, 0),
        opacity(0)
    ]);

    var level = addLevel(levelMap, {
        // block sizes
        width: 50,
        height: 30,
        // starting pos
        pos: vec2(0, 30),
        //symbol to object
        " ": (p) => [
            "tile",
            "grass",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "#": (p) => [
            "tile",
            "water",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("water"),
        ],
        "-": (p) => [
            "tile",
            "bridge",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("bridge"),
        ],
        "$": (p) => [
            "tile",
            "treebase",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("treebase"),
        ],
        "&": (p) => [
            "tile",
            "rockbase",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "S": (p) => [
            "tile",
            "spawn",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "e": (p) => [
            "tile",
            "exit",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),            
        ],
        "0": (p) => [
            "tile",
            "0",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "1": (p) => [
            "tile",
            "1",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "2": (p) => [
            "tile",
            "2",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "3": (p) => [
            "tile",
            "3",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "4": (p) => [
            "tile",
            "4",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "5": (p) => [
            "tile",
            "5",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "6": (p) => [
            "tile",
            "6",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "7": (p) => [
            "tile",
            "7",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "8": (p) => [
            "tile",
            "8",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
        "9": (p) => [
            "tile",
            "9",
            "interaction",
            `${p.x}-${p.y}`,
            layer("ground"),
            sprite("grass"),
        ],
    });

    //create a tree prop at every tree base
    every("treebase", (treeBase) => {
        worldYPosCal = calculateWorldY(treeBase.pos.y); //calculate worldY
        treeBase.leaves = add([
            "treeleaves",
            layer("world"),
            origin("left"),
            z(worldYPosCal + 1),

            sprite("tree leaves"),
            pos(treeBase.pos),
        ]);
        treeBase.trunk = add([
            "treetrunk",
            layer("world"),
            origin("left"),
            z(worldYPosCal - 1),

            sprite("tree trunk"),
            pos(treeBase.pos),
        ]);
        treeBase.leaves.parent = treeBase;
        treeBase.trunk.parent = treeBase;
    });

//create a tree prop at every tree base
    every("rockbase", (rockBase) => {
        worldYPosCal = calculateWorldY(rockBase.pos.y); //calculate worldY
        rockBase.rock = add([
            "rock",
            layer("world"),
            origin("left"),
            z(worldYPosCal + 1),

            sprite("rock"),
            pos(rockBase.pos),
        ]);
        rockBase.rock.parent = rockBase;
    });

    
    //create heart at every rock base
    var exitBlock = get("exit")[0];
    exitBlock.heart = add([
            "exitheart",
            layer("overlay"),
            origin("center"),

            scale(1),
            opacity(1),

            sprite("heart"),

            pos(exitBlock.pos.x+25, exitBlock.pos.y),
    ]);

    exitBlock.heart.inAnim = 0;

    exitBlock.heart.action(async function() {
        if (exitBlock.heart.inAnim == 0) {        
            exitBlock.heart.inAnim = 1;

            for (var i = 0; i < 10 / 2; i++) {
                await wait(0.1, () => {exitBlock.heart.moveBy(vec2(0, 1).scale(2))});
            };
            for (var i = 0; i < 10 / 2; i++) {
                await wait(0.1, () => {exitBlock.heart.moveBy(vec2(0, -1).scale(2))});
            };
            
            exitBlock.heart.inAnim = 0;
        };    
    });

    action("treeleaves", (treeLeaves) => {if (!treeLeaves.parent.exists()) treeLeaves.destroy()});

    action("treetrunk", (treeTrunk) => {if (!treeTrunk.parent.exists()) {treeTrunk.destroy()}});


    return level;
}

/*
     
Hugo Character
     
*/

/*
Move function solves:
    - X & Y boundaries
    - Prevent illegal movement on tiles
    - Waits for animation
    - Updates In-World Pos in real-time
    - Efficent
*/

//hugo moving animation
var movementSpeed = 5; 
async function smoothMove(hugo, vecMov, movement) {
    hugo.flags.inAnimation = 1; //set animation flag
    //begin movement animation
    for (var i = 0; i < movement / movementSpeed; i++) {
        await wait(0.0005, () => { hugo.moveBy(vecMov.scale(movementSpeed)) });
    };
    hugo.flags.inAnimation = 0; //reset animation flag
};

async function move(hugo, vecMov, level) { //base movement function
        //cancel if animation is already occuring
        //user must wait for the animation to end

        if (hugo.flags.inAnimation != 0 || hugo.flags.lockControls == true) {
            return;
        };

        var newWorldX = hugo.worldX + vecMov.x;
        var newWorldY = hugo.worldY + vecMov.y;

        //check out of bounds

        if (newWorldX > -1 && newWorldX < 15 && newWorldY > -1 && newWorldY < 15 ) {
            var newTile = level.map[newWorldY][newWorldX];
        } else {
            return
        }

        //movement by X, a/d keys
        if (vecMov.x != 0 && hugoAcceptedTiles.includes(newTile)) {
            var distance = 50;
            hugo.worldX = newWorldX;

        //movement by Y, w/s keys
        } else if (vecMov.y != 0 && hugoAcceptedTiles.includes(newTile)) {      
            var distance = 30;
            hugo.worldY = newWorldY;
            hugo.z += vecMov.y;
    
        }

        //apply scaleModes functions
        if (hugo.flags.scaleMode == 3 && newTile == tileTypes.tree) {
            var tileObj = get(`${newWorldX}-${newWorldY}`)[0];

            var newObjPos = tileObj.pos;

            level.replPos(vec2(newWorldX, newWorldY), " ");
            tileObj.destroy();

            var newObj = add([
                "tile",
                "grass",
                `${newObjPos.x}-${newObjPos.y}`,
                layer("ground"),
                sprite("grass"),

                pos(newObjPos),
            ]);
            
        }

        smoothMove(hugo, vecMov, distance);
}

//autoset keys
var keyMap = {
        "a": LEFT,
        "s": DOWN,
        "d": RIGHT,
        "w": UP,
}


//hugo allowed tiles to walk on
hugoAcceptedTiles = [
    tileTypes.grass,
    tileTypes.spawn,
    tileTypes.bridge,
    tileTypes.end,
];

/*
Point of hugo() function

Since I am moving to scenes, i need to be able to reiniate hugo multiple times.
To do this, I move all hugo dependent code into one function
In order to more effectively cleanup hugo everytime when moving to another level, I have
connected all variables essential to hugo connected to the object 
*/
function hugo(hugoSpawn, level) {
    //build hugo character
    var hugo = add([ //hugo spawn component
        "hugo",

        // list of components
        sprite("hugo"),

        origin("botleft"),
        z(calculateWorldY(hugoSpawn.y)),
        area({ width: 30, height: 30 }),

        pos(hugoSpawn.x, hugoSpawn.y + 30),

        scale(1),

        layer("world"),
    ]);

    hugo.worldX = calculateWorldX(hugoSpawn.x);
    hugo.worldY = calculateWorldY(hugoSpawn.y) - 1;

    //basic flags such as animations
    hugo.flags = {
        inAnimation: 0,
        interactable: false,
        lockControls: false,
        dialog: false,
        scaleMode: 2,
    };

    //hugo controls
    for (const [key, movement] of Object.entries(keyMap)) {
        keyPress(key, () => { if (!hugo.flags.lockControls) {move(hugo, movement, level)} })
    }

    // hugo interactable detection
    hugo.action(() => {
        //get hugo's surroundings
        hugo.surroundings = [
            vec2(hugo.worldX + 1, hugo.worldY),
            vec2(hugo.worldX - 1, hugo.worldY),
            vec2(hugo.worldX, hugo.worldY + 1),
            vec2(hugo.worldX, hugo.worldY - 1),
        ];

        //check if each surrounding is an interactable 
        for (index in hugo.surroundings) {
            var surrounding = hugo.surroundings[index];

            //check for bounds
            if (surrounding.y > 0 && surrounding.x > 0 && surrounding.y < 13 && surrounding.x < 9) {
                var surroundingTile = level.map[surrounding.y][surrounding.x];

                //check if tile is an interactable
                if (tileTypes.interactables.includes(surroundingTile)) {
                    hugo.flags.interactable = surroundingTile; //set interactable flag
                    return //return
                };
            };
        };

        hugo.flags.interactable = false; //if no interactables, set to false
    });

    //hugo become HUGEO
    //hugo become SHRINKO
    //
    hugo.grow = function(size) {
        if (size == 1 && !(hugo.flags.scaleMode == 1)) {
            hugo.moveBy(-13, 0);
            hugo.scaleTo(0.75);
            if (hugo.flags.scaleMode == 3) hugo.z -= 1;
        } else if (size == 2 && !(hugo.flags.scaleMode == 2)) {
            hugo.moveBy(13, 0);
            hugo.scaleTo(1);
            if (hugo.flags.scaleMode == 3) hugo.z -= 1;
        } else if (size == 3 && !(hugo.flags.scaleMode == 3)) { 
            hugo.moveBy(-13, 0);
            hugo.scaleTo(1.5);
            hugo.z += 1;
        } else {
            return
        };

        hugo.flags.scaleMode = size;
    };

    //dialog box
    hugo.dialogBox = add([
        layer("ui"),
        sprite("dialogbox"),

        opacity(1),

        origin("botleft"),
        pos(0, 450)
    ])

    hugo.dialogBox.dialogText = add([
        layer("ui"),
        text("a"),

        opacity(hugo.dialogBox.opacity),

        origin("botleft"),
        pos(25, 425),
        scale(0.25),
    ]);

    hugo.dialogBox.action(() => {
        if (hugo.pos.y > 400) {
            hugo.dialogBox.pos.y = 75;
            hugo.dialogBox.dialogText.pos.y = 50;
        } else if (hugo.pos.y < 100) {
            hugo.dialogBox.pos.y = 450;
            hugo.dialogBox.dialogText.pos.y = 425;
        };
    });

    //notifier

    hugo.action((obj) => {
        if (!(hugo.flags.interactable === false) && !(hugo.flags.dialog)) {
            obj.dialogBox.opacity = 1;
            obj.dialogBox.dialogText.text = "Press SPACE to interact.";
        } else if (hugo.flags.dialog) {
            obj.dialogBox.opacity = 1;
        } else {
            obj.dialogBox.opacity = 0;
            obj.dialogBox.dialogText.text = "";
        };
    });

    return hugo;
}

//dialog management

dialogQueue = [];

function startDialog(hugo) {
    hugo.flags.lockControls = true;
    hugo.flags.dialog = true;
    hugo.dialogBox.opacity = 1;
}

function runDialog(hugo, levelFlags, nextDialog) {
        console.log(nextDialog);

        //text dialog
        if (nextDialog.type == "text") { 
            hugo.dialogBox.dialogText.text = nextDialog.data + "(Q)";
        
        //check flag and make decision
        } else if (nextDialog.type == "check") { 
            if (Boolean(nextDialog.condition) == true) {
                runDialog(hugo, levelFlags, nextDialog.yes);
            } else {
                runDialog(hugo, levelFlags, nextDialog.no);
            }
        
        //toggle flag (should be used with and)
        } else if (nextDialog.type == "toggle") { 
            levelFlags[nextDialog.flags] = !(levelFlags[nextDialog.flags]);
        //for special cases - may need changing
        } else if (nextDialog.type == "insert") { 
            dialogQueue.splice(0, dialogQueue.length);
            dialogQueue.push(nextDialog.data);
        //for special cases - such as grow and shrink
        } else if (nextDialog.type == "exec") {
            if ((nextDialog.args !== undefined)) {nextDialog.data(nextDialog.args)}
            else {nextDialog.data()};
        
        //continue dialog (should be used with check)
        } else if (nextDialog.type == "continue") { 
            runDialog(hugo, levelFlags, dialogQueue.shift());
    
        //always use - end dialog (can be used prematurely)
        } else if (nextDialog.type == "end") { 
            dialogQueue.splice(0, dialogQueue.length);
            stopDialog(hugo); 
        };

        if (nextDialog.and != undefined) { //check for "and" data to run multiple dialogs at once
            runDialog(hugo, levelFlags, nextDialog.and)
        };
};

function stopDialog(hugo) {
    hugo.dialogBox.opacity = 0;
    hugo.flags.lockControls = false;
    hugo.flags.dialog = false;
};

//endAnimation

async function endAnimation(audio) {
    var heart = get("exitheart")[0];
    var overlay = get("overlay")[0];

    heart.moveTo(225, 225);

    for (var i = 0; i < 30; i++) {
        await wait(0.05, () => { heart.scaleTo(heart.scale.x + 0.2); overlay.opacity += 1/30; audio.volume(audio.volume() - 1/30) });
    };

    await wait(0.5, () => {});

   for (var i = 0; i < 15; i++) {
        await wait(0.05, () => { heart.opacity += 1/15 });
    };

}

/*
Scenes

Reason for Scenes
    - Best way to organize levels
    - Kaboom-provided
    - Allows for more custom interactions
    - Allows for levels
*/

/*

Starting Scene

*/

scene("start", async function() {

    var audio = play("maintheme", {loop: true});

    audio.volume(0);

    var background = add([
        rect(450, 450),
        pos(0, 0),
        color(0, 0, 0)
    ]);

    var logo = add([
        sprite("hugoLogo"),

        origin("center"),
        pos(225, 225),

        scale(3),
    ]);

    var initText = add([
        "iT1",
        text("to start"),

        origin("center"),
        pos(225, 335),
        scale(0.3),
    ]);

    var initText2 = add([
        "iT2",
        text("hold the left mouse button"),

        origin("center"),
        pos(225, 375),
        scale(0.35),
    ]);

    var hugo = add([
        "hugo",
        sprite("hugo"),

        origin("center"),
        pos(225, 225),
        rotate(0),

        scale(2.5),
    ]);

    var overlay = add([
        rect(450, 450),
        pos(0, 0),
        color(0, 0, 0),
        opacity(0)
    ]);

    var overlayText = add([
        text("By Manitej Boorgu\nThanks for playing (or judging).\nBefore playing, read README.md"),
        opacity(0),

        origin("center"),
        pos(225, 225),

        scale(0.25),
    ]);

    hugo.action(async function() {
        hugo.angle = hugo.pos.angle(mousePos()); 
        hugo.pos = vec2(-mousePos().x+width(), -mousePos().y+height())
        if (mouseIsDown()) {
            hugo.frame = 1; 
            for (var i = 0; i < 20; i++) {
                await wait(0.5/20, () => {hugo.scaleTo(hugo.scale.x + 0.5)});
            };
            await wait(0.05);
            for (var i = 0; i < 20; i++) {
                await wait(0.5/10, () => {overlay.opacity += 1/20; audio.volume(audio.volume() - 1/20);});
            };
            await wait(0.5);
            for (var i = 0; i < 20; i++) {
                await wait(0.5/20, () => {overlayText.opacity += 1/20});
            };
            await wait(4, () => {});
            for (var i = 0; i < 20; i++) {
                await wait(0.5/20, () => {overlayText.opacity -= 1/20});
            };
            await wait(0.5, () => {});
            audio.unloop();
            audio.stop();
            go("level1")
        } 
    });

    for (var i = 0; i < 50; i++) {
        await wait(0.5/10, () => {audio.volume(audio.volume() + 1/50);});
    };

});

/*

Level 1

*/

scene("level1", () => {
    var levelMap = [
        //   0123456789
            "   $$ #  ".split(''), //0
            " S $  ## ".split(''), //1
            "$  $  $# ".split(''), //2
            " $   $##$".split(''), //3
            "$ $   ##$".split(''), //4
            " $    #$ ".split(''), //6
            "$  $  ## ".split(''), //7
            "    $  # ".split(''), //8
            " $    1# ".split(''), //9
            "  $   ##$".split(''), //10
            "$   0##  ".split(''), //11
            "$$$$$### ".split(''), //12
            "      ##$".split(''), //13
            " $    - e".split(''), //14
    ];
    
    level = createLevel(levelMap);

    levelHugo = hugo(get("spawn")[0].pos, level);

    //level (local) flags

    levelFlags = {
        hasHat: false,
        gaveHat: false,
        keyPressQ: false,
        atEnd: false,
    }

    //custom interactions

    var interaction0base = get("0")[0];
    var interaction0 = add([
            "sign",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction0base.pos.y) - 1),

            pos(interaction0base.pos),

            sprite("sign"),
    ]);

    var interaction1base = get("1")[0];
    var interaction1 = add([
            "npc",
            layer("world"),
            z(calculateWorldY(interaction1base.pos.y) - 1),
            origin("left"),
            pos(interaction1base.pos.x, interaction1base.pos.y+8),

            sprite("npc"),
            color(43, 184, 255),
    ]);

    var dialogBox = levelHugo.dialogBox;
    var dialogText = dialogBox.dialogText;

    keyPress("q", () => {
        if (levelHugo.flags.dialog == true) {
            runDialog(levelHugo, levelFlags, dialogQueue.shift());
        };
    })

    function setupDialog(interaction) {
        startDialog(levelHugo);

        if (interaction == 0) {
            dialogQueue.push({type: "text", data:"'The trees give way to kindness.'"});
            dialogQueue.push({type: "check", condition: levelFlags.hasHat, 
                yes: {type: "end"}, 
                no: {type: "continue"},
            })
            
            dialogQueue.push({type: "text", data:"You see a hat on the ground"});
            dialogQueue.push({type: "text", data:"You pick up the hat.", 
                and: {type: "toggle", flags: "hasHat"}
            });
            
            dialogQueue.push({type: "end"});
        } else if (interaction == 1) {
            dialogQueue.push({type: "check", condition: levelFlags.gaveHat,
                yes: {type: "text", data: "Thanks for returning my hat.", 
                        and: {type:"insert", data:{type:"end"}}
                    },
                no: {type: "continue"}
            });

            dialogQueue.push({type: "text", data:"I'm missing my hat."});
            dialogQueue.push({type: "text", data:"Do you know where it is?"});

            dialogQueue.push({type: "check", condition: levelFlags.hasHat,
                yes: {type: "continue"},
                no: {type: "end"},
            });

            dialogQueue.push({type: "text", data:"Wow! You have my hat!"});
            dialogQueue.push({type: "text", data:"I am so thankful for your kindness.",
                and: {type: "toggle", flags: "gaveHat"}
            });
            dialogQueue.push({type: "exec", data:levelHugo.grow, args:3,
                and: {type: "text", data:"You have grown!"}
            })
            dialogQueue.push({type: "text", data:"You can now break trees."})

            dialogQueue.push({type: "end"});
        };

        runDialog(levelHugo, levelFlags, dialogQueue.shift());
    }

    keyPress("space", () => {
        if (levelHugo.flags.interactable === false || levelHugo.flags.lockControls == true) return;

        setupDialog(levelHugo.flags.interactable);
    });

    // setup audio

    var audio = play("slowdoze", {loop: true});

    // end level

    action(async function() {
        if (levelHugo.worldX == 8 && levelHugo.worldY == 13 && !levelFlags.atEnd) { 
            levelFlags.atEnd = true;
            audio.unloop();            
            await endAnimation(audio);
            audio.pause();
            audio.stop();
            go('level2transition');
        }; 
    });
});

/*

Level 2

*/

//Level 2 Transition

scene('level2transition', async function() {
    var overlay = add([
        rect(450, 450),
        pos(0, 0),
        color(0, 0, 0),
    ]);

    var overlayText = add([
        text("H is for happiness\nWe get our happiness\nfrom the ones we love.\nKindness is the way we spread it."),
        opacity(0),

        origin("center"),
        pos(225, 225),

        scale(0.25),
    ]);

    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity += 1/20});
    };
    await wait(4, () => {});
    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity -= 1/20});
    };
    await wait(0.5, () => {});
    go("level2")
})

scene("level2", () => {
    var levelMap = [
        //   0123456789
            "$S $$ #  ".split(''), //0
            "   $ 1## ".split(''), //1
            "$     $# ".split(''), //2
            " $ 0####$".split(''), //3
            "####$  ##".split(''), //4
            "    $  3 ".split(''), //6
            " 2 &$    ".split(''), //7
            "& &$ $   ".split(''), //8
            "$&$ $  4 ".split(''), //9
            "&$ $   $ ".split(''), //10
            "         ".split(''), //11
            "$$$$$$$$ ".split(''), //12
            "$ 5$  $$$".split(''), //13
            " e       ".split(''), //14
    ];
    
    level = createLevel(levelMap);

    levelHugo = hugo(get("spawn")[0].pos, level);

    //level (local) flags

    levelFlags = {
        hasMoney: false,
        gaveMoney: false,
        hasBoots: false,
        treeBroken: false,
        keyPressQ: false,
        needsStone: false,
        hasStone: false,
        gaveStone: false,
        allowEnd: false,
    }

    //custom interactions

    var interaction0base = get("0")[0];
    var interaction0 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction0base.pos.y)),

            pos(interaction0base.pos.x, interaction0base.pos.y+8),

            sprite("npc"),
            color(145, 255, 0)
    ]);

    var interaction1base = get("1")[0];
    var interaction1 = add([
            "rock",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction1base.pos.y)),

            pos(interaction1base.pos),

            sprite("rock"),
    ]);

    var interaction2base = get("2")[0];
    var interaction2 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction2base.pos.y)),

            pos(interaction2base.pos.x, interaction2base.pos.y+8),

            sprite("npc"),
            color(117, 54, 255)
    ]);

    var interaction3base = get("3")[0];
    var interaction3 = add([
            "sign",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction3base.pos.y)),

            pos(interaction3base.pos.x, interaction3base.pos.y),

            sprite("sign"),
    ]);

    var interaction4base = get("4")[0];
    var interaction4 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction4base.pos.y)),

            pos(interaction4base.pos.x, interaction4base.pos.y+8),

            sprite("npc"),
            color(255, 167, 15)
    ]);

    var interaction5base = get("5")[0];
    var interaction5 = add([
            "sign",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction5base.pos.y)),

            pos(interaction5base.pos.x, interaction5base.pos.y),

            sprite("sign"),
            color(255, 167, 15)
    ]);
        
    action((tree) => {
        if (get("4-5")[0] == undefined) {
            levelFlags.treeBroken = true;
        }
    });

    var dialogBox = levelHugo.dialogBox;
    var dialogText = dialogBox.dialogText;

    keyPress("q", () => {
        if (levelHugo.flags.dialog == true) {
            runDialog(levelHugo, levelFlags, dialogQueue.shift());
        };
    })

    function addWaterWalk() {
        hugoAcceptedTiles.push(tileTypes.water);
    }

    function remWaterWalk() {
        hugoAcceptedTiles.splice(hugoAcceptedTiles.indexOf(tileTypes.water), 1);
    }

    function setupDialog(interaction) {
        startDialog(levelHugo);

        if (interaction == 0) {
            dialogQueue.push({type: "check", condition: levelFlags.gaveMoney, 
                yes: {type:"text", data:"Thank you for your purchase.", 
                    and:{type:"insert", data:{type: "end"}}
                },
                no: {type: "continue"}, 
            })    
         
            dialogQueue.push({type: "text", data:"I'll sell you Water-Walking boots"});
            dialogQueue.push({type: "text", data:"It'll cost you 1 gold piece"});
         
            dialogQueue.push({type: "check", condition: levelFlags.hasMoney, 
                yes: {type: "continue"}, 
                no: {type:"text", data:"Come back when you have the money.", 
                    and:{type:"insert", data:{type: "end"}}
                },
            })    
         
            dialogQueue.push({type: "text", data:"You give a gold piece."});
            dialogQueue.push({type: "text", data:"Thank you and have a nice day!", 
                and:{type: "exec", data:addWaterWalk,
                and:{type: "toggle", flags:"gaveMoney",
                and:{type: "toggle", flags:"hasBoots"}
            }}});
    
            dialogQueue.push({type: "end"});

        } else if (interaction == 1) {
            dialogQueue.push({type: "text", data:"This is a rock."});
         
            dialogQueue.push({type: "check", condition: levelFlags.hasMoney, 
                yes: {type:"continue"}, 
                no: {type:"text", data:"You found a gold piece in the rocks!",
                    and:{type: "toggle", flags:"hasMoney",
                    and:{type:"insert", data:{type: "end"}}
                }},
            });

            dialogQueue.push({type: "check", condition: levelFlags.needsStone, 
                yes: {type:"continue"}, 
                no: {type:"text", data:"What are you doing here?",
                    and:{type:"insert", data:{type:"end"}
                }},
            });

            dialogQueue.push({type: "text", data:"You dig up some stone.",
                and:{type:"toggle", flags:"hasStone"}
            });            

            dialogQueue.push({type: "end"});
        } else if (interaction == 2) {
            dialogQueue.push({type: "check", data: levelFlags.allowEnd,
                yes: {type:"text", data:"Woohoo! I'm free!",
                    and:{type:"insert", data:{type: "end"}
                }},
                no: {type: "continue"}
            });

            dialogQueue.push({type: "text", data:"I kinda got stuck here."});
            dialogQueue.push({type: "text", data:"Can I borrow your boots?"});

            dialogQueue.push({type: "check", condition: levelFlags.treeBroken, 
                yes: {type:"continue"},
                no: {type:"text", data:"You realize that you can't give your\nboots or you will be stuck also.",
                and:{type:"insert", data:{type: "end"}
            }}});

            dialogQueue.push({type: "text", data:"Thank you!", 
                and:{type: "exec", data: remWaterWalk,
                and:{type: "toggle", flags: "allowEnd"}
            }});

            dialogQueue.push({type: "end"});

        } else if (interaction == 3) {
            dialogQueue.push({type: "text", data:"Hint: The tree on this row"});
            dialogQueue.push({type: "text", data:"*was that too vague?*"});
            dialogQueue.push({type: "text", data:"*wait its still recording?*"});
            dialogQueue.push({type: "end"});
        } else if (interaction == 4) {
            dialogQueue.push({type: "check", condition: levelFlags.gaveStone,
                yes: {type: "text", data:"Thank you for your kindness.",
                    and: {type:"insert", data:{type:"end"}}
                },
                no:  {type: "continue"}
            });

            dialogQueue.push({type: "text", data:"I want to make a stone necklace."});
            dialogQueue.push({type: "text", data:"Too bad I can't cross the river."});

            dialogQueue.push({type: "check", condition: levelFlags.hasStone, 
                yes: {type:"continue"},
                no: {type: "toggle", flags:"needsStone", and:{type: "end"}}
            });

            dialogQueue.push({type: "text", data:"You got me some stone?"});

            dialogQueue.push({type: "text", data:"Thank you so much!",
                and: {type: "exec", data:levelHugo.grow, args:3}
            });

            dialogQueue.push({type: "text", data:"You grew!", 
                and: {type:"toggle", flags:"gaveStone"}
            });

            dialogQueue.push({type: "end"});

        } else if (interaction == 5) {
            dialogQueue.push({type: "text", data:"Hint: You must give help\nto everyone to get the heart!"});
            dialogQueue.push({type: "end"});
        };

        runDialog(levelHugo, levelFlags, dialogQueue.shift());
    }

    keyPress("space", () => {
        if (levelHugo.flags.interactable === false || levelHugo.flags.lockControls == true) return;

        setupDialog(levelHugo.flags.interactable);
    });

    //audio

    var audio = play("walkinthepark", {loop: true});

    //end location

    action(async function() {
        if (levelHugo.worldX == 1 && levelHugo.worldY == 13 && !levelFlags.atEnd && levelFlags.allowEnd) { 
            levelFlags.atEnd = true;
            audio.unloop();
            await endAnimation(audio);
            audio.pause();            
            audio.stop();
            go('level3transition');
        }; 
    });
});

/*

Level 3

*/

//level 3 transition

scene('level3transition', async function() {
    var overlay = add([
        rect(450, 450),
        pos(0, 0),
        color(0, 0, 0),
    ]);

    var overlayText = add([
        text("U is for ubiquitious\nIt means everywhere\nWe can spread kindness everywhere\nIf we put the effort."),
        opacity(0),

        origin("center"),
        pos(225, 225),

        scale(0.25),
    ]);

    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity += 1/20});
    };
    await wait(4, () => {});
    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity -= 1/20});
    };
    await wait(0.5, () => {});
    go("level3")
})

//level 3

scene("level3", () => {
    var levelMap = [
        //   0123456789
            "$        ".split(''), //0
            "   $   S ".split(''), //1
            "  &###0 #".split(''), //2
            "  ##$####".split(''), //3
            "&--     &".split(''), //4
            "##$    2 ".split(''), //6
            " ## 3    ".split(''), //7
            "$ ###  1 ".split(''), //8
            "$$  ##  $".split(''), //9
            "&4 $&## $".split(''), //10
            "$$$&$####".split(''), //11
            "-##### $$".split(''), //12
            "$$   e$ $".split(''), //13
            "$     &$$".split(''), //14
    ];
    
    level = createLevel(levelMap);

    levelHugo = hugo(get("spawn")[0].pos, level);

    //custom interactions

    var interaction0base = get("0")[0];
    var interaction0 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction0base.pos.y)),

            pos(interaction0base.pos.x, interaction0base.pos.y+8),

            sprite("npc"),
            color(145, 255, 0),
    ]);

    var interaction1base = get("1")[0];
    var interaction1 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction1base.pos.y)),

            pos(interaction1base.pos.x, interaction1base.pos.y+8),

            sprite("npc"),
            color(227, 123, 20),
    ]);

    var interaction2base = get("2")[0];
    var interaction2 = add([
            "breakabletree",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction2base.pos.y) - 1),

            pos(interaction2base.pos.x, interaction2base.pos.y),

            sprite("tree trunk"),
    ]);
    interaction2.leaves = add([
            "int2_treeleaves",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction2base.pos.y)),
            opacity(1),

            pos(interaction2base.pos.x, interaction2base.pos.y),

            sprite("tree leaves"),
    ]);

    var interaction3base = get("3")[0];
    var interaction3 = add([
            "sign",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction3base.pos.y)),

            pos(interaction3base.pos.x, interaction3base.pos.y),

            sprite("sign"),
    ]);

    var interaction4base = get("4")[0];
    var interaction4 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction4base.pos.y)),

            pos(interaction4base.pos.x, interaction4base.pos.y+8),

            sprite("npc"),
            color(59, 255, 124)
    ]);


    var dialogBox = levelHugo.dialogBox;
    var dialogText = dialogBox.dialogText;

    keyPress("q", () => {
        if (levelHugo.flags.dialog == true) {
            runDialog(levelHugo, levelFlags, dialogQueue.shift());
        };
    })

    //bridge replacer
    function bridgeReplacer() {
        var tileObj = get("3-7")[0];

        var newObjPos = tileObj.pos;

        level.replPos(vec2(3, 7), "-");
        tileObj.destroy();

        var newObj = add([
                "tile",
                "bridge",
                `${newObjPos.x}-${newObjPos.y}`,
                layer("ground"),
                sprite("bridge"),

                pos(newObjPos),
        ]);
    }

    //hide tree leaves
    function hideLeaves() {
        interaction2.leaves.opacity = 0;
    }

    //level (local) flags

    levelFlags = {
        keyPressQ: false,
        hasWood: false,
        bridgeBuilt: false,
        wantsBugs: false,
        hasBugs: false,
        gaveBugs: false,
    }

    //manual flag set

    function manualFlagSet(flags) {
        levelFlags[flags] = true;
    }

    function setupDialog(interaction) {
        startDialog(levelHugo);

        if (interaction == 0) {
            dialogQueue.push({type: "check", condition: levelFlags.gaveBugs,
                yes:  {type: "text", data: "Yum! Thanks for the bugs!",
                    and: {type: "insert", data:{type:"end"}}
                },
                no: {type: "continue"},
            });

            dialogQueue.push({type: "check", condition: levelFlags.bridgeBuilt,
                yes: {type: "continue"},
                no:  {type: "text", data: "Hi! How are you today?",
                    and: {type: "insert", data:{type:"end"}}
                },
            });

            dialogQueue.push({type: "check", condition: levelFlags.hasBugs,
                yes: {type: "continue"},
                no:  {type: "text", data: "I'm craving bugs for some reason.",
                    and: {type: "exec", data:manualFlagSet, args:"wantsBugs",
                    and: {type: "insert", data:{type:"end"}
                }}},                
            });

             
            dialogQueue.push({type: "text", data: "Delish!",
                and: {type: "toggle", flags:"gaveBugs"}
            });
            dialogQueue.push({type: "text", data: "*gross, is this a bug?*"});
            dialogQueue.push({type: "text", data:"You grew!",
                and: {type: "exec", data:levelHugo.grow, args:3}
            });            
            dialogQueue.push({type: "text", data: "Thanks for the bugs!"});

            dialogQueue.push({type: "end"});            
        } else if (interaction == 1) {
            dialogQueue.push({type: "check", condition: levelFlags.bridgeBuilt,
                yes: {type: "continue"},
                no:  {type: "text", data: "I can't cross the river\nto the forest!",
                    and: {type: "insert", data:{type:"end"}},
            }});

            dialogQueue.push({type: "text", data:"Thank you for building the bridge!"});            
            dialogQueue.push({type: "end"});            
        } else if (interaction == 2) {
            dialogQueue.push({type: "check", condition: levelFlags.hasWood,
                yes: {type: "text", data: "It's a tree stump",
                    and: {type: "insert", data:{type:"end"}
                }},
                no:  {type: "continue"}
            });

            dialogQueue.push({type: "text", data:"You punch the tree\nlike its Minecraft"});            
            dialogQueue.push({type: "text", data:"*wait is this minecraft? no?*"});            
            dialogQueue.push({type: "text", data:"You now have wood.",
                and: {type: "toggle", flags: "hasWood",
                and: {type: "exec", data: hideLeaves
            }}});            

            dialogQueue.push({type: "end"});            

        } else if (interaction == 3) {
            dialogQueue.push({type: "text", data:"Very good place to build a bridge."});            
            dialogQueue.push({type: "check", condition: levelFlags.hasWood,
                yes: {type: "continue"},
                no: {type: "end"},
            });
            dialogQueue.push({type: "check", condition: levelFlags.bridgeBuilt,
                        yes: {type: "end"},
                        no: {type: "continue"},
            })
            dialogQueue.push({type: "text", data:"You agree with the sign\nand build the bridge here.",
                and: {type: "exec", data: bridgeReplacer,
                and: {type: "toggle", flags: "bridgeBuilt"}
            }});            

            dialogQueue.push({type: "end"});
        } else if (interaction == 4) {
            dialogQueue.push({type: "text", data:"I love bugs."});            
            dialogQueue.push({type: "text", data:"They are a good source of protein."});            
            dialogQueue.push({type: "text", data:"You want some?"});            

            dialogQueue.push({type: "check", condition:levelFlags.wantsBugs,
                yes: {type: "continue"},
                no:  {type: "end"}
            });            

            dialogQueue.push({type: "text", data:"You do?"});            
            dialogQueue.push({type: "text", data:"Here you go!",
                and: {type: "toggle", flags: "hasBugs"}
            });            
            dialogQueue.push({type: "text", data:"*i get paid way\ntoo little for this*"});            

            dialogQueue.push({type: "end"});            
        }

        runDialog(levelHugo, levelFlags, dialogQueue.shift());
    }

    keyPress("space", () => {
        if (levelHugo.flags.interactable === false || levelHugo.flags.lockControls == true) return;

        setupDialog(levelHugo.flags.interactable);
    });

    //audio

    var audio = play("drumdreams", {loop: true});

    //end location

    action(async function() {
        if (levelHugo.worldX == 5 && levelHugo.worldY == 12 && !levelFlags.atEnd) { 
            levelFlags.atEnd = true;
            audio.unloop();
            await endAnimation(audio);
            audio.pause();
            audio.stop();
            go('level4transition');
        }; 
    });
});

/*

Level 4

*/

//level 4 transition

scene('level4transition', async function() {
    var overlay = add([
        rect(450, 450),
        pos(0, 0),
        color(0, 0, 0),
    ]);

    var overlayText = add([
        text("Kindness is Glowing\nIt radiates around you\nIt grows when people share it."),
        opacity(0),

        origin("center"),
        pos(225, 225),

        scale(0.25),
    ]);

    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity += 1/20});
    };
    await wait(4, () => {});
    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity -= 1/20});
    };
    await wait(0.5, () => {});
    go("level4")
})

scene("level4", () => {
    var levelMap = [
        //   0123456789
            "$   $$###".split(''), //0
            "  1 ####$".split(''), //1
            "&8&&## $$".split(''), //2
            "$ $$# 3 $".split(''), //3
            "S 0##    ".split(''), //4
            "   --  4 ".split(''), //6
            " ###     ".split(''), //7
            "## $$  5 ".split(''), //8
            "$&  $&   ".split(''), //9
            "&   $  6&".split(''), //10
            "  7$$&   ".split(''), //11
            "   #$  &$".split(''), //12
            "$$#$$ 2$$".split(''), //13
            "e$#$  &$$".split(''), //14
    ];
    
    level = createLevel(levelMap);

    levelHugo = hugo(get("spawn")[0].pos, level);

    //custom interactions

    var interaction0base = get("0")[0];
    var interaction0 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction0base.pos.y)),

            pos(interaction0base.pos.x, interaction0base.pos.y+8),

            sprite("npc"),
            color(145, 255, 0),
    ]);

    var interaction1base = get("1")[0];
    var interaction1 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction1base.pos.y)),

            pos(interaction1base.pos.x, interaction1base.pos.y+8),

            sprite("npc"),
            color(227, 123, 20),
    ]);

    var interaction2base = get("2")[0];
    var interaction2 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction2base.pos.y)),

            pos(interaction2base.pos.x, interaction2base.pos.y+8),

            sprite("npc"),
            color(0, 255, 200)
    ]);

    var interaction3base = get("3")[0];
    var interaction3 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction3base.pos.y)),

            pos(interaction3base.pos.x, interaction3base.pos.y+8),

            sprite("npc"),
            color(116, 209, 23)
    ]);

    var interaction4base = get("4")[0];
    var interaction4 = add([
            "light",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction4base.pos.y)),

            pos(interaction4base.pos.x, interaction4base.pos.y),

            sprite("light"),
            color(240, 225, 228)
    ]);

    var interaction5base = get("5")[0];
    var interaction5 = add([
            "light",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction5base.pos.y)),

            pos(interaction5base.pos.x, interaction5base.pos.y),

            sprite("light"),
            color(240, 225, 228)
    ]);

    var interaction6base = get("6")[0];
    var interaction6 = add([
            "light",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction6base.pos.y)),

            pos(interaction6base.pos.x, interaction6base.pos.y),

            sprite("light"),
            color(240, 225, 228)
    ]);

    var interaction7base = get("7")[0];
    var interaction7 = add([
            "npc",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction7base.pos.y)),

            pos(interaction7base.pos.x, interaction7base.pos.y+8),

            sprite("npc"),
            color(214, 118, 126)
    ]);

    var interaction8base = get("8")[0];
    var interaction8 = add([
            "rock",
            layer("world"),
            origin("left"),
            z(calculateWorldY(interaction8base.pos.y)),

            pos(interaction8base.pos),

            sprite("rock"),
    ]);

    var dialogBox = levelHugo.dialogBox;
    var dialogText = dialogBox.dialogText;

    keyPress("q", () => {
        if (levelHugo.flags.dialog == true) {
            runDialog(levelHugo, levelFlags, dialogQueue.shift());
        };
    })

    function lightOn(interaction) {
        interaction.color = {r:255, g:255, b:0}
    }

    //level (local) flags

    levelFlags = {
        keyPressQ: false,
        needsFreeFriend: false,
        light1: false,
        light2: false,
        light3: false,
        hasStoneDrill: false,
        usedStoneDrill: false, //also FriendFreed
        bigHugo: false,
        fetchQuestStart: false,
        fetchQuestEnd: false,
        allowEnd: false,
    }

    //manual flag set

    function manualFlagSet(flags) {
        levelFlags[flags] = true;
    }

    function rockBreak() {
        var tileObj = get("1-2")[0];

        var newObjPos = tileObj.pos;

        level.replPos(vec2(1, 2), " ");

        tileObj.destroy();
        interaction8.destroy();

        var newObj = add([
                "tile",
                "grass",
                "1-2",
                layer("ground"),
                sprite("grass"),

                pos(newObjPos),
        ]);
    }

    function setupDialog(interaction) {
        startDialog(levelHugo);

        if (interaction == 0) {
            dialogQueue.push({type:"check", condition: levelFlags.bigHugo,
                yes:{type: "text", data: "Thank you!", 
                    and: {type: "insert", data:{type: "end"}}
                },
                no:{type: "continue"},
            });

            dialogQueue.push({type:"check", condition: levelFlags.usedStoneDrill,
                yes:{type: "continue"},
                no:{type: "text", data: "Someone please free my friend!", 
                    and: {type: "exec", data:manualFlagSet, args:"needsFreeFriend",
                    and: {type: "insert", data:{type: "end"}}
                }},
            });

            dialogQueue.push({type:"text", data: "Thank you for freeing my friend!",
                and:{type:"exec", data:levelHugo.grow, args:3,
                and:{type:"toggle", flags:"bigHugo"}
            }});

            dialogQueue.push({type:"end"});
        } else if (interaction == 1) {
            dialogQueue.push({type:"text", data:"Thanks for freeing me!"});
            dialogQueue.push({type:"end"}); 
        } else if (interaction == 2) {
            dialogQueue.push({type: "check", condition:levelFlags.fetchQuestEnd,
                yes:{type: "text", data: "Did you give it to him yet?",
                    and: {type: "toggle", flags:"allowEnd"},
                    and: {type: "insert", data:{type:"end"}}
                },
                no:{type:"continue"}
            })
            dialogQueue.push({type: "check",condition:levelFlags.fetchQuestStart,
                yes:{type: "text", data: "Here's the bone.\nYes, I can read minds.",
                    and: {type: "toggle", flags: "fetchQuestEnd",
                    and: {type: "insert", data:{type:"end"}}
                }},
                no:{type:"continue"}
            });
            dialogQueue.push({type:"text", data:"Good day isn't it?"});
            dialogQueue.push({type:"end"})
        } else if (interaction == 3) {
            dialogQueue.push({type:"check", condition:levelFlags.hasStoneDrill,
                yes: {type: "text", data: "Sweet drill!",
                    and: {type: "insert", data:{type:"end"}}
                },
                no: {type: "continue"}
            });

            dialogQueue.push({type:"text", data:"I would like to turn on\nthese lights but I'm too lazy."});
            dialogQueue.push({type:"text", data:"Do it for me and\nI will give a stone drill!"});

            dialogQueue.push({type:"check", condition:levelFlags.light1,
                yes: {type: "continue"},
                no: {type: "end"}
            });

            dialogQueue.push({type:"check", condition:levelFlags.light2,
                yes: {type: "continue"},
                no: {type: "end"}
            });

            dialogQueue.push({type:"check", condition:levelFlags.light3,
                yes: {type: "continue"},
                no: {type: "end"}
            });

            dialogQueue.push({type:"text", data:"Ok here is your stone drill!",
                and:{type:"toggle", flags:"hasStoneDrill"}
            });
            dialogQueue.push({type:"text", data:"*they need to fix this easy task*"});

            dialogQueue.push({type:"end"});
        } else if (interaction == 4) {
            dialogQueue.push({type:"check", condition:levelFlags.light1,
                yes: {type: "text", data: "Light is ON.",
                    and: {type: "insert", data:{type:"end"}}
                },
                no: {type: "continue"}
            });

            dialogQueue.push({type: "text", data:"Light is now on!", and: {
                type:"toggle", flags:"light1",
                and: {type: "exec", data:lightOn, args: interaction4}
            }});

            dialogQueue.push({type:"end"});
        } else if (interaction == 5) {
            dialogQueue.push({type:"check", condition:levelFlags.light2,
                yes: {type: "text", data: "Light is ON.",
                    and: {type: "insert", data:{type:"end"}}
                },
                no: {type: "continue"}
            });

            dialogQueue.push({type: "text", data:"Light is now on!", and: {
                type:"toggle", flags:"light2",
                and: {type: "exec", data:lightOn, args: interaction5}
            }});

            dialogQueue.push({type:"end"});
        } else if (interaction == 6) {
            dialogQueue.push({type:"check", condition:levelFlags.light3,
                yes: {type: "text", data: "Light is ON.",
                    and: {type: "insert", data:{type:"end"}}
                },
                no: {type: "continue"}
            });

            dialogQueue.push({type: "text", data:"Light is now on!", and: {
                type:"toggle", flags:"light3",
                and: {type: "exec", data:lightOn, args: interaction6}
            }});

            dialogQueue.push({type:"end"});
        } else if (interaction == 7) {
            dialogQueue.push({type: "check", condition:levelFlags.fetchQuestEnd,
                yes:{type: "text", data: "Thank you so much!",
                    and: {type: "toggle", flags:"allowEnd",
                    and: {type: "insert", data:{type:"end"}}
                }},
                no:{type:"continue"}
            })
            dialogQueue.push({type: "check",condition:levelFlags.fetchQuestStart,
                yes:{type: "text", data: "Did you get a bone back?",
                    and: {type: "insert", data:{type:"end"}}
                },
                no:{type:"continue"}
            })
            dialogQueue.push({type:"text", data:"I have a fetch quest for you."})
            dialogQueue.push({type:"text", data:"Fetch me a bone please.",
                and: {type: "toggle", flags: "fetchQuestStart"}
            })
            dialogQueue.push({type:"end"})
        } else if (interaction == 8) {
            dialogQueue.push({type:"check", condition:levelFlags.hasStoneDrill,
                yes: {type: "continue"},
                no: {type: "text", data:"I'm a rock.\nWhat are you gonna do about it?",
                    and:{type:"insert", data:{type: "end"}
                }}
            });
            dialogQueue.push({type:"text", data:"Noo!",
                and:{type:"exec", data:rockBreak,
                and:{type:"toggle", flags:"usedStoneDrill"}
            }})
            dialogQueue.push({type:"end"});
        } 

        runDialog(levelHugo, levelFlags, dialogQueue.shift());
    }

    keyPress("space", () => {
        if (levelHugo.flags.interactable === false || levelHugo.flags.lockControls == true) return;

        setupDialog(levelHugo.flags.interactable);
    });

    //audio

    var audio = play("slowdoze", {loop: true});
/*
    //debug	 
    debugPos = add([
        layer("ui"),
        text("(0,0)"),
        origin("topleft"),
        scale(0.25),
    ]);

    debug.showLog = true;

    debugPos.action((obj) => { obj.text = "pos: (" + levelHugo.worldX + "," +                 levelHugo.worldY + ")\nfps: " + debug.fps() + "\ni: " +             levelHugo.flags.interactable + "\nz: " + levelHugo.z; })
*/

    //end location

    action(async function() {
        if (levelHugo.worldX == 0 && levelHugo.worldY == 13 && !levelFlags.atEnd && levelFlags.allowEnd) { 
            levelFlags.atEnd = true;
            audio.unloop();
            await endAnimation(audio);
            audio.pause();
            audio.stop();
            go('finaltransition');
        }; 
    });
});

//final transition

scene('finaltransition', async function() {
    var overlay = add([
        rect(450, 450),
        pos(0, 0),
        color(0, 0, 0),
    ]);

    var overlayText = add([
        text("Kindness is open.\nIt does not choose people\nIt affects equally"),
        opacity(0),

        origin("center"),
        pos(225, 225),

        scale(0.25),
    ]);

    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity += 1/20});
    };
    await wait(4, () => {});
    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity -= 1/20});
    };
    await wait(0.5, () => {});

    overlayText.text = "Ran out of time making this game.\nThank you for playing it\nIt means a lot to me.\n-Me";

    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity += 1/20});
    };
    await wait(4, () => {});
    for (var i = 0; i < 20; i++) {
        await wait(0.5/20, () => {overlayText.opacity -= 1/20});
    };
    await wait(0.5, () => {});

    go("return")
})

scene("return", async function() {

    var audio = play("maintheme", {loop: true});

    audio.volume(0);

    var background = add([
        rect(450, 450),
        pos(0, 0),
        color(0, 0, 0)
    ]);

    var logo = add([
        sprite("hugoLogo"),

        origin("center"),
        pos(225, 225),

        scale(3),
    ]);

    var initText = add([
        text("to start"),

        origin("center"),
        pos(225, 335),
        scale(0.3),
    ]);

    var initText2 = add([
        text("hold the left mouse button"),

        origin("center"),
        pos(225, 375),
        scale(0.35),
    ]);

    var hugo = add([
        "hugo",
        sprite("hugo"),

        origin("center"),
        pos(225, 225),
        rotate(0),

        scale(30.5),
    ]);

    var overlay = add([
        rect(450, 450),
        pos(0, 0),
        color(0, 0, 0),
        opacity(1)
    ]);

    var overlayText = add([
        text("By Manitej Boorgu\nThanks for playing (or judging).\nBefore playing, read README.md"),
        opacity(0),

        origin("center"),
        pos(225, 225),

        scale(0.25),
    ]);

    await wait(0.1, () => {});

    for (var i = 0; hugo.scale.x != 2.5; i++) {
        await wait(0.5/20, () => {
            hugo.pos = vec2(-mousePos().x+width(), -mousePos().y+height());
            hugo.angle = hugo.pos.angle(mousePos());
            overlay.opacity -= 1/20 
            hugo.scaleTo(hugo.scale.x - 0.5); 
            audio.volume(audio.volume() + 1/20)});
    };

    hugo.action(async function() {
        hugo.angle = hugo.pos.angle(mousePos()); 
        hugo.pos = vec2(-mousePos().x+width(), -mousePos().y+height());
        if (mouseIsDown()) {
            hugo.frame = 1; 
            for (var i = 0; i < 20; i++) {
                await wait(0.5/20, () => {hugo.scaleTo(hugo.scale.x + 0.5)});
            };
            await wait(0.05);
            for (var i = 0; i < 20; i++) {
                await wait(0.5/10, () => {overlay.opacity += 1/20; audio.volume(audio.volume() - 1/20);});
            };
            await wait(0.5);
            for (var i = 0; i < 20; i++) {
                await wait(0.5/20, () => {overlayText.opacity += 1/20});
            };
            await wait(4, () => {});
            for (var i = 0; i < 20; i++) {
                await wait(0.5/20, () => {overlayText.opacity -= 1/20});
            };
            await wait(0.5, () => {});
            audio.unloop();
            audio.stop();
            go("level1");
        } 
    });

});
//debug:
go("start");
