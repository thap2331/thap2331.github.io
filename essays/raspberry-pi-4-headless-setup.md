---
layout: essay
type: essay
title: "Headless Raspberry Pi 4 Setup on Ubuntu 24: What the Old Guides Get Wrong"
date: 2026-04-30
published: true
labels:
  - Raspberry Pi
  - Linux
  - Networking
  - Ubuntu
  - SSH
author: 'Suraj Thapa'
description: "A practical walkthrough for Bookworm headless setup from Ubuntu 24 — including the pitfalls that make pre-2024 guides fail."
---

## The problem with most Raspberry Pi guides

Search for "headless Raspberry Pi setup" and you'll find dozens of guides. Most of them are wrong — not because the authors made mistakes, but because Raspberry Pi OS changed significantly in 2024 with the Bookworm release, and those guides haven't caught up.

I followed one of those old guides and hit a wall immediately: no default `pi` user, WiFi config that silently did nothing, and SSH that wouldn't connect despite the `ssh` file being present. After working through it hands-on, here's what actually works in 2026.

---

## What changed in Bookworm (and why old guides fail)

<table class="table table-bordered mt-3 mb-3" style="font-size: 0.95rem;">
  <thead>
    <tr>
      <th style="width:50%; background:#f8d7da; color:#842029; border-color:#f5c2c7;">Old method (pre-2024)</th>
      <th style="width:50%; background:#d1e7dd; color:#0a3622; border-color:#badbcc;">New method (Bookworm)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Default user <code>pi</code> with password <code>raspberry</code></td>
      <td>No default user — must create manually</td>
    </tr>
    <tr>
      <td><code>wpa_supplicant.conf</code> for WiFi</td>
      <td><code>nmcli</code> from inside Pi, or <code>network-config</code> cloud-init</td>
    </tr>
    <tr>
      <td><code>ssh</code> file in boot = SSH enabled</td>
      <td>Still works BUT requires <code>userconf.txt</code> too</td>
    </tr>
    <tr>
      <td>rpi-imager handled everything</td>
      <td>rpi-imager snap on Ubuntu has bugs — don't trust it fully</td>
    </tr>
  </tbody>
</table>

The biggest trap: even if rpi-imager reports success, the boot partition may be missing `userconf.txt`. Without it, there's no user account to SSH into, so the connection is refused regardless of whether SSH is enabled.

---

## Hardware needed

- Raspberry Pi 4
- MicroSD card (32GB+)
- USB-C power adapter (5V 3A)
- Ethernet cable (for first boot — bypass WiFi headaches entirely)
- Linux laptop running Ubuntu 24

---

## The setup, step by step

### Install rpi-imager

The snap package is the easiest way to get rpi-imager on Ubuntu 24:

```bash
sudo snap install rpi-imager
```

### Flash the SD card

Insert your microSD card, then open rpi-imager:

```bash
rpi-imager
```

Select **Raspberry Pi OS (64-bit)**, choose your SD card, then click the gear icon ⚙️ and fill in:

- Hostname: `raspberrypi`
- Enable SSH ✓ (password authentication)
- Username: `yourusername`
- Password: `yourpassword`
- WiFi SSID and password
- Country: `US`

Hit **Write** — but don't trust it blindly. The snap version of rpi-imager on Ubuntu has been known to write the image without applying all the custom config. Always verify manually.

### Verify (and fix) the boot partition

After writing, the SD card mounts automatically. Check that both critical files exist:

```bash
# Check SSH file exists
ls /media/$USER/bootfs/ssh

# Check userconf.txt exists and has correct format
cat /media/$USER/bootfs/userconf.txt
```

If the `ssh` file is missing, create it:

```bash
sudo touch /media/$USER/bootfs/ssh
```

If `userconf.txt` is missing or malformed, you need to create it with a properly hashed password. Generate the hash first:

```bash
echo 'yourpassword' | openssl passwd -6 -stdin
```

