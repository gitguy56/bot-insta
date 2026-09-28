# PC Sleep Mode 🌙

Makes your Windows PC **dark and quiet** while your scripts **keep running**.

When Sleep Mode is ON:
- 💡 RGB lights turn off
- 🌀 Fans slow down
- 🧊 CPU is limited (less heat, so the fans stay quiet)
- 🖥️ Screen turns off
- ✅ The PC does **not** really sleep, so your scripts keep going

## How to use it

1. Download this folder to your PC (green **Code** button on GitHub → **Download ZIP**, then unzip it).
2. Double-click **`Sleep Mode ON.bat`** to go dark and quiet.
3. Double-click **`Sleep Mode OFF.bat`** to go back to normal.

That's it! The CPU limit and screen-off part work straight away.
For the RGB and fans you need two free programs (one-time setup below).

## One-time setup

### 1. RGB lights – OpenRGB
1. Download and install **OpenRGB** from https://openrgb.org
2. Open it and set your lights how you normally like them.
3. At the bottom, type `Normal` in the profile box and click **Save Profile**.
   (Sleep Mode OFF loads this profile to turn your lights back on.)

### 2. Fans – FanControl
1. Download and install **FanControl** from https://getfancontrol.com
2. Set up your fans how you normally like them, then save the config as **`Normal.json`**.
3. Make the fan curves lower/quieter, then save as a new config called **`Quiet.json`**.

> ⚠️ Don't make the fans *too* slow. Keep them at least around 30–40% so your PC doesn't overheat.

## If something doesn't work

Open `sleep-mode.ps1` in Notepad. At the top there is a **SETTINGS** section where you can change:
- where OpenRGB / FanControl are installed
- how much to limit the CPU (`$CpuMaxPercent`)
- whether the screen should turn off

If OpenRGB or FanControl isn't installed, the script just skips that step and does everything else.
