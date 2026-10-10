import { describe, it, expect, vi, beforeEach } from "vitest";
import { SoundEngine } from "./SoundEngine";

describe("SoundEngine procedural synthesizer", () => {
  let engine: SoundEngine;

  beforeEach(() => {
    engine = new SoundEngine({ initialMuted: false });
  });

  it("should initialize with default states", () => {
    expect(engine.getMuted()).toBe(false);
    expect(engine.getUnlocked()).toBe(false);
  });

  it("should toggle mute state cleanly", () => {
    expect(engine.getMuted()).toBe(false);
    engine.toggleMute();
    expect(engine.getMuted()).toBe(true);
    engine.toggleMute();
    expect(engine.getMuted()).toBe(false);
  });

  it("should gracefully handle calls when not unlocked without throwing", () => {
    expect(() => {
      engine.playCameraSwitch();
      engine.playFlashlightClick();
      engine.playGlitchStatic(0.1, 0.5);
      engine.playFinalRevealStinger();
      engine.setTension(0.8);
      engine.dispose();
    }).not.toThrow();
  });

  it("should unlock and construct audio graph when AudioContext is present", async () => {
    // Mock Web Audio API
    const mockGainNode = {
      gain: {
        setValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    const mockOscNode = {
      type: "sine",
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockFilterNode = {
      type: "lowpass",
      frequency: {
        setValueAtTime: vi.fn(),
        setTargetAtTime: vi.fn(),
      },
      Q: {
        setValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    class MockAudioContext {
      state = "running";
      currentTime = 10;
      sampleRate = 44100;
      destination = {};
      createGain = vi.fn().mockReturnValue(mockGainNode);
      createOscillator = vi.fn().mockReturnValue(mockOscNode);
      createBiquadFilter = vi.fn().mockReturnValue(mockFilterNode);
      createBuffer = vi.fn().mockReturnValue({
        getChannelData: vi.fn().mockReturnValue(new Float32Array(100)),
      });
      createBufferSource = vi.fn().mockReturnValue({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      });
      resume = vi.fn().mockResolvedValue(undefined);
      close = vi.fn().mockResolvedValue(undefined);
    }

    (globalThis as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;

    const testEngine = new SoundEngine();
    const unlocked = await testEngine.unlock();
    expect(unlocked).toBe(true);
    expect(testEngine.getUnlocked()).toBe(true);

    // Audio methods should execute cleanly with mocked nodes
    expect(() => {
      testEngine.playCameraSwitch();
      testEngine.playFlashlightClick();
      testEngine.playGlitchStatic(0.1, 0.5);
      testEngine.setTension(0.9);
      testEngine.playFinalRevealStinger();
      testEngine.dispose();
    }).not.toThrow();
  });
});
