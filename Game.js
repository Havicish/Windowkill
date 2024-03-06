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

let Enemies = [];
let Windows = [];

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
	HoldDown: 0
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

Windows.push(new Window(Size.X / 2 - 200, Size.Y / 2 - 200, 400, 400, true));

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
	Player.X += Player.XVel * Player.Speed * Delta;
	Player.Y += Player.YVel * Player.Speed * Delta;

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

function RenderWindows() {
	for (let i = 0; i < Windows.length; i++) {
		let Window = Windows[i];
		BackgroundContext.clearRect(Window.X, Window.Y - 23, Window.SizeX, Window.SizeY + 23);
		Context.fillStyle = "#303030";
		Context.fillRect(Window.X, Window.Y + 1, Window.SizeX, -25);
		Context.strokeStyle = "#303030";
		Context.lineWidth = 8;
		Context.strokeRect(Window.X, Window.Y + 1, Window.SizeX, Window.SizeY);
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
	CalcEnemies();
	BackgroundContext.clearRect(0, 0, Size.X, Size.Y);
	BackgroundContext.drawImage(Get("BackgroundImage"), 0, 0, Size.X + 1, Size.Y + 1)
	RenderWindows();

	GameState.FirstFrame = false

	requestAnimationFrame(Frame);
}

Frame()