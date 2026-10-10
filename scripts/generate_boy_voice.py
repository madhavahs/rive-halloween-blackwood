import asyncio
import edge_tts
import os

# Script for boy explanation voiceover (60 seconds)
# Leo, young gamer / paranormal investigator
VOICE_LINES = [
    {
        "time": 0.5,
        "text": "Yo guys! Welcome to Blackwood Manor. Tonight I'm your paranormal night guard! Check out this interactive surveillance terminal—my flashlight tracks right to my cursor!",
    },
    {
        "time": 10.0,
        "text": "Let's open the classified monster dossier! We've got four unique haunted entities: The Burlap Scarecrow, Spectral Bride, Pumpkin Stalker, and the Demon!",
    },
    {
        "time": 21.5,
        "text": "Now check this out—entering The Further in real-time 3D! Look at the EMF meter spiking as the ghost gets closer! Listen to those eerie background whispers... let's play the music box!",
    },
    {
        "time": 38.0,
        "text": "Uh oh, alarms are ringing! Panic meter is surging, heart is pounding, and the entity is breaking through the screen right at us!",
    },
    {
        "time": 50.5,
        "text": "Hit emergency reboot now! Boom! System purged, containment restored, and we survived! Built with Rive CLI and GPU Canvas!",
    }
]

async def generate_voice_clips():
    os.makedirs("recordings/voice", exist_ok=True)
    voice = "en-US-BrianNeural" # Youthful, casual, energetic boy voice
    
    for idx, item in enumerate(VOICE_LINES):
        output_file = f"recordings/voice/clip_{idx+1}.mp3"
        print(f"Generating clip {idx+1}: {item['text'][:40]}...")
        # Increase pitch slightly (+8Hz) and rate (+6%) for youthful enthusiastic boy tone
        communicate = edge_tts.Communicate(
            item["text"],
            voice=voice,
            rate="+6%",
            pitch="+10Hz"
        )
        await communicate.save(output_file)
        print(f"Saved: {output_file}")

if __name__ == "__main__":
    asyncio.run(generate_voice_clips())
