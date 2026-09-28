# ============================================================
#  PC "Sleep Mode" - keeps your scripts running, but makes the
#  PC dark and quiet (RGB off, fans slower, screen off).
#
#  You don't run this file directly. Double-click:
#     "Sleep Mode ON.bat"   -> go dark and quiet
#     "Sleep Mode OFF.bat"  -> back to normal
# ============================================================

param(
    [ValidateSet("on", "off")]
    [string]$Mode = "on"
)

# ---------------- SETTINGS (you can change these) ----------------

# Where OpenRGB is installed (the program that controls RGB lights).
$OpenRGBPath = "C:\Program Files\OpenRGB\OpenRGB.exe"

# Where FanControl is installed (the program that controls fan speed).
$FanControlPath = "C:\Program Files (x86)\FanControl\FanControl.exe"

# The FanControl profile names you saved (see README.md).
$QuietFanProfile  = "Quiet.json"
$NormalFanProfile = "Normal.json"

# How fast the CPU is allowed to run in sleep mode (percent).
# Lower = cooler = quieter fans. 50 is a good middle ground.
# Your scripts will still run, just a little slower.
$CpuMaxPercent = 50

# Turn the monitor off when sleep mode starts? ($true or $false)
$TurnOffScreen = $true

# ------------------------------------------------------------------

# This file remembers which power plan you used before, so we can restore it.
$SavedPlanFile = Join-Path $PSScriptRoot "saved-power-plan.txt"

function Say($text) { Write-Host "  $text" }

function Set-RGB($on) {
    if (-not (Test-Path $OpenRGBPath)) {
        Say "[skip] OpenRGB not found at $OpenRGBPath - RGB not changed."
        return
    }
    if ($on) {
        # Loads the OpenRGB profile called "Normal" (you save it in OpenRGB once).
        & $OpenRGBPath --noautoconnect --profile "Normal" | Out-Null
        Say "[ok] RGB back on (OpenRGB profile 'Normal')."
    } else {
        # Sets every light to black = off.
        & $OpenRGBPath --noautoconnect --mode static --color 000000 | Out-Null
        Say "[ok] RGB lights turned off."
    }
}

function Set-Fans($profileName) {
    if (-not (Test-Path $FanControlPath)) {
        Say "[skip] FanControl not found at $FanControlPath - fans not changed."
        return
    }
    Start-Process -FilePath $FanControlPath -ArgumentList "-c `"$profileName`""
    Say "[ok] Fan profile switched to $profileName."
}

function Keep-PC-Awake {
    # Stop Windows from going to real sleep (which would pause your scripts).
    powercfg /change standby-timeout-ac 0
    powercfg /change hibernate-timeout-ac 0
    Say "[ok] Windows will NOT go to real sleep, so your scripts keep running."
}

function Turn-Off-Screen {
    Add-Type -Namespace Win32 -Name Screen -MemberDefinition @"
[DllImport("user32.dll")]
public static extern int SendMessage(int hWnd, int msg, int wParam, int lParam);
"@
    # 0xFFFF = all windows, 0x0112 = system command, 0xF170 = monitor power, 2 = off
    [Win32.Screen]::SendMessage(0xFFFF, 0x0112, 0xF170, 2) | Out-Null
}

Write-Host ""
if ($Mode -eq "on") {
    Write-Host "=== Turning SLEEP MODE ON ===" -ForegroundColor Cyan

    # 1. Remember the current power plan so "OFF" can restore it.
    $current = (powercfg /getactivescheme) -replace '.*GUID:\s*([0-9a-fA-F-]+).*', '$1'
    Set-Content -Path $SavedPlanFile -Value $current.Trim()

    # 2. Switch to the "Power saver" plan and limit CPU speed (less heat = slower fans).
    powercfg /setacvalueindex SCHEME_MAX SUB_PROCESSOR PROCTHROTTLEMAX $CpuMaxPercent
    powercfg /setactive SCHEME_MAX
    Say "[ok] Power saver on, CPU limited to $CpuMaxPercent%."

    Keep-PC-Awake
    Set-RGB $false
    Set-Fans $QuietFanProfile

    if ($TurnOffScreen) {
        Say "Turning screen off in 3 seconds... (move the mouse to wake it)"
        Start-Sleep -Seconds 3
        Turn-Off-Screen
    }
} else {
    Write-Host "=== Turning SLEEP MODE OFF ===" -ForegroundColor Green

    if (Test-Path $SavedPlanFile) {
        $saved = (Get-Content $SavedPlanFile).Trim()
        powercfg /setactive $saved
        Say "[ok] Your old power plan is back."
    } else {
        powercfg /setactive SCHEME_BALANCED
        Say "[ok] Power plan set to Balanced."
    }

    Set-RGB $true
    Set-Fans $NormalFanProfile
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Yellow
