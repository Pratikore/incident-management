# Runs the backend with Java 17 regardless of the terminal's default Java version.
# Usage:  ./run.ps1

$Jdk17 = "C:\Program Files\Java\jdk-17"

if (-not (Test-Path $Jdk17)) {
    Write-Error "JDK 17 not found at $Jdk17. Update the path in run.ps1."
    exit 1
}

$env:JAVA_HOME = $Jdk17
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

Write-Host "Using Java from $env:JAVA_HOME"
& java -version

mvn spring-boot:run
