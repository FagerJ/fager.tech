---
title: Pairing a power meter that refuses to be found
description: The boring checklist that fixes 90% of dropouts, in the order that actually finds the problem fastest.
pubDate: 2026-03-08
tags: ['Guides', 'Cycling']
difficulty: easy
---

Power meter dropouts are almost never the power meter. They're almost always one of five things, and going through them in this order will find it faster than the order you'd naturally try.

## The checklist

1. **Battery.** Yes, even if you changed it recently, and especially if the pedals have been in a cold garage. A CR2032 that reads fine in a multimeter can still fail under load.
2. **Are you paired twice?** Head unit on ANT+ *and* a training app on Bluetooth will fight over an exclusive Bluetooth connection. ANT+ broadcasts to everything; Bluetooth generally does not. Pair the head unit on ANT+ and let the app have the Bluetooth channel.
3. **Distance and obstruction.** ANT+ is 2.4 GHz and your body is mostly water. A head unit on the bars with pedals below the bottom bracket has your legs in the way for half of every rotation.
4. **Interference.** Trainers, smart lights, a phone doing Wi-Fi calling, and other people's bikes at the start line. If it only drops at races, this is it.
5. **Firmware.** Last, because it's the least likely and the most annoying.

> If it works indoors and fails outdoors, it's placement. If it fails indoors and works outdoors, it's interference. That one distinction resolves most of these.

## The two-minute test

Spin the cranks with the head unit ten centimetres from the pedal. If the signal is rock solid there and drops at bar height, it's item 3 and you need to either re-route or accept a repeater.

## What to do when it's genuinely broken

Calibrate (or zero-offset) before every ride for a week and write down the number. A drifting offset that trends in one direction is a strain gauge going, and no amount of pairing will fix it. A number that jumps around randomly is usually temperature — let the bike sit outside for ten minutes before you zero it.

If the offset is stable and it still drops, it's the battery contact. It's basically always the battery contact.
