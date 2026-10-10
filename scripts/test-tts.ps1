Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $synth.GetInstalledVoices()
foreach ($v in $voices) {
    Write-Host "Voice: $($v.VoiceInfo.Name) ($($v.VoiceInfo.Gender), $($v.VoiceInfo.Age))"
}
$synth.SetOutputToWaveFile("recordings/test-voice.wav")
$synth.Speak("Hey everyone! Welcome to Blackwood Manor. Today I'm going to show you how to survive this haunted surveillance game!")
$synth.Dispose()
Write-Host "Done test TTS."
