param(
    [string]$AvdName,
    [switch]$WipeData
)

$ErrorActionPreference = 'Stop'

$sdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } elseif ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
$adb = Join-Path $sdkRoot 'platform-tools\adb.exe'
$emulator = Join-Path $sdkRoot 'emulator\emulator.exe'

if (-not (Test-Path $adb) -or -not (Test-Path $emulator)) {
    throw "Android SDK tools were not found at '$sdkRoot'. Install Android SDK Platform-Tools and Emulator in Android Studio, then run this script again."
}

$availableAvds = @(& $emulator -list-avds)
if ($AvdName) {
    if (-not (Test-Path (Join-Path $env:USERPROFILE ".android\avd\$AvdName.ini"))) {
        throw "AVD '$AvdName' was not found in $env:USERPROFILE\.android\avd."
    }
} elseif (-not $availableAvds) {
    throw "No Android Virtual Device exists. In Android Studio open Device Manager, create a phone AVD with an installed x86_64 system image, then run: npm run android:windows"
}

if (-not $AvdName) {
    $AvdName = $availableAvds[0].Trim()
}

if (-not $AvdName -and $availableAvds -notcontains $AvdName) {
    throw "AVD '$AvdName' was not found. Available AVDs: $($availableAvds -join ', ')"
}

$device = (& $adb devices | Select-String 'emulator-[0-9]+\s+device' | Select-Object -First 1)
if (-not $device) {
    $emulatorArgs = @('-avd', $AvdName, '-gpu', 'swiftshader_indirect', '-no-snapshot-load', '-no-boot-anim')
    if ($WipeData) { $emulatorArgs += '-wipe-data' }
    Write-Host "Starting AVD '$AvdName' with software graphics..."
    Start-Process -FilePath $emulator -WorkingDirectory (Split-Path $emulator) -ArgumentList $emulatorArgs -WindowStyle Minimized | Out-Null
}

Write-Host 'Waiting for Android to finish booting...'
& $adb wait-for-device
$deadline = (Get-Date).AddMinutes(5)
$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    do {
        $booted = (& $adb shell getprop sys.boot_completed 2>$null | Out-String).Trim()
        if ($booted -eq '1') { break }
        if ((Get-Date) -gt $deadline) { throw 'The emulator did not finish booting within 5 minutes.' }
        Start-Sleep -Seconds 3
    } while ($true)
} finally {
    $ErrorActionPreference = $previousErrorAction
}

& $adb reverse tcp:8081 tcp:8081 | Out-Null

# Ninja on Windows fails if the Gradle cache path exceeds 260 characters (Cursor
# sandbox caches are too long). Use a short cache and build only the emulator ABI.
$shortGradleHome = 'C:\g'
if (-not (Test-Path $shortGradleHome)) {
    New-Item -ItemType Directory -Path $shortGradleHome | Out-Null
}
$env:GRADLE_USER_HOME = $shortGradleHome
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:ORG_GRADLE_PROJECT_reactNativeArchitectures = 'x86_64'

Push-Location (Join-Path $PSScriptRoot '..')
try {
    npm run android
} finally {
    Pop-Location
}

# Grant declared development permissions after installation to avoid runtime prompts.
$packageInstalled = (& $adb shell pm path com.front_end 2>$null | Out-String).Trim()
if (-not $packageInstalled) {
    throw 'The Android app did not install. See the Gradle output above.'
}
$permissions = @(
    'android.permission.CAMERA',
    'android.permission.READ_MEDIA_IMAGES',
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE'
)
$previousErrorAction = $ErrorActionPreference
$ErrorActionPreference = 'Continue'
try {
    foreach ($permission in $permissions) {
        & $adb shell pm grant com.front_end $permission 2>$null | Out-Null
    }
} finally {
    $ErrorActionPreference = $previousErrorAction
}
Write-Host 'Android app is running on the emulator.'
