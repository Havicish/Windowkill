try {
	// DUBEG VARS

	// INIT

	document.onkeydown = HandleKeyDown;
	document.onkeyup = HandleKeyUp;

	let Size = {
		X: window.innerWidth,
		Y: window.innerHeight
	}
	let Canvas = Get("MainCanvas");
	let Context = Canvas.getContext("2d");
	let BackgroundCanvas = Get("BackgroundCanvas");
	let BackgroundContext = Canvas.getContext("2d");
	
	let Rad = 2 * Math.PI;
	
	let StartTime = Date.now();
	let CurrTime = 0;
	let Delta = 0;
	let TimeScale = 1;
	let Diff = 0;
	let GameState = {
		State: "Starting",
		FirstFrame: true
	}

	let Enemies = [];
	let Windows = [];

	let Player = {
		X: .5,
		Y: .5,
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
			this.SideY = SizeY;
			this.TopVel = 0;
			this.BottomVel = 0;
			this.LeftVel = 0;
			this.RightVel = 0;
			this.Locked = Locked;
			this.ID = Math.random();
		}
	}

	Windows.push(new Window(Size.X / 2 - 100, Size.Y / 2 - 100, Size.X / 2 + 100, Size.Y / 2 + 100));

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
			BackgroundContext.clearRect(Window.X, Window.Y, Window.SizeX, Window.SizeY);
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
} catch(err) {
	alert(err);
}