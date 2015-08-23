# Makefile for assets

PYTHON=python
SOX=sox
LAME=lame

ASSETS=attack.mp3 baby.mp3 cleaner.mp3 explosion.mp3 hit.mp3 hurt.mp3 love.mp3 parent.mp3 recovery.mp3 satellite.mp3 target.mp3 tame.mp3 washer.mp3 eshock.mp3 steam.mp3

all: $(ASSETS)

clean:
	-$(RM) $(ASSETS)

.SUFFIXES: .png .wav .mp3

.wav.mp3:
	$(SOX) $< -t wav - pad 0 0.5 | $(LAME) - $@
