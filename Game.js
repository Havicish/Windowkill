// DUBEG VARS

let DebugVars = {
	InfWindow: true
}

// INIT

document.onkeydown = HandleKeyDown;
document.onkeyup = HandleKeyUp;
document.onmousedown = HandleMouseDown;
document.onmouseup = HandleMouseUp;
document.onmousemove = HandleMouseMove;
window.onblur = HandleBlur;

let Size = {
	X: window.innerWidth,
	Y: window.innerHeight
}
let Canvas = Get("MainCanvas");
let Context = Canvas.getContext("2d");
let BackgroundCanvas = Get("BackgroundCanvas");
let BackgroundContext = BackgroundCanvas.getContext("2d");

let Rad = 2 * Math.PI;

let Grapchicks = 100;

let StartTime = Date.now();
let CurrTime = 0;
let Delta = 0;
let TimeScale = 1;
let Diff = 0;
let Grabbing = null;
let GameState = {
	State: "Normal",
	SubState: null,
	FirstFrame: true
}
let Mouse = {
	X: 0,
	Y: 0
}
let Upgrades = {
	FireRate: 10,
	Speed: 0,
	KB: 5,
	MultiShot: 0,
	Homing: 0,
	Wealth: 0,
	Heals: 0,
	MaxHealth: 0,
	Freezing: 0,
	Splash: 0,
	Piercing: 1000,
	Damage: -.99
}
let Perks = {
	Bellow: 0,
	Drain: 0,
	Peer: 0,
	ClockWork: 0
}

let NewEnemy = 180;
let Enemies = [];
let Windows = [];
let Bullets = [];
let Particles = [];

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
	Reload: 0,
	Shootings: false
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
		Debug.style = "position: absolute; bottom: 0%; left: 0; color: #00ff00; font-family: monospace; Background-color: #252525; width: 100%; height: 25%; overflow: scroll; user-select: none;";
		Get("Debug.FirstLog").textContent = `First log at: ${(Date.now() - StartTime) / 1000}s`;
		LogSetFirstLog = true;
	}

	LogLogs++

	let NewItem = document.createElement("p");
	NewItem.textContent = `${Math.floor(CurrTime * 100) / 100}: ${Msg}`;
	Debug.appendChild(NewItem);
}

function Direction(Object0, Object1) {
	return Math.atan2(Object1.Y - Object0.Y, Object1.X - Object0.X);
}

function Distance(Object0, Object1) {
	return Math.sqrt((Object0.X - Object1.X) ** 2 + (Object0.Y - Object1.Y) ** 2);
}

function PathShape(X, Y, Sides, Rot, Radius) {
	Context.beginPath();

	Rot = Rot % Rad;
	Context.moveTo(Math.cos(Rot) * Radius + X, Math.sin(Rot) * Radius + Y);
	for (let i = 1; i < Sides; i++) {
		Rot += Rad / Sides;
		Context.lineTo(Math.cos(Rot) * Radius + X, Math.sin(Rot) * Radius + Y);
	}
	Context.closePath();
}

// CLASSES

class Color {
	constructor(Hue, Staturation, Lightness) {
		this.Hue = Hue;
		this.Staturation = Staturation;
		this.Lightness = Lightness;
	}
}

class Enemy {
	constructor(X, Y, Type) {
		this.X = X;
		this.Y = Y;
		this.XVel = 0;
		this.YVel = 0;
		this.Dir = Math.random() * Rad;
		this.Health = Diff / 90 / 60 + 1.5;
		this.Speed = 1.5;
		this.Type = Type;
		this.Timer = 120;
		this.Flashing = 0;
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
		this.Speed = 15;
		this.Piercings = Upgrades.Piercing + 1;
		this.Hits = [];
	}
}