Then write the file — it must be `username:hashedpassword` on a single line with no extra whitespace:

```bash
sudo nano /media/$USER/bootfs/userconf.txt
# Type: yourusername:$6$hash...
# Ctrl+O, Enter, Ctrl+X to save
```

This step is the one most guides skip, and it's the reason SSH says "Connection refused" even when everything else looks right.

### Unmount safely before pulling the card

```bash
sudo umount /media/$USER/bootfs
sudo umount /media/$USER/rootfs
```

### First boot — use ethernet

**Don't try to get WiFi working on the first boot.** Use an ethernet cable from your router directly to the Pi. This sidesteps a whole class of problems and lets you get a shell quickly, after which WiFi config from inside the Pi is straightforward.

1. Insert the SD card into the Pi
2. Plug in the ethernet cable
3. Plug in power
4. Wait **2 full minutes** — first boot resizes the filesystem and takes longer than subsequent boots

Once it's had time to boot, check that it's on the network:

```bash
ping raspberrypi.local
```

Then SSH in:

```bash
ssh yourusername@raspberrypi.local
```

### Configure WiFi from inside the Pi

Once you have a shell, use `nmcli` to connect to your WiFi network. The key here is using `nmcli con add` rather than `nmcli device wifi connect` — the latter often fails with a cryptic `key-mgmt missing` error:

```bash
# Scan for networks
sudo nmcli device wifi list

# Connect to your network
sudo nmcli con add type wifi ssid "YourNetworkName" \
  con-name "home-wifi" \
  wifi-sec.key-mgmt wpa-psk \
  wifi-sec.psk "YourPassword" \
  ipv4.method auto

sudo nmcli con up "home-wifi"
```

Verify that WiFi got an IP address:

```bash
ip addr show wlan0
```

You should see an IP assigned to `wlan0`. Once confirmed, unplug the ethernet cable and SSH in over WiFi from your laptop:

```bash
ssh yourusername@raspberrypi.local
```

If it connects, you're done.

### Sanity check

```bash
uname -a          # confirms OS version
python3 --version # confirms Python available
ping google.com -c 3  # confirms internet works
```

---

## Troubleshooting

If something doesn't work, this table covers the most common issues:

<table class="table table-bordered mt-3 mb-3" style="font-size: 0.95rem;">
  <thead>
    <tr>
      <th style="width:40%; background:#fff3cd; color:#664d03; border-color:#ffecb5;">Problem</th>
      <th style="width:60%; background:#cfe2ff; color:#084298; border-color:#b6d4fe;">Fix</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>ssh: Could not resolve hostname</code></td>
      <td>Use IP directly: <code>ssh user@192.168.1.x</code></td>
    </tr>
    <tr>
      <td><code>Connection refused</code></td>
      <td>SSH not enabled — create <code>ssh</code> file and <code>userconf.txt</code></td>
    </tr>
    <tr>
      <td>Pi not on network</td>
      <td>Use ethernet first, configure WiFi from inside</td>
    </tr>
    <tr>
      <td>rpi-imager write fails</td>
      <td>Unmount card first: <code>sudo umount /media/$USER/bootfs</code></td>
    </tr>
    <tr>
      <td><code>nmcli</code> WiFi error <code>key-mgmt missing</code></td>
      <td>Use full <code>nmcli con add</code> command above, not <code>nmcli device wifi connect</code></td>
    </tr>
    <tr>
      <td>Can't find Pi IP</td>
      <td>Run <code>sudo nmap -sn 192.168.1.0/24</code> and look for new device</td>
    </tr>
  </tbody>
</table>

---

## Quick reference

- SSH port: `22`
- Default hostname: `raspberrypi.local`
- Username: whatever you set in `userconf.txt`
- No default `pi` user in Bookworm

---

*Written April 2026 based on hands-on setup experience with Raspberry Pi OS Bookworm on Ubuntu 24.*
