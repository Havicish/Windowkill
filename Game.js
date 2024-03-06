// DUBEG VARS

// INIT

document.onkeydown = HandleKeyDown;
document.onkeyup = HandleKeyUp;
document.onmousedown = HandleMouseDown;
document.onmouseup = HandleMouseUp;
document.onmousemove = HandleMouseMove;

let Size = {
	X: window.innerWidth,
	Y: window.innerHeight
}
let Canvas = Get("MainCanvas");
let Context = Canvas.getContext("2d");
let BackgroundCanvas = Get("BackgroundCanvas");
let BackgroundContext = BackgroundCanvas.getContext("2d");

let Rad = 2 * Math.PI;

let StartTime = Date.now();
let CurrTime = 0;
let Delta = 0;
let TimeScale = 1;
let Diff = 0;
let Grabbing = null;
let GameState = {
	State: "Starting",
	FirstFrame: true
}
let Mouse = {
	X: 0,
	Y: 0
}
let Upgrades = {
	FireRate: 30,
	Speed: 0,
	KB: 0,
	MultiShot: 0,
	Homing: 0,
	Wealth: 0,
	Heals: 0,
	MaxHealth: 0,
	Freezing: 0,
	Splash: 0,
	Piercing: 0
}

let Perks = {
	Bellow: 0,
	Drain: 0,
	Peer: 0
}

let Enemies = [];
let Windows = [];
let Bullets = [];

let Player = {
	X: Size.X / 2,
	Y: Size.Y / 2,
	XVel: 0,
	YVel: 0,
	Health: 10,
	Speed: .25,
	HoldLeft: 0,
	HoldRight: 0,
	HoldUp: 0,
	HoldDown: 0,
	Reload: 0
}

// FUNCTIONS

function Get(ObjectID) {
	return document.getElementById(ObjectID);
}

let LogSetFirstLog = false;
let LogLogs = 0;
function Log(Msg) {
	let Debug = Get("Debug");
	if (LogSetFirstLog == false) {
		Debug.style = "position: absolute; bottom: 0%; left: 0; color: #00ff00; font-family: monospace; Background-color: #252525; width: 100%; height: 25%; overflow: scroll;";
		Get("Debug.FirstLog").textContent = `First log at: ${(Date.now() - StartTime) / 1000}s`;
		LogSetFirstLog = true;
	}

	LogLogs++

	let NewItem = document.createElement("p");
	NewItem.textContent = `${Math.floor(CurrTime * 100) / 100}: ${Msg}`;
	Debug.appendChild(NewItem);
}

// CLASSES

class Triangle {
	constructor(X, Y) {
		this.X = X;
		this.Y = Y;
		this.XVel = 0;
		this.YVel = 0;
		this.Dir = 0;
		this.Health = Diff / 40 + 2;
		this.Speed = 1.5;
		this.Type = "Triangle";
	}
}

class Window {
	constructor(X, Y, SizeX, SizeY, Locked) {
		this.X = X;
		this.Y = Y;
		this.SizeX = SizeX;
		this.SizeY = SizeY;
		this.TopVel = 0;
		this.BottomVel = 0;
		this.LeftVel = 0;
		this.RightVel = 0;
		this.Locked = Locked;
		this.ID = Math.random() * 10 ** 16;
	}
}

Windows[0] = new Window(Size.X / 2 - 200, Size.Y / 2 - 200, 400, 400, true);

class Bullet {
	constructor(X, Y, Dir, Object) {
		this.X = X;
		this.Y = Y;
		this.Dir = Dir;
		this.Object = Object;
		this.Speed = 2;
	}
}

// CALCULATION/RENDER FUNCTIONS

function HandleKeyDown() {
	if (window.event.key == "w" || window.event.key == "W") {
		Player.HoldUp = 1;
	}
	if (window.event.key == "d" || window.event.key == "D") {
		Player.HoldRight = 1;
	}
	if (window.event.key == "s" || window.event.key == "S") {
		Player.HoldDown = 1;
	}
	if (window.event.key == "a" || window.event.key == "A") {
		Player.HoldLeft = 1;
	}
}

function HandleKeyUp() {
	if (window.event.key == "w" || window.event.key == "W") {
		Player.HoldUp = 0;
	}
	if (window.event.key == "d" || window.event.key == "D") {
		Player.HoldRight = 0;
	}
	if (window.event.key == "s" || window.event.key == "S") {
		Player.HoldDown = 0;
	}
	if (window.event.key == "a" || window.event.key == "A") {
		Player.HoldLeft = 0;
	}
}

function HandleMouseDown() {
	for (let i = 0; i < Windows.length; i++) {
		let Window = Windows[i];
		if (Window.Locked == false && Window.X < Mouse.X && Window.Y > Mouse.Y && Window.X + Window.SizeX > Mouse.X && Window.Y - 24 < Mouse.Y) {
			Grabbing = Window.ID;
			TimeScale -= .75;
			Window.X = Mouse.X - Window.SizeX / 2;
			Window.Y = Mouse.Y + 12;
		}
	}
}