class Particle {
	constructor(X, Y, Color, Moving) {
		this.X = X;
		this.Y = Y;
		this.Color = Color;
		this.Dir = Math.random() * 2 * Math.PI;
		this.Size = 3;
		this.Moving = Moving;
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
	if (window.event.key == "Escape") {
		if (GameState.State == "Normal") {
			GameState.State = "Paused";
			GameState.FirstFrame = true;
		} else if (GameState.State == "Paused" || GameState.State == "Shop") {
			GameState.State = "Normal";
			GameState.FirstFrame = true;
		}
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
	Player.Shooting = true;

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
	Player.Shooting = false;

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

function HandleBlur() {
	GameState.State = "Paused";
	GameState.FirstFrame = true;
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

	Player.Reload -= 1 * Delta;
	if (Player.Shooting == true && Player.Reload <= 0) {
		Player.Reload = 30 - Upgrades.FireRate * 3;
		Bullets.push(new Bullet(Player.X, Player.Y, Direction(Player, Mouse), Player));
	}

	Context.beginPath();
	Context.arc(Player.X, Player.Y, 12, 0, Rad);
	Context.strokeStyle = "#000000";
	Context.lineWidth = 9;
	Context.stroke();
	Context.strokeStyle = "#ffffff";
	Context.lineWidth = 3;
	Context.stroke();
}

function CalcEnemies() {
	for (let i = 0; i < Enemies.length; i++) {
		let Enemy = Enemies[i];
		
		if (Enemy.Type == "Triangle") {
			Enemy.Dir += .01 * Delta;

			Enemy.XVel += Math.cos(Direction(Enemy, Player)) * .1 * Delta;
			Enemy.YVel += Math.sin(Direction(Enemy, Player)) * .1 * Delta;
			Enemy.XVel /= 1 + (.05 * Delta);
			Enemy.YVel /= 1 + (.05 * Delta);
			Enemy.X += Enemy.XVel * Delta;
			Enemy.Y += Enemy.YVel * Delta;
			
			Enemy.Flashing -= 1 * Delta;
			if (Distance(Enemy, Player) < 24) {
				Player.XVel = Math.cos(Direction(Enemy, Player)) * 16;
				Player.YVel = Math.sin(Direction(Enemy, Player)) * 16;
				Enemy.XVel = Math.cos(Direction(Player, Enemy)) * 3;
				Enemy.YVel = Math.sin(Direction(Player, Enemy)) * 3;
				Enemy.Flashing = 30;
				Enemy.Health -= 1;
			}

			if (Enemy.Health > 0) {
				PathShape(Enemy.X, Enemy.Y, 3, Enemy.Dir, 12);
				Context.lineWidth = 9;
				Context.lineJoin = "round";
				Context.strokeStyle = "#000000";
				Context.stroke();
				Context.lineWidth = 3;
				Context.strokeStyle = `hsl(46, 88%, ${Math.max(Enemy.Flashing, 0) * 2.5 + 50}%)`;
				Context.stroke();
				Context.lineJoin = "miter";
			} else {
				for (let ii = 0; ii < 4; ii++) {Particles.push(new Particle(Enemy.X, Enemy.Y, new Color(46, 88, 50), .75));}
				for (let ii = 0; ii < 2; ii++) {Particles.push(new Particle(Enemy.X, Enemy.Y, new Color(0, 0, 100), 1));}
				Enemies.splice(i, 1);
			}
		}
	}
}

function CalcBullets() {
	for (let i = 0; i < Bullets.length; i++) {
		let Bullet = Bullets[i];
		Bullet.X += Math.cos(Bullet.Dir) * Bullet.Speed * Delta;
		Bullet.Y += Math.sin(Bullet.Dir) * Bullet.Speed * Delta;

		for (let i = 0; i < Enemies.length; i++) {
			let Enemy = Enemies[i];

			if (Distance(Enemy, Bullet) < 20 && Bullet.Piercings > 0 && Bullet.Hits.indexOf(Enemy) == -1) {
				Enemy.Health -= 1 + Upgrades.Damage;
				Enemy.Flashing = 30;
				Enemy.XVel = Math.cos(Bullet.Dir) * Upgrades.KB * 2;
				Enemy.YVel = Math.sin(Bullet.Dir) * Upgrades.KB * 2;
				Bullet.Hits.push(Enemy);
				for (let ii = 0; ii < 4; ii++) {Particles.push(new Particle(Bullet.X, Bullet.Y, new Color(0, 0, 100), 1));}
				Bullet.Piercings -= 1;
			}
		}

		if (Bullet.Piercings <= 0) {
			Bullets.splice(i, 1);
		}

		if (Bullet.X < Windows[0].X) {
			Windows[0].LeftVel += Upgrades.KB + 2;
			Bullets.splice(i, 1);
			for (let ii = 0; ii < 6; ii++) {Particles.push(new Particle(Bullet.X, Bullet.Y, new Color(0, 0, 100), 1));}
		} else if (Bullet.Y < Windows[0].Y) {
			Windows[0].TopVel += Upgrades.KB + 2;
			Bullets.splice(i, 1);
			for (let ii = 0; ii < 6; ii++) {Particles.push(new Particle(Bullet.X, Bullet.Y, new Color(0, 0, 100), 1));}
		} else if (Bullet.X > Windows[0].X + Windows[0].SizeX) {
			Windows[0].RightVel += Upgrades.KB + 2;
			Bullets.splice(i, 1);
			for (let ii = 0; ii < 6; ii++) {Particles.push(new Particle(Bullet.X, Bullet.Y, new Color(0, 0, 100), 1));}
		} else if (Bullet.Y > Windows[0].Y + Windows[0].SizeY) {
			Windows[0].BottomVel += Upgrades.KB + 2;
			Bullets.splice(i, 1);
			for (let ii = 0; ii < 6; ii++) {Particles.push(new Particle(Bullet.X, Bullet.Y, new Color(0, 0, 100), 1));}
		} else if (Bullet == Bullets[i]) {
			Context.beginPath();
			Context.ellipse(Bullet.X, Bullet.Y, 8, 4, Bullet.Dir, 0, Rad);
			Context.fillStyle = "white";
			Context.strokeStyle = "black";
			Context.lineWidth = 6;
			Context.stroke();
			Context.fill();
		}
	}
}

function CalcParticles() {
	for (let i = 0; i < Particles.length; i++) {
		let Particle = Particles[i];

		Particle.X += Math.cos(Particle.Dir) * 2 * Delta * Particle.Moving;
		Particle.Y += Math.sin(Particle.Dir) * 2 * Delta * Particle.Moving;

		Particle.Size -= .1 * Delta;

		if (Particle.Size <= 0) {
			Particles.splice(i, 1);
		} else {
			Context.beginPath();
			Context.ellipse(Particle.X, Particle.Y, Particle.Size * 1.5, Particle.Size, Particle.Dir, 0, Rad);
			Context.fillStyle = `hsl(${Particle.Color.Hue}, ${Particle.Color.Staturation}%, ${Particle.Color.Lightness}%)`;
			Context.fill();
		}

		if (Particles.length > 50 + Grapchicks) {
			Particle.Size /= 1.2 * Delta;
		}
	}
}

function CalcWindows() {
	for (let i = 0; i < Windows.length; i++) {
		let Window = Windows[i];

		if (i === 0) {
			Window.LeftVel -= (Diff / 60 / 36000 + .015) / 400 * Window.SizeX * Delta;
			Window.RightVel -= (Diff / 60 / 36000 + .015) / 400 * Window.SizeX * Delta;
			Window.BottomVel -= (Diff / 60 / 36000 + .015) / 400 * Window.SizeY * Delta;
			Window.TopVel -= (Diff / 60 / 3600 + .015) / 400 * Window.SizeY * Delta;
			Window.LeftVel /= 1 + (.05 * Delta);
			Window.RightVel /=  1 + (.05 * Delta);
			Window.BottomVel /=  1 + (.05 * Delta);
			Window.TopVel /=  1 + (.05 * Delta);
		}

		Window.X -= Window.LeftVel * Delta;
		Window.Y -= Window.TopVel * Delta;
		Window.SizeX += (Window.RightVel + Window.LeftVel) * Delta;
		Window.SizeY += (Window.BottomVel + Window.TopVel) * Delta;

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
	Grapchicks = ((Grapchicks * 9) + (100 - (Delta * 50) + 50 + ((TimeScale - 1) * 50))) / 10;
	if (GameState.State === "Paused" || GameState.State === "Shop") {Delta = 0}
	Diff += Delta;
	CurrTime = (Date.now() - StartTime) / 1000;

	NewEnemy -= 1 * Delta;
	if (NewEnemy <= 0) {
		NewEnemy = 10 - Diff / 3600;
		Enemies.push(new Enemy(Math.round(Math.random()) * Size.X, Math.round(Math.random()) * Size.Y, "Triangle"));
	}

	Context.clearRect(0, 0, Size.X, Size.Y);

	CalcParticles();
	CalcBullets();
	CalcPlayer();
	CalcEnemies();
	BackgroundContext.clearRect(0, 0, Size.X, Size.Y);
	BackgroundContext.drawImage(Get("BackgroundImage"), 0, 0, Size.X + 1, Size.Y + 1)
	CalcWindows();

	if (DebugVars.InfWindow == true) {
		Windows[0].X = 0;
		Windows[0].Y = 0;
		Windows[0].SizeX = Size.X;
		Windows[0].SizeY = Size.Y;
	}

	GameState.FirstFrame = false

	requestAnimationFrame(Frame);
}

Frame()