function HandleMouseUp() {
	if (Grabbing !== null) {
		Grabbing = null;
		TimeScale += .75;
	}
}

function HandleMouseMove() {
	Mouse.X = window.event.clientX;
	Mouse.Y = window.event.clientY;

	if (Grabbing !== null) {
		for (let i = 0; i < Windows.length; i++) {
			let Window = Windows[i];

			if (Window.ID == Grabbing) {
				Window.X = Mouse.X - Window.SizeX / 2;
				Window.Y = Mouse.Y + 12;
			}
		}
	}
}

function CalcPlayer() {
	Player.XVel += Player.HoldRight * Delta;
	Player.XVel -= Player.HoldLeft * Delta;
	Player.YVel += Player.HoldDown * Delta;
	Player.YVel -= Player.HoldUp * Delta;
	Player.XVel /= 1 + (.1 * Delta);
	Player.YVel /= 1 + (.1 * Delta);
	Player.X += Player.XVel * Player.Speed * Delta * (Upgrades.Speed / 8 + 1);
	Player.Y += Player.YVel * Player.Speed * Delta * (Upgrades.Speed / 8 + 1);
	Player.X = Math.max(Windows[0].X + 20, Player.X);
	Player.Y = Math.max(Windows[0].Y + 18, Player.Y);
	Player.X = Math.min(Windows[0].X - 20 + Windows[0].SizeX, Player.X);
	Player.Y = Math.min(Windows[0].Y - 20 + Windows[0].SizeY, Player.Y);

	Context.beginPath();
	Context.arc(Player.X, Player.Y, 12, 0, Rad);
	Context.strokeStyle = "#000000";
	Context.lineWidth = 12;
	Context.stroke();
	Context.strokeStyle = "#ffffff";
	Context.lineWidth = 6;
	Context.stroke();
}

function CalcEnemies() {
	for (let i = 0; i < Enemies.length; i++) {
		let Enemy = Enemies[i];
		
		if (Enemy.Type == "Triangle") {
			
		}
	}
}

function CalcBullets() {
	for (let i = 0; i < Bullets.length; i++) {
		let Bullet = Bullets[i];
		Bullet.X += Math.cos(Bullet.Dir) * Bullet.Speed * Delta;
		Bullet.Y += Math.sin(Bullet.Dir) * Bullet.Speed * Delta;

		Context.beginPath();
		Context.ellipse(Bullet.X, Bullet.Y, 9, 6, Bullet.Dir, 0, Rad);
		Context.fillStyle = "white";
		Context.strokeStyle = "black";
		Context.lineWidth = 6;
		Context.stroke();
		Context.fill();
	}
}

function CalcWindows() {
	for (let i = 0; i < Windows.length; i++) {
		let Window = Windows[i];

		if (i === 0) {
			Window.LeftVel -= Diff / 60 / 3600 + .05 - (1 - Window.SizeY / 200);
			Window.RightVel -= Diff / 60 / 3600 + .05 - (1 - Window.SizeY / 200);
			Window.BottomVel -= Diff / 60 / 3600 + .05 - (1 - Window.SizeY / 200);
			Window.TopVel -= Diff / 60 / 3600 + .05 - (1 - Window.SizeY / 200);
			Window.LeftVel /= 1.05;
			Window.RightVel /= 1.05;
			Window.BottomVel /= 1.05;
			Window.TopVel /= 1.05;
		}

		Window.X -= Window.LeftVel;
		Window.Y -= Window.TopVel;
		Window.SizeX += Window.RightVel + Window.LeftVel;
		Window.SizeY += Window.BottomVel + Window.TopVel;

		BackgroundContext.clearRect(Window.X, Window.Y - 23, Window.SizeX, Window.SizeY + 23);
		Context.fillStyle = "#303030";
		Context.fillRect(Window.X, Window.Y + 1, Window.SizeX, -25);
		Context.strokeStyle = "#303030";
		Context.lineWidth = 4;
		Context.strokeRect(Window.X + 2, Window.Y + 1, Window.SizeX - 4, Window.SizeY - 3);
	}
}

// MAIN LOOP

function Frame() {
	Size.X = window.innerWidth;
	Size.Y = window.innerHeight;
	Canvas.width = Size.X;
	Canvas.height = Size.Y;
	BackgroundCanvas.width = Size.X;
	BackgroundCanvas.height = Size.Y;
	Delta = Math.floor((((Date.now() - StartTime) / 1000) - CurrTime) * TimeScale * 6000) / 100;
	Diff += Delta;
	CurrTime = (Date.now() - StartTime) / 1000;

	Context.clearRect(0, 0, Size.X, Size.Y);

	CalcPlayer();
	CalcBullets();
	CalcEnemies();
	BackgroundContext.clearRect(0, 0, Size.X, Size.Y);
	BackgroundContext.drawImage(Get("BackgroundImage"), 0, 0, Size.X + 1, Size.Y + 1)
	CalcWindows();

	GameState.FirstFrame = false

	requestAnimationFrame(Frame);
}

Frame()